const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
  coverUrl: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Playlist', playlistSchema);