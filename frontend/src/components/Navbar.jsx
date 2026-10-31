
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div>
        <h3>Subscription Management</h3>
        <p>Manage your business in one place</p>
      </div>

      <div className="navbar-user">
        <div className="user-avatar">
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </div>

        <div className="user-info">
          <strong>{user?.name || "User"}</strong>
          <span>{user?.role || "Customer"}</span>
        </div>

        <button className="logout-button" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;
