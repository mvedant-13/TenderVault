import { NavLink, Outlet } from 'react-router-dom'

export default function NavBar() {
    return (
        <nav>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/tenders">Tenders</NavLink>
            <NavLink to="/create-tender">Create Tender</NavLink>
            <NavLink to="/profile">Profile</NavLink>
            <NavLink to="/admin">Admin</NavLink>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
            <Outlet />
        </nav>
    )
}