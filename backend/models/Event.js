const mongoose = require('mongoose');
const crypto = require('crypto');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    capacity: { type: Number, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Random, unguessable token used for share links. Anyone with this token
    // can view the event and register, even though events are private by default.
    shareToken: { type: String, required: true, unique: true, default: () => crypto.randomBytes(12).toString('hex') },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
