const express = require('express');
const router = express.Router();
const Playlist = require('../models/Playlist');

// GET all playlists
router.get('/', async (req, res) => {
  try {
    const playlists = await Playlist.find().populate('songs').sort({ createdAt: -1 });
    res.json(playlists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single playlist
router.get('/:id', async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate('songs');
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create playlist
router.post('/', async (req, res) => {
  try {
    const playlist = new Playlist(req.body);
    const saved = await playlist.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH add song to playlist
router.patch('/:id/add', async (req, res) => {
  try {
    const { songId } = req.body;
    const playlist = await Playlist.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { songs: songId } },
      { new: true }
    ).populate('songs');
    res.json(playlist);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH remove song from playlist
router.patch('/:id/remove', async (req, res) => {
  try {
    const { songId } = req.body;
    const playlist = await Playlist.findByIdAndUpdate(
      req.params.id,
      { $pull: { songs: songId } },
      { new: true }
    ).populate('songs');
    res.json(playlist);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE playlist
router.delete('/:id', async (req, res) => {
  try {
    await Playlist.findByIdAndDelete(req.params.id);
    res.json({ message: 'Playlist deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;