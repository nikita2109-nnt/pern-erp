
import { useEffect, useState } from "react";
import axios from "axios";

function Quotations() {
  // State for existing quotations
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State for creating a quotation
  const [enquiries, setEnquiries] = useState([]);
  const [quotationItems, setQuotationItems] = useState([]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    enquiry_id: "",
    valid_until: ""
  });

  // Reusable function for authenticated API requests
  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`
  });

  // Fetch existing quotations
  const fetchQuotations = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/quotations",
        { headers: getHeaders() }
      );

      setQuotations(
        Array.isArray(response.data)
          ? response.data
          : response.data.quotations || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load quotations"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch enquiries that are eligible for quotations
  const fetchEnquiries = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/enquiries",
        { headers: getHeaders() }
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.enquiries || [];

      setEnquiries(
        data.filter((enquiry) => enquiry.status === "NEW")
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load enquiries"
      );
    }
  };

  // Load data when the component opens
  useEffect(() => {
    fetchQuotations();
    fetchEnquiries();
  }, []);

  // Load products belonging to the selected enquiry
  const handleEnquiryChange = async (enquiryId) => {
    setFormData((previous) => ({
      ...previous,
      enquiry_id: enquiryId
    }));

    setQuotationItems([]);
    setError("");
    setSuccess("");

    if (!enquiryId) return;

    try {
      const response = await axios.get(
        `http://localhost:5000/api/enquiries/${enquiryId}`,
        { headers: getHeaders() }
      );

      const items = response.data.items.map((item) => ({
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: Number(item.quantity),
        unit_price: Number(item.base_price),
        discount_percent: 0,
        gst_percent: 18
      }));

      setQuotationItems(items);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load enquiry products"
      );
    }
  };

  // Update the price, discount or GST for one product
  const handlePriceChange = (index, field, value) => {
    setQuotationItems((previous) =>
      previous.map((item, i) =>
        i === index
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  // Calculate the total for a single product
  const calculateLineTotal = (item) => {
    const subtotal =
      Number(item.quantity) * Number(item.unit_price);

    const afterDiscount =
      subtotal *
      (1 - Number(item.discount_percent) / 100);

    return (
      afterDiscount *
      (1 + Number(item.gst_percent) / 100)
    );
  };

  // Calculate the grand total for all products
  const grandTotal = quotationItems.reduce(
    (total, item) => total + calculateLineTotal(item),
    0
  );

  // Format amounts in Indian currency
  const formatCurrency = (amount) =>
    Number(amount).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR"
    });

  // Create a new quotation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (quotationItems.length === 0) {
      setError("Please select an enquiry with products.");
      return;
    }

    const invalidItem = quotationItems.some((item) => {
      const price = Number(item.unit_price);
      const discount = Number(item.discount_percent);
      const gst = Number(item.gst_percent);

      return (
        item.unit_price === "" ||
        item.discount_percent === "" ||
        item.gst_percent === "" ||
        !Number.isFinite(price) ||
        !Number.isFinite(discount) ||
        !Number.isFinite(gst) ||
        price < 0 ||
        discount < 0 ||
        discount > 100 ||
        gst < 0 ||
        gst > 100
      );
    });

    if (invalidItem) {
      setError(
        "Enter valid prices, discounts and GST percentages."
      );
      return;
    }

    setSaving(true);

    try {
      await axios.post(
        "http://localhost:5000/api/quotations",
        {
          enquiry_id: Number(formData.enquiry_id),
          valid_until: formData.valid_until,
          items: quotationItems.map((item) => ({
            product_id: Number(item.product_id),
            quantity: Number(item.quantity),
            unit_price: Number(item.unit_price),
            discount_percent: Number(item.discount_percent),
            gst_percent: Number(item.gst_percent)
          }))
        },
        { headers: getHeaders() }
      );

      setFormData({
        enquiry_id: "",
        valid_until: ""
      });

      setQuotationItems([]);

      // Refresh the table and available enquiries
      await Promise.all([
        fetchQuotations(),
        fetchEnquiries()
      ]);

      setSuccess("Quotation created successfully!");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create quotation"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAcceptQuotation = async (quotationId) => {
  const confirmed = window.confirm(
    "Are you sure you want to accept this quotation?"
  );

  if (!confirmed) return;

  try {
    setError("");
    setSuccess("");

    await axios.patch(
      `http://localhost:5000/api/quotations/${quotationId}/accept`,
      {},
      { headers: getHeaders() }
    );

    await fetchQuotations();
    setSuccess("Quotation accepted successfully!");
  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Failed to accept quotation"
    );
  }
};

  return (
    <div>
      <h2>Quotation Management</h2>
      <p>View and manage customer quotations.</p>

      {/* Create quotation form */}
      <form
        className="page-placeholder"
        onSubmit={handleSubmit}
      >
        <h3>Create New Quotation</h3>

        <div className="customer-form">
          <div>
            <label htmlFor="enquiry">
              Select Enquiry
            </label>

            <select
              id="enquiry"
              value={formData.enquiry_id}
              onChange={(e) =>
                handleEnquiryChange(e.target.value)
              }
              required
            >
              <option value="">Select Enquiry</option>

              {enquiries.map((enquiry) => (
                <option
                  key={enquiry.id}
                  value={enquiry.id}
                >
                  {enquiry.enquiry_number} -{" "}
                  {enquiry.customer_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="validUntil">
              Valid Until
            </label>

            <input
              id="validUntil"
              type="date"
              min={new Date().toLocaleDateString("en-CA")}
              value={formData.valid_until}
              onChange={(e) =>
                setFormData((previous) => ({
                  ...previous,
                  valid_until: e.target.value
                }))
              }
              required
            />
          </div>
        </div>

        {/* Pricing table */}
        {quotationItems.length > 0 && (
          <>
            <h3>Quotation Products</h3>

            <div style={{ overflowX: "auto" }}>
              <table className="quotation-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Unit Price (₹)</th>
                    <th>Discount (%)</th>
                    <th>GST (%)</th>
                    <th>Line Total (₹)</th>
                  </tr>
                </thead>

                <tbody>
                  {quotationItems.map((item, index) => (
                    <tr key={item.product_id}>
                      <td>{item.product_name}</td>

                      <td>{item.quantity}</td>

                      {[
                        "unit_price",
                        "discount_percent",
                        "gst_percent"
                      ].map((field) => (
                        <td key={field}>
                          <input
                            type="number"
                            min="0"
                            max={
                              field === "unit_price"
                                ? undefined
                                : 100
                            }
                            step="0.01"
                            value={item[field]}
                            onChange={(e) =>
                              handlePriceChange(
                                index,
                                field,
                                e.target.value
                              )
                            }
                            required
                          />
                        </td>
                      ))}

                      <td>
                        {formatCurrency(
                          calculateLineTotal(item)
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Grand total */}
            <div className="quotation-grand-total">
              <h3>
                Grand Total:{" "}
                {formatCurrency(grandTotal)}
              </h3>
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                marginTop: "16px",
                padding: "12px 20px",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              {saving
                ? "Creating..."
                : "Create Quotation"}
            </button>
          </>
        )}

        {success && (
          <p style={{ color: "green" }}>
            {success}
          </p>
        )}
      </form>

      {loading && <p>Loading quotations...</p>}

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {/* Existing quotations table */}
      {!loading && (
        <div className="page-placeholder">
          <h3>Existing Quotations</h3>

          <div style={{ overflowX: "auto" }}>
            <table className="quotation-table">
              <thead>
                <tr>
                  <th>Quotation No.</th>
                  <th>Customer</th>
                  <th>Quotation Date</th>
                  <th>Valid Until</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {quotations.map((quotation) => (
                  <tr key={quotation.id}>
                    
                    <td>
                      {quotation.quotation_number}
                    </td>

                    <td>
                      {quotation.customer_name}
                    </td>

                    <td>
                      {quotation.quotation_date?.slice(0, 10)}
                    </td>

                    <td>
                      {quotation.valid_until?.slice(0, 10)}
                    </td>

                    <td>
                      {formatCurrency(
                        quotation.grand_total
                      )}
                    </td>

                    <td>{quotation.status}</td>
                    <td>
  {quotation.status === "DRAFT" && (
    <button
      type="button"
      onClick={() => handleAcceptQuotation(quotation.id)}
    >
      Accept
    </button>
  )}
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {quotations.length === 0 && (
            <p>No quotations found.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Quotations;