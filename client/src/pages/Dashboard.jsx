import { useAuth } from "../context/useAuth";

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      <h2>Welcome, {user?.name}</h2>
      <p>Role: {user?.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Dashboard;
