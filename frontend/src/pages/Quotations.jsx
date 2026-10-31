
import { useEffect, useState } from "react";
import api from "../services/api";

function Quotations() {
  const [quotations, setQuotations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const emptyForm = {
    customerId: "",
    planId: "",
    quantity: 1,
    discount: 0,
    tax: 0,
    validUntil: "",
    notes: ""
  };

  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [q, c, p] = await Promise.all([
        api.get("/quotations"),
        api.get("/customers"),
        api.get("/plans")
      ]);

      setQuotations(q.data.data || []);
      setCustomers(c.data.data || []);
      setPlans(p.data.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.post("/quotations", {
        customerId: form.customerId,
        items: [{
          planId: form.planId,
          quantity: Number(form.quantity)
        }],
        discount: Number(form.discount),
        tax: Number(form.tax),
        validUntil: form.validUntil,
        notes: form.notes
      });

      setMessage("Quotation created successfully.");
      setForm(emptyForm);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create quotation.");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/quotations/${id}/status`, { status });
      setMessage("Quotation status updated.");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status.");
    }
  };

  return (
    <div className="page-container">
      <h1>Quotations Management</h1>
      <p>Create and manage customer quotations.</p>

      {error && <p role="alert" style={{ color: "red" }}>{error}</p>}
      {message && <p role="status" style={{ color: "green" }}>{message}</p>}

      <h2>Create Quotation</h2>

      <form onSubmit={handleCreate}>
        <select name="customerId" value={form.customerId} onChange={handleChange} required>
          <option value="">Select Customer</option>
          {customers.map(c => (
            <option key={c._id} value={c._id}>{c.name || c.email}</option>
          ))}
        </select>

        <select name="planId" value={form.planId} onChange={handleChange} required>
          <option value="">Select Plan</option>
          {plans.map(p => (
            <option key={p._id} value={p._id}>{p.name} - {p.price}</option>
          ))}
        </select>

        <input name="quantity" type="number" min="1" value={form.quantity} onChange={handleChange} required />
        <input name="discount" type="number" min="0" value={form.discount} onChange={handleChange} placeholder="Discount" />
        <input name="tax" type="number" min="0" value={form.tax} onChange={handleChange} placeholder="Tax (%)" />
        <label>Valid Until</label>
        <input name="validUntil" type="date" value={form.validUntil} onChange={handleChange} required />
        <textarea name="notes" placeholder="Notes" value={form.notes} onChange={handleChange} />

        <button type="submit">Create Quotation</button>
      </form>

      <h2>All Quotations</h2>
      <button onClick={fetchData}>Refresh</button>

      {loading ? <p>Loading quotations...</p> : (
        <table>
          <thead>
            <tr>
              <th>Quotation Number</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Expiry</th>
              <th>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {quotations.map(q => (
              <tr key={q._id}>
                <td>{q.quotationNumber}</td>
                <td>{q.customerId?.name || q.customerId?.email || "N/A"}</td>
                <td>{q.currency} {q.totalAmount}</td>
                <td>{q.status}</td>
                <td>{q.validUntil ? new Date(q.validUntil).toLocaleDateString() : "N/A"}</td>
                <td>
                  <select value={q.status} onChange={e => updateStatus(q._id, e.target.value)}>
                    {["draft", "sent", "accepted", "rejected", "expired"].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Quotations;
