const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Song = require('../models/Song');
const auth = require('../middleware/auth');

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'audio') cb(null, 'uploads/audio');
    else cb(null, 'uploads/covers');
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// GET all songs (protected)
router.get('/', auth, async (req, res) => {
  try {
    const { search, liked } = req.query;
    let query = { user: req.userId };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { artist: { $regex: search, $options: 'i' } }
      ];
    }
    if (liked === 'true') query.liked = true;
    const songs = await Song.find(query).sort({ createdAt: -1 });
    res.json(songs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST upload song (protected)
router.post('/', auth, upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, artist, album, genre, duration } = req.body;
    if (!req.files?.audio) return res.status(400).json({ message: 'Audio file required' });

    const song = new Song({
      user: req.userId,
      title,
      artist,
      album: album || 'Unknown Album',
      genre: genre || 'Unknown',
      duration: duration || 0,
      audioUrl: `/uploads/audio/${req.files.audio[0].filename}`,
      coverUrl: req.files?.cover ? `/uploads/covers/${req.files.cover[0].filename}` : '',
    });

    const saved = await song.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH toggle like (protected)
router.patch('/:id/like', auth, async (req, res) => {
  try {
    const song = await Song.findOne({ _id: req.params.id, user: req.userId });
    if (!song) return res.status(404).json({ message: 'Song not found' });
    song.liked = !song.liked;
    await song.save();
    res.json(song);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH increment play count (protected)
router.patch('/:id/play', auth, async (req, res) => {
  try {
    const song = await Song.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { $inc: { plays: 1 } },
      { new: true }
    );
    res.json(song);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE song (protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const song = await Song.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!song) return res.status(404).json({ message: 'Song not found' });
    res.json({ message: 'Song deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;