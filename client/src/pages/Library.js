import React, { useEffect, useState } from 'react';
import { getSongs, toggleLike, incrementPlay, deleteSong } from '../api';

export default function Library() {
  const [songs, setSongs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentSong, setCurrentSong] = useState(null);
  const [audio] = useState(new Audio());
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      getSongs({ search })
        .then(({ data }) => setSongs(data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const playSong = async (song) => {
    if (currentSong?._id === song._id) {
      if (isPlaying) { audio.pause(); setIsPlaying(false); }
      else { audio.play(); setIsPlaying(true); }
      return;
    }
    audio.src = `http://localhost:5000${song.audioUrl}`;
    audio.play();
    setCurrentSong(song);
    setIsPlaying(true);
    await incrementPlay(song._id);
  };

  const handleLike = async (e, song) => {
    e.stopPropagation();
    const { data } = await toggleLike(song._id);
    setSongs(prev => prev.map(s => s._id === data._id ? data : s));
  };

  const handleDelete = async (e, song) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${song.title}"?`)) return;
    await deleteSong(song._id);
    if (currentSong?._id === song._id) {
      audio.pause();
      setCurrentSong(null);
      setIsPlaying(false);
    }
    setSongs(prev => prev.filter(s => s._id !== song._id));
  };

  return (
    <div>
      <h1 className="page-title">🎵 Your Library</h1>
      <div className="search-bar">
        <span>🔍</span>
        <input
          placeholder="Search songs, artists..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="empty-state"><p>Loading...</p></div>
      ) : songs.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48 }}>🎵</div>
          <p>No songs yet. Search and add some music!</p>
        </div>
      ) : (
        <div className="song-list">
          {songs.map((song, i) => (
            <div
              key={song._id}
              className="song-row"
              onClick={() => playSong(song)}
              style={{ background: currentSong?._id === song._id ? 'var(--accent-glow)' : '' }}
            >
              <span style={{ color: 'var(--text-muted)', width: 20, textAlign: 'center' }}>
                {currentSong?._id === song._id && isPlaying ? '▶' : i + 1}
              </span>
              <div className="song-cover">
                {song.coverUrl
                  ? <img src={`http://localhost:5000${song.coverUrl}`} alt={song.title} />
                  : '🎵'}
              </div>
              <div className="song-info">
                <div className="song-title">{song.title}</div>
                <div className="song-artist">{song.artist} • {song.album}</div>
              </div>
              <button
                onClick={e => handleLike(e, song)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 18, color: song.liked ? 'var(--accent)' : 'var(--text-muted)'
                }}
              >
                {song.liked ? '❤️' : '🤍'}
              </button>
              <button
                onClick={e => handleDelete(e, song)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 16, color: 'var(--text-muted)',
                  padding: '4px 8px', borderRadius: 4
                }}
                title="Delete song"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}