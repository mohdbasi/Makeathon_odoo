
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user } = useAuth();

  const stats = [
    { title: "Total Customers", value: "0", color: "#2563eb" },
    { title: "Active Plans", value: "0", color: "#7c3aed" },
    { title: "Subscriptions", value: "0", color: "#0891b2" },
    { title: "Pending Invoices", value: "0", color: "#ea580c" },
  ];

  return (
    <div>
      <div style={styles.heading}>
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.name || "User"}!</p>
        </div>
      </div>

      <div style={styles.grid}>
        {stats.map((stat) => (
          <div key={stat.title} style={styles.card}>
            <div
              style={{
                ...styles.indicator,
                background: stat.color,
              }}
            />
            <p style={styles.label}>{stat.title}</p>
            <h2>{stat.value}</h2>
          </div>
        ))}
      </div>

      <div style={styles.welcome}>
        <h2>Your business overview</h2>
        <p>
          Your subscription management workspace is ready.
          Customer, plan, quotation and billing data will
          appear here as we integrate each module.
        </p>
      </div>
    </div>
  );
}

const styles = {
  heading: {
    marginBottom: "28px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "white",
    padding: "22px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  indicator: {
    width: "35px",
    height: "5px",
    borderRadius: "5px",
  },
  label: {
    color: "#64748b",
    fontSize: "14px",
  },
  welcome: {
    marginTop: "28px",
    padding: "25px",
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
  },
};

export default Dashboard;
