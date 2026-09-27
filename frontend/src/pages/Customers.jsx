
import { useEffect, useState } from "react";
import axios from "axios";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
  company_name: "",
  contact_person: "",
  mobile: "",
  email: "",
  city: ""
});

const [saving, setSaving] = useState(false);
const [success, setSuccess] = useState("");
const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData((previous) => ({
    ...previous,
    [name]: value
  }));
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");
  setSaving(true);

  try {
    const token = localStorage.getItem("token");

    await axios.post(
      "http://localhost:5000/api/customers",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setSuccess("Customer created successfully!");

    // Fetch the updated customer list from PostgreSQL
const updatedResponse = await axios.get(
  "http://localhost:5000/api/customers",
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);

setCustomers(
  Array.isArray(updatedResponse.data)
    ? updatedResponse.data
    : updatedResponse.data.customers || []
);

    setFormData({
      company_name: "",
      contact_person: "",
      mobile: "",
      email: "",
      city: ""
    });
  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Failed to create customer"
    );
  } finally {
    setSaving(false);
  }
};
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

        // Supports either an array or { customers: [...] }
        setCustomers(
          Array.isArray(response.data)
            ? response.data
            : response.data.customers || []
        );
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load customers"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <div>
      <h2>Customer Management</h2>
      <p>View your registered customers.</p>

      <form onSubmit={handleSubmit} className="page-placeholder">
  <h3>Add New Customer</h3>

  <div className="customer-form">
    <input
      type="text"
      name="company_name"
      placeholder="Company Name"
      value={formData.company_name}
      onChange={handleChange}
      required
    />

    <input
      type="text"
      name="contact_person"
      placeholder="Contact Person"
      value={formData.contact_person}
      onChange={handleChange}
      required
    />

    <input
      type="tel"
      name="mobile"
      placeholder="Mobile Number"
      value={formData.mobile}
      onChange={handleChange}
      required
    />

    <input
      type="email"
      name="email"
      placeholder="Email Address"
      value={formData.email}
      onChange={handleChange}
    />

    <input
      type="text"
      name="city"
      placeholder="City"
      value={formData.city}
      onChange={handleChange}
    />

    <button type="submit" disabled={saving}>
      {saving ? "Saving..." : "Add Customer"}
    </button>
  </div>

  {success && <p style={{ color: "green" }}>{success}</p>}
</form>

      {loading && <p>Loading customers...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
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
                <th>Company</th>
                <th>Contact Person</th>
                <th>Mobile</th>
                <th>Email</th>
                <th>City</th>
              </tr>
            </thead>

            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.company_name}</td>
                  <td>{customer.contact_person}</td>
                  <td>{customer.mobile}</td>
                  <td>{customer.email}</td>
                  <td>{customer.city}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {customers.length === 0 && <p>No customers found.</p>}
        </div>
      )}
    </div>
  );
}

export default Customers;