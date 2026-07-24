import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        TenderVault
      </Link>

      <div className="navbar-links">
        {user ? (
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/tenders">All Tenders</NavLink>
            {user.role === "admin" && (
              <NavLink to="/my-tenders">My Tenders</NavLink>
            )}
            {user.role === "vendor" && <NavLink to="/my-bids">My Bids</NavLink>}{" "}
            <span className="navbar-user">
              {user.name} <span className="navbar-role">({user.role})</span>
            </span>
            <button className="navbar-logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
