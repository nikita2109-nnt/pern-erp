import { useEffect, useState } from "react";
import axios from "axios";

function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [customers, setCustomers] = useState([]);

const [formData, setFormData] = useState({
  customer_id: "",
  required_date: "",
  notes: ""
});

const [products, setProducts] = useState([]);

const [enquiryItems, setEnquiryItems] = useState([
  { product_id: "", quantity: 1 }
]);

const [saving, setSaving] = useState(false);
const [success, setSuccess] = useState("");
  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          "http://localhost:5000/api/enquiries",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setEnquiries(
          Array.isArray(response.data)
            ? response.data
            : response.data.enquiries || []
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load enquiries"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEnquiries();
  }, []);

  useEffect(() => {
  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/customers",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setCustomers(
        Array.isArray(response.data)
          ? response.data
          : response.data.customers || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load customers"
      );
    }
  };

  fetchCustomers();
}, []);

useEffect(() => {
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/products",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setProducts(
        Array.isArray(response.data)
          ? response.data
          : response.data.products || []
      );
    } catch (err) {
      console.error("Failed to load products:", err);
    }
  };

  fetchProducts();
}, []);

const handleItemChange = (index, field, value) => {
  const updatedItems = [...enquiryItems];

  updatedItems[index] = {
    ...updatedItems[index],
    [field]: value
  };

  setEnquiryItems(updatedItems);
};

const addItem = () => {
  setEnquiryItems([
    ...enquiryItems,
    { product_id: "", quantity: 1 }
  ]);
};
const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");

  // Check whether the same product was selected twice
  const productIds = enquiryItems.map(
    (item) => item.product_id
  );

  if (new Set(productIds).size !== productIds.length) {
    setError("Please select each product only once.");
    return;
  }

  setSaving(true);

  try {
    const token = localStorage.getItem("token");

    await axios.post(
      "http://localhost:5000/api/enquiries",
      {
        customer_id: Number(formData.customer_id),
        required_date: formData.required_date,
        notes: formData.notes,
        items: enquiryItems.map((item) => ({
          product_id: Number(item.product_id),
          quantity: Number(item.quantity)
        }))
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    // Reload enquiries to show the newly created record
    const response = await axios.get(
      "http://localhost:5000/api/enquiries",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setEnquiries(
      Array.isArray(response.data)
        ? response.data
        : response.data.enquiries || []
    );

    setFormData({
      customer_id: "",
      required_date: "",
      notes: ""
    });

    setEnquiryItems([
      { product_id: "", quantity: 1 }
    ]);

    setSuccess("Enquiry created successfully!");
  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Failed to create enquiry"
    );
  } finally {
    setSaving(false);
  }
};

  return (
    <div>
      <h2>Enquiry Management</h2>
      <p>View and manage customer enquiries.</p>
        <form
  className="page-placeholder"
  onSubmit={handleSubmit}
>
  <h3>Create New Enquiry</h3>

  <div className="customer-form">
    <select
      value={formData.customer_id}
      onChange={(e) =>
        setFormData({
          ...formData,
          customer_id: e.target.value
        })
      }
      required
    >
      <option value="">Select Customer</option>

      {customers.map((customer) => (
        <option key={customer.id} value={customer.id}>
          {customer.company_name}
        </option>
      ))}
    </select>

    <input
      type="date"
      value={formData.required_date}
      onChange={(e) =>
        setFormData({
          ...formData,
          required_date: e.target.value
        })
      }
      required
    />

    <textarea
      placeholder="Enquiry Notes"
      value={formData.notes}
      onChange={(e) =>
        setFormData({
          ...formData,
          notes: e.target.value
        })
      }
      rows="3"
    />
  </div>
  <h3>Enquiry Products</h3>

{enquiryItems.map((item, index) => (
  <div className="customer-form" key={index}>
    <select
      value={item.product_id}
      onChange={(e) =>
        handleItemChange(index, "product_id", e.target.value)
      }
      required
    >
      <option value="">Select Product</option>

      {products.map((product) => (
        <option key={product.id} value={product.id}>
          {product.product_name} ({product.product_code})
        </option>
      ))}
    </select>

    <input
      type="number"
      min="1"
      value={item.quantity}
      onChange={(e) =>
        handleItemChange(index, "quantity", e.target.value)
      }
      required
    />
  </div>
))}

<button type="button" onClick={addItem}>
  + Add Another Product
</button>
<button type="submit" disabled={saving}>
  {saving ? "Creating..." : "Create Enquiry"}
</button>

{success && (
  <p style={{ color: "green" }}>{success}</p>
)}
</form>
      {loading && <p>Loading enquiries...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading &&  (
        <div className="page-placeholder">
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left"
            }}
          >
            <thead>
              <tr>
                <th>Enquiry No.</th>
                <th>Customer</th>
                <th>Enquiry Date</th>
                <th>Required Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {enquiries.map((enquiry) => (
                <tr key={enquiry.id}>
                  <td>{enquiry.enquiry_number}</td>
                  <td>{enquiry.customer_name}</td>
                  <td>{enquiry.enquiry_date?.slice(0, 10)}</td>
                  <td>{enquiry.required_date?.slice(0, 10)}</td>
                  <td>{enquiry.status}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {enquiries.length === 0 && (
            <p>No enquiries found.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Enquiries;