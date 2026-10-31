
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const menuItems = [
  { name: "Dashboard", path: "/", icon: "⌂", roles: ["admin", "staff", "customer"] },
  { name: "Customers", path: "/customers", icon: "♙", roles: ["admin", "staff"] },
  { name: "Plans", path: "/plans", icon: "▣", roles: ["admin", "staff"] },
  { name: "Quotations", path: "/quotations", icon: "▤", roles: ["admin", "staff"] },
  { name: "Subscriptions", path: "/subscriptions", icon: "↻", roles: ["admin", "staff"] },
  { name: "Invoices", path: "/invoices", icon: "▧", roles: ["admin", "staff"] },
  { name: "Payments", path: "/payments", icon: "₹", roles: ["admin", "staff"] },
];

function Sidebar() {
  const { user } = useAuth();

  const userRole = user?.role?.toLowerCase();

  const filteredMenuItems = menuItems.filter(item =>
    item.roles.includes(userRole)
  );

  return (
    <aside className="sidebar">

      {/* BRAND */}

      <div className="sidebar-brand">
        <div className="brand-icon">S</div>

        <div>
          <h2>Subscript</h2>
          <span>Management System</span>
        </div>
      </div>

      {/* MENU HEADING */}

      <p className="sidebar-heading">WORKSPACE</p>

      {/* NAVIGATION */}

      <nav className="sidebar-nav" aria-label="Main navigation">

        {filteredMenuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-icon" aria-hidden="true">
              {item.icon}
            </span>

            <span>{item.name}</span>
          </NavLink>
        ))}

      </nav>

      {/* FOOTER */}

      <div className="sidebar-footer">
        <span className="status-dot"></span>
        System operational
      </div>

    </aside>
  );
}

export default Sidebar;
