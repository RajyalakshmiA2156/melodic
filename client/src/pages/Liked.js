import React, { useEffect, useState } from 'react';
import { getSongs, toggleLike, incrementPlay, deleteSong } from '../api';

export default function Liked() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSong, setCurrentSong] = useState(null);
  const [audio] = useState(new Audio());
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    getSongs({ liked: true })
      .then(({ data }) => setSongs(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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

  const handleUnlike = async (e, song) => {
    e.stopPropagation();
    await toggleLike(song._id);
    setSongs(prev => prev.filter(s => s._id !== song._id));
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <div style={{
          width: 80, height: 80, borderRadius: 12,
          background: 'linear-gradient(135deg, var(--accent), #ff6b9d)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36
        }}>❤️</div>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>PLAYLIST</div>
          <h1 style={{ fontSize: 26, fontWeight: 700 }}>Liked Songs</h1>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            {songs.length} songs
          </div>
        </div>
      </div>

      {loading ? (
        <div className="empty-state"><p>Loading...</p></div>
      ) : songs.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48 }}>❤️</div>
          <p>No liked songs yet. Hit ❤️ on any song!</p>
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
                onClick={e => handleUnlike(e, song)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 18, color: 'var(--accent)'
                }}
                title="Unlike"
              >❤️</button>
              <button
                onClick={e => handleDelete(e, song)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 16, color: 'var(--text-muted)', padding: '4px 8px'
                }}
                title="Delete song"
              >🗑️</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}