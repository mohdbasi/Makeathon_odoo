
import { useEffect, useState } from "react";
import api from "../services/api";

function Plans() {
  const [plans, setPlans] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    productId: "",
    name: "",
    description: "",
    price: "",
    currency: "INR",
    billingCycle: "monthly",
    trialDays: 0,
    setupFee: 0
  };

  const [form, setForm] = useState(emptyForm);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await api.get("/plans");
      setPlans(res.data.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load plans.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data.data || []);
    } catch (err) {
      console.error("Failed to load products", err);
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        trialDays: Number(form.trialDays),
        setupFee: Number(form.setupFee)
      };

      if (editingId) {
        await api.put(`/plans/${editingId}`, payload);
        setMessage("Plan updated successfully.");
      } else {
        await api.post("/plans", payload);
        setMessage("Plan created successfully.");
      }

      setForm(emptyForm);
      setEditingId(null);
      fetchPlans();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed.");
    }
  };

  const handleEdit = (plan) => {
    setEditingId(plan._id);
    setForm({
      productId: plan.productId?._id || "",
      name: plan.name || "",
      description: plan.description || "",
      price: plan.price ?? "",
      currency: plan.currency || "INR",
      billingCycle: plan.billingCycle || "monthly",
      trialDays: plan.trialDays ?? 0,
      setupFee: plan.setupFee ?? 0
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Deactivate this plan?")) return;

    try {
      await api.delete(`/plans/${id}`);
      setMessage("Plan deactivated successfully.");
      fetchPlans();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to deactivate plan.");
    }
  };

  return (
    <div className="page-container">
      <h1>Plans Management</h1>
      <p>Create and manage subscription plans.</p>

      {error && <p role="alert" style={{ color: "red" }}>{error}</p>}
      {message && <p role="status" style={{ color: "green" }}>{message}</p>}

      <h2>{editingId ? "Edit Plan" : "Create New Plan"}</h2>

      <form onSubmit={handleSubmit}>
        <select name="productId" value={form.productId} onChange={handleChange} required disabled={!!editingId}>
          <option value="">Select Product</option>
          {products.map(product => (
            <option key={product._id} value={product._id}>
              {product.name}
            </option>
          ))}
        </select>

        <input name="name" placeholder="Plan Name" value={form.name} onChange={handleChange} required />
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        <input name="price" type="number" min="0" step="0.01" placeholder="Price" value={form.price} onChange={handleChange} required />

        <select name="billingCycle" value={form.billingCycle} onChange={handleChange}>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="yearly">Yearly</option>
        </select>

        <input name="currency" value={form.currency} onChange={handleChange} placeholder="Currency" />
        <input name="trialDays" type="number" min="0" placeholder="Trial Days" value={form.trialDays} onChange={handleChange} />
        <input name="setupFee" type="number" min="0" step="0.01" placeholder="Setup Fee" value={form.setupFee} onChange={handleChange} />

        <button type="submit">{editingId ? "Update Plan" : "Create Plan"}</button>
        {editingId && (
          <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>
            Cancel Edit
          </button>
        )}
      </form>

      <h2>Available Plans</h2>
      <button onClick={fetchPlans}>Refresh</button>

      {loading ? <p>Loading plans...</p> : (
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Plan</th>
              <th>Price</th>
              <th>Billing Cycle</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map(plan => (
              <tr key={plan._id}>
                <td>{plan.productId?.name || "N/A"}</td>
                <td>{plan.name}</td>
                <td>{plan.currency} {plan.price}</td>
                <td>{plan.billingCycle}</td>
                <td>
                  <button onClick={() => handleEdit(plan)}>Edit</button>
                  <button onClick={() => handleDelete(plan._id)}>Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Plans;
