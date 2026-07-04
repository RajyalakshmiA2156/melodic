import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL
    ? `${process.env.REACT_APP_API_URL}/api`
    : 'http://localhost:5000/api'
});

// Automatically attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Songs
export const getSongs = (params) => API.get('/songs', { params });
export const uploadSong = (formData) => API.post('/songs', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const toggleLike = (id) => API.patch(`/songs/${id}/like`);
export const incrementPlay = (id) => API.patch(`/songs/${id}/play`);
export const deleteSong = (id) => API.delete(`/songs/${id}`);

// Playlists
export const getPlaylists = () => API.get('/playlists');
export const getPlaylist = (id) => API.get(`/playlists/${id}`);
export const createPlaylist = (data) => API.post('/playlists', data);
export const addToPlaylist = (playlistId, songId) =>
  API.patch(`/playlists/${playlistId}/add`, { songId });
export const removeFromPlaylist = (playlistId, songId) =>
  API.patch(`/playlists/${playlistId}/remove`, { songId });
export const deletePlaylist = (id) => API.delete(`/playlists/${id}`);