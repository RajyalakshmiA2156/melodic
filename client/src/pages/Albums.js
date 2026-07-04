import React, { useEffect, useState } from 'react';
import { getSongs, incrementPlay, deleteSong } from '../api';

export default function Albums() {
  const [albums, setAlbums] = useState({});
  const [loading, setLoading] = useState(true);
  const [openAlbum, setOpenAlbum] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [audio] = useState(new Audio());
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = () => {
    getSongs({})
      .then(({ data }) => {
        const grouped = {};
        data.forEach(song => {
          const albumName = song.album || 'Unknown Album';
          if (!grouped[albumName]) {
            grouped[albumName] = {
              name: albumName,
              artist: song.artist,
              cover: song.coverUrl,
              songs: []
            };
          }
          grouped[albumName].songs.push(song);
        });
        setAlbums(grouped);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

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

  const handleDelete = async (e, song) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${song.title}"?`)) return;
    await deleteSong(song._id);
    if (currentSong?._id === song._id) {
      audio.pause();
      setCurrentSong(null);
      setIsPlaying(false);
    }

    // Remove song from albums state
    setAlbums(prev => {
      const updated = { ...prev };
      const albumName = song.album || 'Unknown Album';
      if (updated[albumName]) {
        updated[albumName] = {
          ...updated[albumName],
          songs: updated[albumName].songs.filter(s => s._id !== song._id)
        };
        // If album is now empty, remove it entirely
        if (updated[albumName].songs.length === 0) {
          delete updated[albumName];
          setOpenAlbum(null);
        }
      }
      return updated;
    });
  };

  const albumList = Object.values(albums);

  return (
    <div>
      <h1 className="page-title">💿 Albums</h1>

      {loading ? (
        <div className="empty-state"><p>Loading...</p></div>
      ) : albumList.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: 48 }}>💿</div>
          <p>No albums yet. Add songs to your library first!</p>
        </div>
      ) : (
        <div>
          {/* Album Cards Grid */}
          {!openAlbum && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: 16
            }}>
              {albumList.map(album => (
                <div
                  key={album.name}
                  onClick={() => setOpenAlbum(album.name)}
                  style={{
                    background: 'var(--bg-card)', borderRadius: 12,
                    padding: 16, cursor: 'pointer', transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}
                >
                  <div style={{
                    width: '100%', aspectRatio: '1', borderRadius: 8,
                    overflow: 'hidden', background: 'var(--bg-hover)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 40, marginBottom: 12
                  }}>
                    {album.cover
                      ? <img src={`http://localhost:5000${album.cover}`} alt={album.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : '💿'}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{album.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{album.artist}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    {album.songs.length} songs
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Open Album - Song List */}
          {openAlbum && albums[openAlbum] && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <button
                  onClick={() => setOpenAlbum(null)}
                  style={{
                    background: 'var(--bg-card)', border: 'none',
                    borderRadius: 8, padding: '8px 14px',
                    color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14
                  }}
                >← Back</button>
                <div style={{
                  width: 70, height: 70, borderRadius: 10,
                  overflow: 'hidden', background: 'var(--bg-hover)',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 32, flexShrink: 0
                }}>
                  {albums[openAlbum].cover
                    ? <img src={`http://localhost:5000${albums[openAlbum].cover}`}
                        alt={openAlbum}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : '💿'}
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>ALBUM</div>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>{openAlbum}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {albums[openAlbum].artist} • {albums[openAlbum].songs.length} songs
                  </div>
                </div>
              </div>

              <div className="song-list">
                {albums[openAlbum].songs.map((song, i) => (
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
                      <div className="song-artist">{song.artist}</div>
                    </div>
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}