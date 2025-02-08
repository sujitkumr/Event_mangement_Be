const express = require("express");
const {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
  joinEvent,
  leaveEvent,
  getEventById
} = require("../controllers/event.controller");
const   { protectRoute } = require("../middlewares/auth.middleware");
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/createevents', protectRoute, upload.single('image'), createEvent);
router.get("/all", getEvents);
router.put("/:id/update", protectRoute,upload.single("image"), updateEvent);
router.delete("/:id", protectRoute, deleteEvent);
router.get('/:id', getEventById);

router.post("/:id/join", protectRoute, joinEvent);
router.post("/:id/leave", protectRoute, leaveEvent);

module.exports = router; 