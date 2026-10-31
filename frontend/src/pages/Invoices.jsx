
import { useEffect, useState } from "react";
import api from "../services/api";

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const emptyForm = {
    customerId: "",
    subscriptionId: "",
    description: "",
    quantity: 1,
    unitPrice: "",
    tax: 0,
    discount: 0,
    dueDate: "",
    notes: ""
  };

  const [form, setForm] = useState(emptyForm);

  const money = (paise) =>
    `₹${(Number(paise || 0) / 100).toFixed(2)}`;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [i, c] = await Promise.all([
        api.get("/invoices"),
        api.get("/customers")
      ]);

      setInvoices(i.data.data || []);
      setCustomers(c.data.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load invoices.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const unitPricePaise = Math.round(Number(form.unitPrice) * 100);

      await api.post("/invoices", {
        customerId: form.customerId,
        subscriptionId: form.subscriptionId || undefined,
        items: [{
          description: form.description,
          quantity: Number(form.quantity),
          unitPricePaise,
          taxRateBps: Math.round(Number(form.tax) * 100)
        }],
        discountPaise: Math.round(Number(form.discount) * 100),
        dueDate: form.dueDate,
        notes: form.notes
      });

      setMessage("Invoice created successfully.");
      setForm(emptyForm);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create invoice.");
    }
  };

  return (
    <div className="page-container">
      <h1>Invoices Management</h1>
      <p>Create and track customer invoices.</p>

      {error && <p role="alert" style={{ color: "red" }}>{error}</p>}
      {message && <p role="status" style={{ color: "green" }}>{message}</p>}

      <h2>Create Invoice</h2>

      <form onSubmit={handleCreate}>
        <select name="customerId" value={form.customerId} onChange={e => setForm({ ...form, customerId: e.target.value })} required>
          <option value="">Select Customer</option>
          {customers.map(c => (
            <option key={c._id} value={c._id}>{c.name || c.email}</option>
          ))}
        </select>

        <input placeholder="Subscription ID (optional)" value={form.subscriptionId} onChange={e => setForm({ ...form, subscriptionId: e.target.value })} />
        <input placeholder="Item Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
        <input type="number" min="1" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required />
        <input type="number" min="0" step="0.01" placeholder="Unit Price (₹)" value={form.unitPrice} onChange={e => setForm({ ...form, unitPrice: e.target.value })} required />
        <input type="number" min="0" max="100" step="0.01" placeholder="Tax (%)" value={form.tax} onChange={e => setForm({ ...form, tax: e.target.value })} />
        <input type="number" min="0" step="0.01" placeholder="Discount (₹)" value={form.discount} onChange={e => setForm({ ...form, discount: e.target.value })} />
        <label>Due Date</label>
        <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} required />
        <textarea placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />

        <button type="submit">Create Invoice</button>
      </form>

      <h2>All Invoices</h2>
      <button onClick={fetchData}>Refresh</button>

      {loading ? <p>Loading invoices...</p> : (
        <table>
          <thead>
            <tr>
              <th>Invoice Number</th>
              <th>Customer ID</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Outstanding</th>
              <th>Status</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(i => (
              <tr key={i._id}>
                <td>{i.invoiceNumber}</td>
                <td>{i.customerId}</td>
                <td>{money(i.totalPaise)}</td>
                <td>{money(i.amountPaidPaise)}</td>
                <td>{money(i.outstandingPaise)}</td>
                <td>{i.displayStatus || i.status}</td>
                <td>{new Date(i.dueDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Invoices;
