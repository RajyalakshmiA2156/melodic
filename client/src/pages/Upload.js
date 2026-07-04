import React, { useState } from 'react';
import { uploadSong } from '../api';

export default function Upload() {
  const [form, setForm] = useState({
    title: '', artist: '', album: '', genre: ''
  });
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.title || !form.artist || !audioFile) {
      alert('Title, artist and audio file are required!');
      return;
    }

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('artist', form.artist);
    formData.append('album', form.album);
    formData.append('genre', form.genre);
    formData.append('audio', audioFile);
    if (coverFile) formData.append('cover', coverFile);

    try {
      setLoading(true);
      await uploadSong(formData);
      setSuccess(true);
      setForm({ title: '', artist: '', album: '', genre: '' });
      setAudioFile(null);
      setCoverFile(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert('Upload failed. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500 }}>
      <h1 className="page-title">⬆️ Upload Song</h1>

      {success && (
        <div style={{
          background: 'var(--accent-glow)', border: '1px solid var(--accent)',
          borderRadius: 8, padding: '12px 16px', marginBottom: 20,
          color: 'var(--accent-light)', fontSize: 14
        }}>
          ✅ Song uploaded successfully!
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Title *</label>
        <input
          className="form-input"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Song title"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Artist *</label>
        <input
          className="form-input"
          name="artist"
          value={form.artist}
          onChange={handleChange}
          placeholder="Artist name"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Album</label>
        <input
          className="form-input"
          name="album"
          value={form.album}
          onChange={handleChange}
          placeholder="Album name"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Genre</label>
        <input
          className="form-input"
          name="genre"
          value={form.genre}
          onChange={handleChange}
          placeholder="e.g. Pop, Rock, Hip-hop"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Audio File * (.mp3)</label>
        <input
          type="file"
          accept="audio/*"
          onChange={e => setAudioFile(e.target.files[0])}
          style={{ color: 'var(--text-secondary)', fontSize: 14 }}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Cover Image (optional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={e => setCoverFile(e.target.files[0])}
          style={{ color: 'var(--text-secondary)', fontSize: 14 }}
        />
      </div>

      <button
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? 'Uploading...' : 'Upload Song'}
      </button>
    </div>
  );
}