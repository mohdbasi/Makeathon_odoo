
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#f8fafc",
      }}
    >
      <h1 style={{ fontSize: "70px", color: "#2563eb" }}>
        404
      </h1>

      <h2>Page Not Found</h2>

      <p>The page you are looking for does not exist.</p>

      <Link to="/" style={{ color: "#2563eb" }}>
        Return to Dashboard
      </Link>
    </div>
  );
}

export default NotFound;
