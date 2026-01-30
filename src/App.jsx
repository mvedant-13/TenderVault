import { Route, Routes } from 'react-router-dom'
import './App.css'
import NavBar from './components/NavBar.jsx'
import HomePage from './pages/HomePage.jsx'

function App() {
  return (
    <Routes>
      <Route element={<NavBar />}>
        <Route path="/" element={<HomePage />} />

        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/register" element={<div>Register Page</div>} />
        <Route path="/profile" element={<div>Profile Page</div>} />
        
        <Route path="/create-tender" element={<div>Create Tender Page</div>} />
        <Route path="/tenders" element={<div>Tenders Page</div>} />
        <Route path="/tender/:id" element={<div>Tender Details Page</div>} />
        <Route path="/edit-tender/:id" element={<div>Edit Tender Page</div>} />

        <Route path="/admin" element={<div>Admin Dashboard</div>}>
          <Route path="users" element={<div>Manage Users</div>} />
          <Route path="tenders" element={<div>Manage Tenders</div>} />
        </Route>

        <Route path="*" element={<div>404 Not Found</div>} />
      </Route>
    </Routes>
  )
}

export default App
