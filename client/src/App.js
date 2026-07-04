import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import Library from './pages/Library';
import Search from './pages/Search';
import Upload from './pages/Upload';
import Liked from './pages/Liked';
import Albums from './pages/Albums';
import Playlists from './pages/Playlists';
import PlaylistDetail from './pages/PlaylistDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;
  return children;
}

function Sidebar({ onLogout }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return (
    <nav className="sidebar">
      <div className="nav-logo">🎧 Melodic</div>

      <div className="sidebar-section">
        <div className="sidebar-label">Menu</div>
        <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
          🎵 Library
        </NavLink>
        <NavLink to="/search" className={({ isActive }) => isActive ? 'active' : ''}>
          🔍 Search
        </NavLink>
        <NavLink to="/upload" className={({ isActive }) => isActive ? 'active' : ''}>
          ⬆️ Upload
        </NavLink>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label">Your Collection</div>
        <NavLink to="/liked" className={({ isActive }) => isActive ? 'active' : ''}>
          ❤️ Liked Songs
        </NavLink>
        <NavLink to="/albums" className={({ isActive }) => isActive ? 'active' : ''}>
          💿 Albums
        </NavLink>
        <NavLink to="/playlists" className={({ isActive }) => isActive ? 'active' : ''}>
          📚 Playlists
        </NavLink>
      </div>

      <div style={{ marginTop: 'auto', padding: '16px 8px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>
          👤 {user.name}
        </div>
        <button
          onClick={onLogout}
          style={{
            background: 'none', border: '1px solid var(--border)',
            borderRadius: 8, padding: '7px 14px', cursor: 'pointer',
            color: 'var(--text-secondary)', fontSize: 13, width: '100%'
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

function MainApp() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="app">
      <Sidebar onLogout={handleLogout} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Library />} />
          <Route path="/search" element={<Search />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/liked" element={<Liked />} />
          <Route path="/albums" element={<Albums />} />
          <Route path="/playlists" element={<Playlists />} />
          <Route path="/playlists/:id" element={<PlaylistDetail />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const token = localStorage.getItem('token');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={token ? <Navigate to="/" /> : <Register />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <MainApp />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
