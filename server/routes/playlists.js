const express = require('express');
const router = express.Router();
const Playlist = require('../models/Playlist');
const auth = require('../middleware/auth');

// GET all playlists (protected)
router.get('/', auth, async (req, res) => {
  try {
    const playlists = await Playlist.find({ user: req.userId })
      .populate('songs')
      .sort({ createdAt: -1 });
    res.json(playlists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single playlist (protected)
router.get('/:id', auth, async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ _id: req.params.id, user: req.userId })
      .populate('songs');
    if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
    res.json(playlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create playlist (protected)
router.post('/', auth, async (req, res) => {
  try {
    const playlist = new Playlist({ ...req.body, user: req.userId });
    const saved = await playlist.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH add song to playlist (protected)
router.patch('/:id/add', auth, async (req, res) => {
  try {
    const { songId } = req.body;
    const playlist = await Playlist.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { $addToSet: { songs: songId } },
      { new: true }
    ).populate('songs');
    res.json(playlist);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH remove song from playlist (protected)
router.patch('/:id/remove', auth, async (req, res) => {
  try {
    const { songId } = req.body;
    const playlist = await Playlist.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { $pull: { songs: songId } },
      { new: true }
    ).populate('songs');
    res.json(playlist);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE playlist (protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    await Playlist.findOneAndDelete({ _id: req.params.id, user: req.userId });
    res.json({ message: 'Playlist deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;