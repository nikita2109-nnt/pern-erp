import { useEffect, useState } from "react";
import axios from "axios";

function Dispatch() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
const [success, setSuccess] = useState("");
const [vehicleNumber, setVehicleNumber] = useState("");
const [driverName, setDriverName] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          "http://localhost:5000/api/orders",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setOrders(response.data.orders || []);
      } catch (err) {
        setError("Failed to load sales orders");
      }
    };

    fetchOrders();
  }, []);
const handleCreateDispatch = async (e) => {
  e.preventDefault();

  if (!selectedOrder) {
    setError("Please select a sales order.");
    return;
  }

  const confirmed = window.confirm(
    "Dispatch this order? Physical stock will be deducted."
  );

  if (!confirmed) return;

  setSaving(true);
  setError("");
  setSuccess("");

  try {
    const token = localStorage.getItem("token");

    await axios.post(
      "http://localhost:5000/api/dispatches",
      {
  sales_order_id: Number(selectedOrder),
  vehicle_number: vehicleNumber.trim(),
  driver_name: driverName.trim()
},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setSuccess("Order dispatched successfully!");
    setSelectedOrder("");

    // Refresh orders so the dispatched order disappears
    // from the confirmed orders dropdown.
    const response = await axios.get(
      "http://localhost:5000/api/orders",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setOrders(response.data.orders || []);
  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Failed to create dispatch"
    );
  } finally {
    setSaving(false);
  }
};
  return (
    <div>
      <h2>Dispatch Management</h2>
      <p>Dispatch confirmed customer sales orders.</p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="page-placeholder">
  <h3>Create Dispatch</h3>

  <form onSubmit={handleCreateDispatch}>
  <div className="customer-form">
    <select
      value={selectedOrder}
      onChange={(e) => setSelectedOrder(e.target.value)}
      required
    >
      <option value="">Select Confirmed Sales Order</option>

      {orders
        .filter((order) => order.status === "CONFIRMED")
        .map((order) => (
          <option key={order.id} value={order.id}>
            {order.order_number} - {order.customer_name}
          </option>
        ))}
    </select>

    {/* These inputs must be OUTSIDE the select */}
    <input
      type="text"
      placeholder="Vehicle Number"
      value={vehicleNumber}
      onChange={(e) => setVehicleNumber(e.target.value)}
      required
    />

    <input
      type="text"
      placeholder="Driver Name"
      value={driverName}
      onChange={(e) => setDriverName(e.target.value)}
    />
  </div>

  <button
    type="submit"
    disabled={saving || !selectedOrder}
  >
    {saving ? "Dispatching..." : "Create Dispatch"}
  </button>
</form>

  {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
    </div>
  );
}

export default Dispatch;