import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Library from './pages/Library';
import Search from './pages/Search';
import Upload from './pages/Upload';
import Liked from './pages/Liked';
import Albums from './pages/Albums';
import Playlists from './pages/Playlists';
import PlaylistDetail from './pages/PlaylistDetail';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">

        {/* Left Sidebar */}
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
        </nav>

        {/* Main Content */}
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
    </BrowserRouter>
  );
}

export default App;