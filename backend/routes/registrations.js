const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const { protect } = require('../middleware/auth');

// POST /api/registrations - register for an event
router.post('/', protect, async (req, res) => {
  try {
    const { eventId } = req.body;
    if (!eventId) return res.status(400).json({ message: 'eventId is required' });

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Check capacity
    const count = await Registration.countDocuments({ event: eventId, status: 'active' });
    if (count >= event.capacity)
      return res.status(400).json({ message: 'Event is full' });

    // Check duplicate
    const existing = await Registration.findOne({ user: req.user._id, event: eventId });
    if (existing) {
      if (existing.status === 'active')
        return res.status(400).json({ message: 'Already registered for this event' });
      // Re-register if previously cancelled
      existing.status = 'active';
      await existing.save();
      return res.json(existing);
    }

    const registration = await Registration.create({
      user: req.user._id,
      event: eventId,
    });

    res.status(201).json(registration);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/registrations/my - get logged-in user's registrations
router.get('/my', protect, async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user._id }).populate(
      'event',
      'title date location description'
    );
    res.json(registrations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/registrations/:id - cancel a registration
router.delete('/:id', protect, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) return res.status(404).json({ message: 'Registration not found' });

    if (registration.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    if (registration.status === 'cancelled')
      return res.status(400).json({ message: 'Registration already cancelled' });

    registration.status = 'cancelled';
    await registration.save();

    res.json({ message: 'Registration cancelled', registration });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
