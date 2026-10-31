
import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Customers() {
  const { user } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/customers");
      setCustomers(response.data.customers || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load customers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      if (editingId) {
        await api.put(`/customers/${editingId}`, formData);
        setMessage("Customer updated successfully.");
      } else {
        await api.post("/customers", formData);
        setMessage("Customer created successfully.");
      }

      resetForm();
      await fetchCustomers();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to save customer."
      );
    }
  };

  const handleEdit = (customer) => {
    setFormData({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
    });

    setEditingId(customer._id);
    setShowForm(true);
    setError("");
    setMessage("");
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await api.delete(`/customers/${id}`);
      setMessage("Customer deleted successfully.");
      await fetchCustomers();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to delete customer."
      );
    }
  };

  return (
    <div className="customers-page">
      <div className="page-heading">
        <div>
          <h1>Customers</h1>
          <p>Manage your customer information.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          + Add Customer
        </button>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="customer-form-card">
          <h2>{editingId ? "Edit Customer" : "Add New Customer"}</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <label>
                Customer Name *
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter customer name"
                  required
                />
              </label>

              <label>
                Email Address *
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  required
                />
              </label>

              <label>
                Phone Number
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </label>

              <label>
                Address
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                />
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-button">
                {editingId ? "Update Customer" : "Save Customer"}
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="customer-table-card">
        <h2>Customer List</h2>

        {loading ? (
          <p>Loading customers...</p>
        ) : customers.length === 0 ? (
          <p>No customers found. Add your first customer.</p>
        ) : (
          <div className="table-wrapper">
            <table className="customer-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => (
                  <tr key={customer._id}>
                    <td>{customer.name}</td>
                    <td>{customer.email}</td>
                    <td>{customer.phone || "—"}</td>
                    <td>{customer.address || "—"}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="edit-button"
                          onClick={() => handleEdit(customer)}
                        >
                          Edit
                        </button>

                        {user?.role === "admin" && (
                          <button
                            className="delete-button"
                            onClick={() => handleDelete(customer._id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Customers;
