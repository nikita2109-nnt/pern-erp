import { useEffect, useState } from "react";
import axios from "axios";

function SalesOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [quotations, setQuotations] = useState([]);
const [selectedQuotation, setSelectedQuotation] = useState("");
const [saving, setSaving] = useState(false);
const [success, setSuccess] = useState("");

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

        setOrders(
          Array.isArray(response.data)
            ? response.data
            : response.data.orders || []
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load sales orders"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
  const fetchAcceptedQuotations = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/quotations",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.quotations || [];

      setQuotations(
        data.filter(
          (quotation) => quotation.status === "ACCEPTED"
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load accepted quotations"
      );
    }
  };

  fetchAcceptedQuotations();
}, []);


const handleCreateOrder = async (e) => {
  e.preventDefault();

  if (!selectedQuotation) {
    setError("Please select a quotation.");
    return;
  }

  setSaving(true);
  setError("");
  setSuccess("");

  try {
    const token = localStorage.getItem("token");

    await axios.post(
      "http://localhost:5000/api/orders",
      {
        quotation_id: Number(selectedQuotation)
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setSuccess("Sales order created successfully!");
    setSelectedQuotation("");

    // Reload the orders table
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
        "Failed to create sales order"
    );
  } finally {
    setSaving(false);
  }
};

const handleConfirmOrder = async (orderId) => {
  const confirmed = window.confirm(
    "Confirm this sales order and reserve inventory?"
  );

  if (!confirmed) return;

  setError("");
  setSuccess("");

  try {
    const token = localStorage.getItem("token");

    await axios.patch(
      `http://localhost:5000/api/orders/${orderId}/confirm`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    // Reload orders to display the updated status
    const response = await axios.get(
      "http://localhost:5000/api/orders",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setOrders(response.data.orders || []);
    setSuccess("Sales order confirmed and inventory reserved!");
  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Failed to confirm sales order"
    );
  }
};
  return (
    <div>
      <h2>Sales Order Management</h2>
      <p>View and manage customer sales orders.</p>

      <form
  className="page-placeholder"
  onSubmit={handleCreateOrder}
>

  <h3>Create New Sales Order</h3>

  <div className="customer-form">
    <select
      value={selectedQuotation}
      onChange={(e) => setSelectedQuotation(e.target.value)}
      required
    >
      <option value="">Select Accepted Quotation</option>

      {quotations
        .filter(
          (quotation) =>
            !orders.some(
              (order) =>
                Number(order.quotation_id) === Number(quotation.id)
            )
        )
        .map((quotation) => (
          <option key={quotation.id} value={quotation.id}>
            {quotation.quotation_number} -{" "}
            {quotation.customer_name} - ₹
            {Number(quotation.grand_total).toLocaleString("en-IN")}
          </option>
        ))}
    </select>
    <button
  type="submit"
  disabled={saving || !selectedQuotation}
>
  {saving ? "Creating..." : "Create Sales Order"}
</button>

{success && (
  <p style={{ color: "green" }}>{success}</p>
)}
  </div>
</form>

      {loading && <p>Loading sales orders...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <div className="page-placeholder">
          <table className="quotation-table">
            <thead>
              <tr>
                <th>Order No.</th>
                <th>Customer</th>
                <th>Order Date</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.order_number}</td>
                  <td>{order.customer_name}</td>
                  <td>{order.order_date?.slice(0, 10)}</td>
                  <td>
                    ₹{Number(order.total_amount).toLocaleString("en-IN")}
                  </td>
                  <td>{order.status}</td>
                  <td>
  {order.status === "PENDING" && (
    <button
      type="button"
      onClick={() => handleConfirmOrder(order.id)}
    >
      Confirm Order
    </button>
  )}
</td>
                </tr>
              ))}
            </tbody>
          </table>

          {orders.length === 0 && (
            <p>No sales orders found.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default SalesOrders;