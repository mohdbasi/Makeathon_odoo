
import { useEffect, useState } from "react";
import api from "../services/api";

function Payments() {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    amount: "",
    paymentMethod: "UPI",
    transactionReference: "",
    notes: ""
  });

  const money = (paise) =>
    `₹${(Number(paise || 0) / 100).toFixed(2)}`;

  const fetchInvoices = async () => {
    try {
      const res = await api.get("/invoices");
      setInvoices(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load invoices.");
    }
  };

  const fetchPayments = async (invoiceId) => {
    if (!invoiceId) {
      setPayments([]);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get(`/payments/${invoiceId}`);
      setPayments(res.data.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load payments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    fetchPayments(selectedInvoice);
  }, [selectedInvoice]);

  const invoice = invoices.find(i => i._id === selectedInvoice);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.post(`/payments/${selectedInvoice}`, {
        amountPaise: Math.round(Number(form.amount) * 100),
        paymentMethod: form.paymentMethod,
        transactionReference: form.transactionReference,
        notes: form.notes
      });

      setMessage("Payment recorded successfully.");
      setForm({
        amount: "",
        paymentMethod: "UPI",
        transactionReference: "",
        notes: ""
      });

      await fetchPayments(selectedInvoice);
      await fetchInvoices();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record payment.");
    }
  };

  return (
    <div className="page-container">
      <h1>Payments Management</h1>
      <p>Record and track invoice payments.</p>

      {error && <p role="alert" style={{ color: "red" }}>{error}</p>}
      {message && <p role="status" style={{ color: "green" }}>{message}</p>}

      <h2>Select Invoice</h2>

      <select value={selectedInvoice} onChange={e => setSelectedInvoice(e.target.value)}>
        <option value="">Choose an invoice</option>
        {invoices.map(i => (
          <option key={i._id} value={i._id}>
            {i.invoiceNumber} - {money(i.totalPaise)} ({i.displayStatus || i.status})
          </option>
        ))}
      </select>

      {invoice && (
        <>
          <h2>Invoice Summary</h2>
          <p>Total: {money(invoice.totalPaise)}</p>
          <p>Paid: {money(invoice.amountPaidPaise)}</p>
          <p>Outstanding: {money(invoice.outstandingPaise)}</p>
          <p>Status: {invoice.displayStatus || invoice.status}</p>

          <h2>Record Payment</h2>

          <form onSubmit={handleSubmit}>
            <label>Payment Amount (₹)</label>
            <input
              type="number"
              min="0.01"
              max={(invoice.outstandingPaise / 100).toFixed(2)}
              step="0.01"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              required
            />

            <select
              value={form.paymentMethod}
              onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
            >
              <option value="CASH">Cash</option>
              <option value="UPI">UPI</option>
              <option value="CARD">Card</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="OTHER">Other</option>
            </select>

            <input
              placeholder="Transaction Reference (optional)"
              value={form.transactionReference}
              onChange={e => setForm({ ...form, transactionReference: e.target.value })}
            />

            <textarea
              placeholder="Notes"
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
            />

            <button
              type="submit"
              disabled={invoice.outstandingPaise <= 0}
            >
              Record Payment
            </button>
          </form>
        </>
      )}

      <h2>Payment History</h2>

      {loading ? <p>Loading payments...</p> : (
        <table>
          <thead>
            <tr>
              <th>Payment Date</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Transaction Reference</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p._id}>
                <td>{p.paymentDate ? new Date(p.paymentDate).toLocaleString() : "N/A"}</td>
                <td>{money(p.amountPaise)}</td>
                <td>{p.paymentMethod}</td>
                <td>{p.transactionReference || "N/A"}</td>
              </tr>
            ))}
            {payments.length === 0 && !loading && (
              <tr><td colSpan="4">No payments found for this invoice.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Payments;
