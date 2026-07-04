import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlaylists, createPlaylist, deletePlaylist } from '../api';

export default function Playlists() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getPlaylists()
      .then(({ data }) => setPlaylists(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      const { data } = await createPlaylist({ name, description });
      setPlaylists(prev => [data, ...prev]);
      setName('');
      setDescription('');
      setShowForm(false);
    } catch (err) {
      alert('Failed to create playlist.');
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this playlist?')) return;
    await deletePlaylist(id);
    setPlaylists(prev => prev.filter(p => p._id !== id));
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>📚 Playlists</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
          + New Playlist
        </button>
      </div>

      {/* Create playlist form */}
      {showForm && (
        <div style={{
          background: 'var(--bg-card)', borderRadius: 12,
          padding: 20, marginBottom: 24
        }}>
          <div className="form-group">
            <label className="form-label">Playlist Name *</label>
            <input
              className="form-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="My awesome playlist"
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description (optional)</label>
            <input
              className="form-input"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What's this playlist about?"
            />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={handleCreate}>Create</button>
            <button
              className="btn"
              style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
              onClick={() => setShowForm(false)}
            >Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="empty-state"><p>Loading...</p></div>
      ) : playlists.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48 }}>📚</div>
          <p>No playlists yet. Create one!</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 16
        }}>
          {playlists.map(pl => (
            <div
              key={pl._id}
              onClick={() => navigate(`/playlists/${pl._id}`)}
              style={{
                background: 'var(--bg-card)', borderRadius: 12,
                padding: 16, cursor: 'pointer', transition: 'all 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}
            >
              <div style={{
                width: '100%', aspectRatio: '1', borderRadius: 8,
                background: 'linear-gradient(135deg, var(--accent), #7c3aed)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 40, marginBottom: 12
              }}>🎶</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{pl.name}</div>
              {pl.description && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                  {pl.description}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  {pl.songs.length} songs
                </div>
                <button
                  onClick={e => handleDelete(e, pl._id)}
                  style={{
                    background: 'none', border: 'none',
                    cursor: 'pointer', fontSize: 14,
                    color: 'var(--text-muted)'
                  }}
                >🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}