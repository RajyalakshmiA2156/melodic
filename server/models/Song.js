const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  artist: { type: String, required: true, trim: true },
  album: { type: String, default: 'Unknown Album' },
  duration: { type: Number, default: 0 },
  genre: { type: String, default: 'Unknown' },
  audioUrl: { type: String, required: true },
  coverUrl: { type: String, default: '' },
  plays: { type: Number, default: 0 },
  liked: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Song', songSchema);