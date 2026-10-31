
import { NavLink } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", path: "/", icon: "⌂" },
  { name: "Customers", path: "/customers", icon: "♙" },
  { name: "Plans", path: "/plans", icon: "▣" },
  { name: "Quotations", path: "/quotations", icon: "▤" },
  { name: "Subscriptions", path: "/subscriptions", icon: "↻" },
  { name: "Invoices", path: "/invoices", icon: "▧" },
  { name: "Payments", path: "/payments", icon: "₹" },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">S</div>
        <div>
          <h2>Subscript</h2>
          <span>Management System</span>
        </div>
      </div>

      <p className="sidebar-heading">WORKSPACE</p>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="status-dot"></span>
        System operational
      </div>
    </aside>
  );
}

export default Sidebar;
