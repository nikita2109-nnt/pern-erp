import { useEffect, useState } from "react";
import axios from "axios";

function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          "http://localhost:5000/api/inventory",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setInventory(
          Array.isArray(response.data)
            ? response.data
            : response.data.inventory || []
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load inventory"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  return (
    <div>
      <h2>Inventory Management</h2>
      <p>Monitor product stock and availability.</p>

      {loading && <p>Loading inventory...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <div className="page-placeholder">
          <table className="quotation-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Product Code</th>
                <th>Physical Stock</th>
                <th>Reserved Stock</th>
                <th>Available Stock</th>
              </tr>
            </thead>

            <tbody>
              {inventory.map((item) => (
                <tr key={item.product_id}>
                  <td>{item.product_name}</td>
                  <td>{item.product_code}</td>
                  <td>{item.physical_quantity}</td>
                  <td>{item.reserved_quantity}</td>
                  <td>
                    {Number(item.physical_quantity) -
                      Number(item.reserved_quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {inventory.length === 0 && (
            <p>No inventory records found.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Inventory;