import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPlaylist, getSongs, addToPlaylist, removeFromPlaylist, incrementPlay } from '../api';

export default function PlaylistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState(null);
  const [allSongs, setAllSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddSongs, setShowAddSongs] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [audio] = useState(new Audio());
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    Promise.all([getPlaylist(id), getSongs({})])
      .then(([{ data: pl }, { data: songs }]) => {
        setPlaylist(pl);
        setAllSongs(songs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

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

  const handleAdd = async (songId) => {
    const { data } = await addToPlaylist(id, songId);
    setPlaylist(data);
  };

  const handleRemove = async (e, songId) => {
    e.stopPropagation();
    const { data } = await removeFromPlaylist(id, songId);
    setPlaylist(data);
  };

  // Songs not already in playlist
  const songsNotInPlaylist = allSongs.filter(
    s => !playlist?.songs.find(ps => ps._id === s._id)
  );

  if (loading) return <div className="empty-state"><p>Loading...</p></div>;
  if (!playlist) return <div className="empty-state"><p>Playlist not found.</p></div>;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <button
          onClick={() => navigate('/playlists')}
          style={{
            background: 'var(--bg-card)', border: 'none',
            borderRadius: 8, padding: '8px 14px',
            color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14
          }}
        >← Back</button>
        <div style={{
          width: 70, height: 70, borderRadius: 10, flexShrink: 0,
          background: 'linear-gradient(135deg, var(--accent), #7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32
        }}>🎶</div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>PLAYLIST</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{playlist.name}</div>
          {playlist.description && (
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{playlist.description}</div>
          )}
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            {playlist.songs.length} songs
          </div>
        </div>
      </div>

      {/* Add songs button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddSongs(v => !v)}
        >
          {showAddSongs ? 'Done Adding' : '+ Add Songs'}
        </button>
      </div>

      {/* Add songs panel */}
      {showAddSongs && (
        <div style={{
          background: 'var(--bg-card)', borderRadius: 12,
          padding: 16, marginBottom: 20
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)' }}>
            Your Library — click to add:
          </div>
          {songsNotInPlaylist.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>All songs are already in this playlist!</p>
          ) : (
            <div className="song-list">
              {songsNotInPlaylist.map(song => (
                <div
                  key={song._id}
                  className="song-row"
                  onClick={() => handleAdd(song._id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="song-cover">
                    {song.coverUrl
                      ? <img src={`http://localhost:5000${song.coverUrl}`} alt={song.title} />
                      : '🎵'}
                  </div>
                  <div className="song-info">
                    <div className="song-title">{song.title}</div>
                    <div className="song-artist">{song.artist}</div>
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ padding: '4px 12px', fontSize: 12 }}
                  >+ Add</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Songs in playlist */}
      {playlist.songs.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48 }}>🎵</div>
          <p>No songs yet. Click "+ Add Songs" to add some!</p>
        </div>
      ) : (
        <div className="song-list">
          {playlist.songs.map((song, i) => (
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
                onClick={e => handleRemove(e, song._id)}
                style={{
                  background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: 14,
                  color: 'var(--text-muted)', padding: '4px 8px'
                }}
                title="Remove from playlist"
              >✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}