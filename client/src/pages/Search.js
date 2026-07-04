import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { uploadSong, toggleLike, getPlaylists, createPlaylist, addToPlaylist } from '../api';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState({});
  const [liked, setLiked] = useState({});
  const [preview, setPreview] = useState(null);
  const [audio] = useState(new Audio());
  const [playlists, setPlaylists] = useState([]);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showNewPlaylistInput, setShowNewPlaylistInput] = useState(false);

  // Fetch playlists on load
  useEffect(() => {
    getPlaylists().then(({ data }) => setPlaylists(data)).catch(console.error);
  }, []);

  // Auto search as you type
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=20`
        );
        setResults(data.results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [query]);

  const handlePreview = (song) => {
    if (!song.previewUrl) return;
    if (preview === song.trackId) {
      audio.pause();
      setPreview(null);
    } else {
      audio.src = song.previewUrl;
      audio.play();
      setPreview(song.trackId);
    }
  };

  // Save song to library first, then return the saved song's _id
  const saveSongToLibrary = async (song) => {
    if (saved[song.trackId]?._id) return saved[song.trackId]; // already saved
    setSaved(prev => ({ ...prev, [song.trackId]: { status: 'saving' } }));
    const [audioBlob, coverBlob] = await Promise.all([
      fetch(song.previewUrl).then(r => r.blob()),
      fetch(song.artworkUrl100).then(r => r.blob())
    ]);
    const formData = new FormData();
    formData.append('title', song.trackName);
    formData.append('artist', song.artistName);
    formData.append('album', song.collectionName || 'Unknown Album');
    formData.append('genre', song.primaryGenreName || 'Unknown');
    formData.append('duration', Math.round(song.trackTimeMillis / 1000));
    formData.append('audio', audioBlob, 'preview.mp3');
    formData.append('cover', coverBlob, 'cover.jpg');
    const { data } = await uploadSong(formData);
    setSaved(prev => ({ ...prev, [song.trackId]: data }));
    return data;
  };

  const handleSave = async (song) => {
    try {
      await saveSongToLibrary(song);
    } catch (err) {
      alert('Failed to save song.');
      setSaved(prev => ({ ...prev, [song.trackId]: null }));
    }
  };

  const handleLike = async (song) => {
    try {
      const savedSong = await saveSongToLibrary(song);
      await toggleLike(savedSong._id);
      setLiked(prev => ({ ...prev, [song.trackId]: true }));
    } catch (err) {
      alert('Failed to like song.');
    }
  };

  const handleAddToPlaylist = async (song, playlistId) => {
    try {
      const savedSong = await saveSongToLibrary(song);
      await addToPlaylist(playlistId, savedSong._id);
      setShowPlaylistMenu(null);
      alert('Added to playlist!');
    } catch (err) {
      alert('Failed to add to playlist.');
    }
  };

  const handleCreateAndAdd = async (song) => {
    if (!newPlaylistName.trim()) return;
    try {
      const savedSong = await saveSongToLibrary(song);
      const { data: newPlaylist } = await createPlaylist({ name: newPlaylistName });
      await addToPlaylist(newPlaylist._id, savedSong._id);
      setPlaylists(prev => [newPlaylist, ...prev]);
      setNewPlaylistName('');
      setShowNewPlaylistInput(false);
      setShowPlaylistMenu(null);
      alert(`Created "${newPlaylistName}" and added song!`);
    } catch (err) {
      alert('Failed to create playlist.');
    }
  };

  return (
    <div>
      <h1 className="page-title">🔍 Search Songs</h1>

      <div className="search-bar">
        <span>🔍</span>
        <input
          placeholder="Search any song or artist..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          autoFocus
        />
        {loading && <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Searching...</span>}
      </div>

      {!query && (
        <div className="empty-state">
          <div style={{ fontSize: 48 }}>🎵</div>
          <p>Start typing to search any song or artist</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Powered by iTunes API</p>
        </div>
      )}

      <div className="song-list">
        {results.map(song => (
          <div key={song.trackId} className="song-row" style={{ position: 'relative' }}>
            <div className="song-cover">
              {song.artworkUrl100
                ? <img src={song.artworkUrl100} alt={song.trackName} />
                : '🎵'}
            </div>
            <div className="song-info">
              <div className="song-title">{song.trackName}</div>
              <div className="song-artist">{song.artistName} • {song.collectionName}</div>
            </div>

            {/* Preview button */}
            <button
              onClick={() => handlePreview(song)}
              style={{
                background: 'none', border: '1px solid var(--border)',
                borderRadius: 6, padding: '4px 10px',
                color: preview === song.trackId ? 'var(--accent)' : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: 13
              }}
            >
              {preview === song.trackId ? '⏸' : '▶'}
            </button>

            {/* Like button */}
            <button
              onClick={() => handleLike(song)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 18, color: liked[song.trackId] ? 'var(--accent)' : 'var(--text-muted)'
              }}
              title="Like song"
            >
              {liked[song.trackId] ? '❤️' : '🤍'}
            </button>

            {/* Save to library button */}
            <button
              className="btn btn-primary"
              onClick={() => handleSave(song)}
              disabled={!!saved[song.trackId]}
              style={{ padding: '6px 14px', fontSize: 13, opacity: saved[song.trackId] ? 0.6 : 1 }}
            >
              {saved[song.trackId]?.status === 'saving' ? 'Saving...'
                : saved[song.trackId]?._id ? '✅ Saved'
                : '+ Library'}
            </button>

            {/* Add to playlist button */}
            <div style={{ position: 'relative' }}>
              <button
                className="btn"
                style={{
                  background: 'var(--bg-hover)', color: 'var(--text-secondary)',
                  padding: '6px 14px', fontSize: 13, border: '1px solid var(--border)'
                }}
                onClick={() => setShowPlaylistMenu(
                  showPlaylistMenu === song.trackId ? null : song.trackId
                )}
              >
                📚 Playlist
              </button>

              {/* Playlist dropdown */}
              {showPlaylistMenu === song.trackId && (
                <div style={{
                  position: 'absolute', right: 0, top: '110%',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 10, padding: 10, zIndex: 100,
                  minWidth: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
                }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, padding: '0 4px' }}>
                    Add to playlist
                  </div>

                  {/* Existing playlists */}
                  {playlists.length === 0 && (
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '4px' }}>
                      No playlists yet
                    </div>
                  )}
                  {playlists.map(pl => (
                    <div
                      key={pl._id}
                      onClick={() => handleAddToPlaylist(song, pl._id)}
                      style={{
                        padding: '8px 10px', borderRadius: 6, cursor: 'pointer',
                        fontSize: 13, color: 'var(--text-primary)',
                        transition: 'background 0.1s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      🎶 {pl.name}
                    </div>
                  ))}

                  <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 8 }}>
                    {!showNewPlaylistInput ? (
                      <div
                        onClick={() => setShowNewPlaylistInput(true)}
                        style={{
                          padding: '8px 10px', borderRadius: 6, cursor: 'pointer',
                          fontSize: 13, color: 'var(--accent)'
                        }}
                      >
                        + New Playlist
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input
                          className="form-input"
                          style={{ fontSize: 12, padding: '6px 10px' }}
                          placeholder="Playlist name"
                          value={newPlaylistName}
                          onChange={e => setNewPlaylistName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleCreateAndAdd(song)}
                          autoFocus
                        />
                        <button
                          className="btn btn-primary"
                          style={{ padding: '6px 10px', fontSize: 12 }}
                          onClick={() => handleCreateAndAdd(song)}
                        >✓</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}