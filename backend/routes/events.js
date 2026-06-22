const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { protect } = require('../middleware/auth');

// Helper: is this event visible to this user?
// Visible if the user created it, OR has an active/past registration for it.
async function isVisibleToUser(eventId, userId) {
  const event = await Event.findById(eventId);
  if (!event) return null;
  if (event.createdBy.toString() === userId.toString()) return event;
  const reg = await Registration.findOne({ event: eventId, user: userId });
  if (reg) return event;
  return false; // exists, but not visible to this user
}

// GET /api/events - events the user created or is registered for (private to each user)
router.get('/', protect, async (req, res) => {
  try {
    const uid = req.user._id;

    const created = await Event.find({ createdBy: uid });

    const myRegs = await Registration.find({ user: uid }).select('event');
    const registeredIds = myRegs.map(r => r.event);
    const registered = await Event.find({ _id: { $in: registeredIds }, createdBy: { $ne: uid } });

    const events = [...created, ...registered];
    await Event.populate(events, { path: 'createdBy', select: 'name' });
    events.sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/events/shared/:token - view an event via its share link.
// Anyone logged in can open this with the right token, regardless of
// whether they created the event or are registered for it yet.
// Must be defined before /:id routes, or Express will treat "shared" as an id.
router.get('/shared/:token', protect, async (req, res) => {
  try {
    const event = await Event.findOne({ shareToken: req.params.token }).populate('createdBy', 'name');
    if (!event) return res.status(404).json({ message: 'This link is invalid or the event was deleted' });
    const registeredCount = await Registration.countDocuments({ event: event._id, status: 'active' });
    res.json({ ...event.toObject(), registeredCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/events/:id/count - active registration count for an event
router.get('/:id/count', protect, async (req, res) => {
  try {
    const visible = await isVisibleToUser(req.params.id, req.user._id);
    if (visible === null) return res.status(404).json({ message: 'Event not found' });
    if (visible === false) return res.status(403).json({ message: 'Not authorized to view this event' });

    const count = await Registration.countDocuments({ event: req.params.id, status: 'active' });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/events/:id - single event details (only visible to creator or registrants)
router.get('/:id', protect, async (req, res) => {
  try {
    const visible = await isVisibleToUser(req.params.id, req.user._id);
    if (visible === null) return res.status(404).json({ message: 'Event not found' });
    if (visible === false) return res.status(403).json({ message: 'Not authorized to view this event' });

    const event = await Event.findById(req.params.id).populate('createdBy', 'name');
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/events - create event (protected)
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, date, location, capacity } = req.body;

    if (!title || !description || !date || !location || !capacity)
      return res.status(400).json({ message: 'All fields are required' });

    const event = await Event.create({
      title,
      description,
      date,
      location,
      capacity,
      createdBy: req.user._id,
    });

    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/events/:id - update event (protected, only creator)
router.put('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized to update this event' });

    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/events/:id - delete event (protected, only creator)
router.delete('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized to delete this event' });

    await event.deleteOne();
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
