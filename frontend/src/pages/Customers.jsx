
import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import "../App.css";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const emptyForm = {
    name: "",
    email: "",
    phone: "",
    company: ""
  };

  const [form, setForm] = useState(emptyForm);

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/customers");

      setCustomers(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load customers. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Search customers
  const filteredCustomers = useMemo(() => {
    const keyword = search.toLowerCase();

    return customers.filter(customer =>
      [
        customer.name,
        customer.email,
        customer.phone,
        customer.company
      ].some(value =>
        String(value || "").toLowerCase().includes(keyword)
      )
    );
  }, [customers, search]);

  // Handle form changes
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // Create customer
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setMessage("");

      await api.post("/customers", form);

      setMessage("Customer added successfully!");
      setForm(emptyForm);
      setShowForm(false);

      await fetchCustomers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to add customer."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container customers-page">

      {/* PAGE HEADER */}

      <div className="customers-header">
        <div>
          <h1>Customers</h1>
          <p>Manage and organize your customer information.</p>
        </div>

        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Close Form" : "+ Add Customer"}
        </button>
      </div>

      {/* NOTIFICATIONS */}

      {error && (
        <div className="module-message error" role="alert">
          {error}
        </div>
      )}

      {message && (
        <div className="module-message success" role="status">
          {message}
        </div>
      )}

      {/* STATISTICS */}

      <div className="customer-stats">

        <div className="customer-stat-card">
          <div className="customer-stat-icon purple">♙</div>
          <div>
            <p>Total Customers</p>
            <h2>{customers.length}</h2>
          </div>
        </div>

        <div className="customer-stat-card">
          <div className="customer-stat-icon green">✓</div>
          <div>
            <p>Customer Records</p>
            <h2>{filteredCustomers.length}</h2>
          </div>
        </div>

      </div>

      {/* ADD CUSTOMER FORM */}

      {showForm && (
        <section className="module-card">

          <div className="module-card-header">
            <div>
              <h2>Add New Customer</h2>
              <p>Enter the customer's details below.</p>
            </div>
          </div>

          <form
            className="module-form"
            onSubmit={handleSubmit}
          >

            <div className="form-group">
              <label htmlFor="customerName">Full Name</label>
              <input
                id="customerName"
                name="name"
                placeholder="Enter full name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="customerEmail">Email Address</label>
              <input
                id="customerEmail"
                name="email"
                type="email"
                placeholder="Enter email address"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="customerPhone">Phone Number</label>
              <input
                id="customerPhone"
                name="phone"
                type="tel"
                placeholder="Enter phone number"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="customerCompany">Company</label>
              <input
                id="customerCompany"
                name="company"
                placeholder="Enter company name"
                value={form.company}
                onChange={handleChange}
              />
            </div>

            <div className="form-actions">
              <button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save Customer"}
              </button>

              <button
                type="button"
                className="secondary"
                onClick={() => {
                  setShowForm(false);
                  setForm(emptyForm);
                }}
              >
                Cancel
              </button>
            </div>

          </form>
        </section>
      )}

      {/* CUSTOMER LIST */}

      <section className="module-card">

        <div className="module-toolbar">

          <div>
            <h2>Customer List</h2>
            <p>
              View and manage all registered customers.
            </p>
          </div>

          <button
            className="secondary"
            onClick={fetchCustomers}
            disabled={loading}
          >
            ↻ Refresh
          </button>

        </div>

        {/* SEARCH */}

        <div className="customer-search">
          <span>⌕</span>

          <input
            type="search"
            placeholder="Search by name, email, phone or company..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search customers"
          />
        </div>

        {/* TABLE */}

        {loading ? (

          <div className="empty-state">
            Loading customers...
          </div>

        ) : filteredCustomers.length === 0 ? (

          <div className="empty-state">
            {search
              ? "No customers match your search."
              : "No customers found. Add your first customer."}
          </div>

        ) : (

          <div className="table-wrapper">

            <table>

              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email Address</th>
                  <th>Phone</th>
                  <th>Company</th>
                </tr>
              </thead>

              <tbody>

                {filteredCustomers.map(customer => (

                  <tr key={customer._id}>

                    <td>
                      <div className="customer-name-cell">
                        <div className="customer-avatar">
                          {(customer.name || "C")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <strong>
                          {customer.name || "Unnamed"}
                        </strong>
                      </div>
                    </td>

                    <td>{customer.email || "—"}</td>

                    <td>{customer.phone || "—"}</td>

                    <td>{customer.company || "—"}</td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </section>

    </div>
  );
}

export default Customers;
