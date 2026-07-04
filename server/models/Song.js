const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  album: { type: String, default: 'Unknown Album' },
  duration: { type: Number, default: 0 },
  genre: { type: String, default: 'Unknown' },
  audioUrl: { type: String, required: true },
  coverUrl: { type: String, default: '' },
  plays: { type: Number, default: 0 },
  liked: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Song', songSchema);