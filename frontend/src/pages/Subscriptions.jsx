
import { useEffect, useState } from "react";
import api from "../services/api";

function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    quotationId: "",
    planId: "",
    startDate: "",
    autoRenew: true
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [s, q] = await Promise.all([
        api.get("/subscriptions"),
        api.get("/quotations")
      ]);

      setSubscriptions(s.data.data || []);
      setQuotations(q.data.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load subscriptions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const acceptedQuotations = quotations.filter(q => q.status === "accepted");

  const selectedQuotation = quotations.find(q => q._id === form.quotationId);

  const createSubscription = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.post("/subscriptions", {
        quotationId: form.quotationId,
        planId: form.planId,
        startDate: form.startDate || undefined,
        autoRenew: form.autoRenew
      });

      setMessage("Subscription created successfully.");
      setForm({ quotationId: "", planId: "", startDate: "", autoRenew: true });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create subscription.");
    }
  };

  const performAction = async (id, action) => {
    try {
      await api.patch(`/subscriptions/${id}/${action}`);
      setMessage(`Subscription ${action} successful.`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} subscription.`);
    }
  };

  return (
    <div className="page-container">
      <h1>Subscriptions Management</h1>
      <p>Monitor and manage customer subscriptions.</p>

      {error && <p role="alert" style={{ color: "red" }}>{error}</p>}
      {message && <p role="status" style={{ color: "green" }}>{message}</p>}

      <h2>Create Subscription</h2>

      <form onSubmit={createSubscription}>
        <select
          value={form.quotationId}
          onChange={e => setForm({ ...form, quotationId: e.target.value, planId: "" })}
          required
        >
          <option value="">Select Accepted Quotation</option>
          {acceptedQuotations.map(q => (
            <option key={q._id} value={q._id}>{q.quotationNumber}</option>
          ))}
        </select>

        <select
          value={form.planId}
          onChange={e => setForm({ ...form, planId: e.target.value })}
          required
          disabled={!selectedQuotation}
        >
          <option value="">Select Plan in Quotation</option>
          {selectedQuotation?.items?.map(item => (
            <option key={item.planId?._id || item.planId} value={item.planId?._id || item.planId}>
              {item.planId?.name || "Plan"}
            </option>
          ))}
        </select>

        <label>Start Date (optional)</label>
        <input
          type="date"
          value={form.startDate}
          onChange={e => setForm({ ...form, startDate: e.target.value })}
        />

        <label>
          <input
            type="checkbox"
            checked={form.autoRenew}
            onChange={e => setForm({ ...form, autoRenew: e.target.checked })}
          />
          Auto Renew
        </label>

        <button type="submit">Create Subscription</button>
      </form>

      <h2>All Subscriptions</h2>
      <button onClick={fetchData}>Refresh</button>

      {loading ? <p>Loading subscriptions...</p> : (
        <table>
          <thead>
            <tr>
              <th>Subscription No.</th>
              <th>Customer</th>
              <th>Plan</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Next Billing</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map(s => (
              <tr key={s._id}>
                <td>{s.subscriptionNumber}</td>
                <td>{s.customerId?.name || "N/A"}</td>
                <td>{s.planId?.name || "N/A"}</td>
                <td>{s.currency} {s.amount}</td>
                <td>{s.status}</td>
                <td>{s.nextBillingDate ? new Date(s.nextBillingDate).toLocaleDateString() : "N/A"}</td>
                <td>
                  {s.status === "active" && (
                    <>
                      <button onClick={() => performAction(s._id, "pause")}>Pause</button>
                      <button onClick={() => performAction(s._id, "cancel")}>Cancel</button>
                      <button onClick={() => performAction(s._id, "renew")}>Renew</button>
                    </>
                  )}
                  {s.status === "paused" && (
                    <button onClick={() => performAction(s._id, "resume")}>Resume</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Subscriptions;
