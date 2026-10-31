
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        padding: "30px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "15px",
        }}
      >
        <div>
          <h1 style={{ color: "#1e293b" }}>
            Subscription Dashboard
          </h1>

          <p style={{ color: "#64748b" }}>
            Welcome, {user?.name || "User"}!
          </p>
        </div>

        <button
          onClick={logout}
          style={{
            padding: "10px 20px",
            background: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: "7px",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      <div
        style={{
          marginTop: "35px",
          padding: "25px",
          background: "white",
          borderRadius: "12px",
        }}
      >
        <h2>Welcome to your Subscription Manager</h2>

        <p style={{ color: "#64748b" }}>
          Your authentication is connected successfully.
          Business modules will be integrated next.
        </p>

        <p>
          <strong>Name:</strong> {user?.name}
        </p>

        <p>
          <strong>Email:</strong> {user?.email}
        </p>

        <p>
          <strong>Role:</strong> {user?.role}
        </p>
      </div>
    </div>
  );
}

export default Dashboard;
