const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { protect } = require('../middleware/auth');

// GET /api/dashboard — stats for logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const uid = req.user._id;

    // Events created by user
    const myEvents = await Event.find({ createdBy: uid }).sort({ date: -1 });

    // Registrations by user
    const myRegistrations = await Registration.find({ user: uid, status: 'active' })
      .populate('event', 'title date location');

    // Total registered attendees across user's events
    const myEventIds = myEvents.map(e => e._id);
    const totalAttendees = await Registration.countDocuments({
      event: { $in: myEventIds },
      status: 'active',
    });

    // Per-event attendee count
    const attendeeCounts = await Registration.aggregate([
      { $match: { event: { $in: myEventIds }, status: 'active' } },
      { $group: { _id: '$event', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    attendeeCounts.forEach(a => { countMap[a._id.toString()] = a.count; });

    const myEventsWithCount = myEvents.map(e => ({
      ...e.toObject(),
      registeredCount: countMap[e._id.toString()] || 0,
    }));

    res.json({
      totalEventsCreated: myEvents.length,
      totalRegistrations: myRegistrations.length,
      totalAttendees,
      myEvents: myEventsWithCount,
      myRegistrations,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
