const ErrorResponse = require('../utils/errorResponse');
const Event = require('../models/event.model');
const cloudinary= require('../config/cloudinary')

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });



exports.getEvents = async (req, res) => {
  try {
    console.log("Fetching events...");
    const events = await Event.find({});
    res.status(200).json(events);
    console.log("Events fetched successfully:", events); // Debug log
  } catch (err) {
    console.error("Error fetching events:", err.message);
    res.status(500).json({ error: "Failed to fetch events" });
  }
};



exports.createEvent = async (req, res, next) => {
  // Normalize the keys in req.body to remove trailing/leading whitespace in key names
  const normalizedBody = {};
  for (let key in req.body) {
    normalizedBody[key.trim()] = req.body[key];
  }

  // Destructure the normalized body
  let { name, description, date, location, capacity, category } = normalizedBody;

  // Log the normalized body and file details for debugging
  console.log("Normalized Request Body:", normalizedBody);
  console.log("Uploaded File:", req.file);

  // Ensure required fields are present
  if (!name || !description || !date || !location || !category || !capacity || !req.file) {
    return res.status(400).json({ message: 'All fields are required, including an image' });
  }

  // Convert capacity to a number
  const numericCapacity = Number(capacity);
  if (isNaN(numericCapacity)) {
    return res.status(400).json({ message: 'Capacity must be a valid number' });
  }

  // Normalize and validate the category against allowed values
  const allowedCategories = ['conference', 'workshop', 'social', 'webinar', 'other'];
  // Automatically convert "others" to "other"
  category = category.trim().toLowerCase();
  if (category === 'others') {
    category = 'other';
  }
  if (!allowedCategories.includes(category)) {
    return res.status(400).json({ message: `Invalid category. Allowed values are: ${allowedCategories.join(', ')}` });
  }

  try {
    console.log('User creating event:', req.user);

    let uploadResponse;
    try {
      // Upload the image file to Cloudinary under the 'events' folder
      uploadResponse = await cloudinary.uploader.upload(req.file.path, {
        folder: 'events',
      });
      console.log('Image uploaded:', uploadResponse);
    } catch (err) {
      console.error('Cloudinary upload error:', err);
      return res.status(500).json({ message: 'Image upload failed' });
    }

    // Create the new event in the database
    const newEvent = await Event.create({
      name: name.trim(),
      description: description.trim(),
      date, // Ensure that the date provided is in the future per your model validation
      location: location.trim(),
      category,
      capacity: numericCapacity,
      imageUrl: uploadResponse.secure_url,
      creator: req.user._id,
    });

    console.log('Event created successfully:', newEvent);
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Internal server error: Create event failed' });
  }
};


exports.deleteEvent = async (req, res) => {
    if (req.user.role === "guest")
      return res.status(403).json({ error: "Guests cannot delete events" });
  
    const { id } = req.params;
  
    try {
      await Event.findByIdAndDelete(id);
      res.status(200).json({ message: "Event deleted successfully" });
    } catch (err) {
      console.error("Error deleting event:", err.message);
      res.status(500).json({ error: "Failed to delete event" });
    }
  }; 
  
  

exports.updateEvent = async (req, res) => {
    if (req.user.role === "guest")
      return res.status(403).json({ error: "Guests cannot update events" });
  
    const { id } = req.params;
  
    try {
      // Prepare an object with the fields to update from req.body
      let updateData = { ...req.body };
      console.log("File from request:", req.file);

      // If a new image file is provided, upload it and add the new URL to updateData
      if (req.file) {
        try {
          const uploadResponse = await cloudinary.uploader.upload(req.file.path, {
            folder: "events",
          });
          updateData.imageUrl = uploadResponse.secure_url;
        } catch (uploadError) {
          console.error("Cloudinary upload error:", uploadError);
          return res.status(500).json({ message: "Image upload failed" });
        }
      }
  
      // Update the event in the database
      const updatedEvent = await Event.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
      if (!updatedEvent) {
        return res.status(404).json({ message: "Event not found" });
      }
  
      res.status(200).json(updatedEvent);
    } catch (err) {
      console.error("Error updating event:", err.message);
      res.status(500).json({ error: "Failed to update event" });
    }
  };
  



exports.joinEvent = async (req, res) => {
    try {
      const eventId = req.params.id;
      const userId = req.user._id; // Assumes protectRoute middleware is used
  
      // Find the event by ID
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
  
      // Check if user is already joined
      if (event.attendees.includes(userId.toString())) {
        return res.status(400).json({ message: "User has already joined the event" });
      }
  
      // Check available capacity if defined
      if (event.capacity && event.attendees.length >= event.capacity) {
        return res.status(400).json({ message: "No available seats" });
      }
  
      // Add user to attendees
      event.attendees.push(userId);
  
      // Optionally update availableSeats if you track them
      if (typeof event.capacity !== "undefined") {
        event.availableSeats = event.capacity - event.attendees.length;
      }
      
      await event.save();
  
      // Emit the updated attendee count to clients in the event's room (or broadcast generally)
      const io = req.app.get('socketio');
      // Optionally, if you are using room names based on event IDs:
      io.to(eventId).emit('attendeesUpdated', {
        eventId: eventId,
        attendeesCount: event.attendees.length
      });
  
      res.status(200).json({ message: "Joined event successfully", event });
    } catch (err) {
      console.error("Error joining event:", err.message);
      res.status(500).json({ error: "Failed to join event" });
    }
  };



 
  
exports.leaveEvent = async (req, res) => {
    try {
      const eventId = req.params.id;
      const userId = req.user._id;
  
      // Find the event by ID
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
  
      // Check if the user is a participant
      if (!event.attendees.includes(userId.toString())) {
        return res.status(400).json({ message: "User is not a participant in the event" });
      }
  
      // Remove the user from attendees
      event.attendees = event.attendees.filter(
        (attendeeId) => attendeeId.toString() !== userId.toString()
      );
  
      // Optionally update availableSeats
      if (typeof event.capacity !== "undefined") {
        event.availableSeats = event.capacity - event.attendees.length;
      }
  
      await event.save();
  
      // Emit the updated attendee count
      const io = req.app.get('socketio');
      io.to(eventId).emit('attendeesUpdated', {
        eventId: eventId,
        attendeesCount: event.attendees.length
      });
  
      res.status(200).json({ message: "Left event successfully", event });
    } catch (err) {
      console.error("Error leaving event:", err.message);
      res.status(500).json({ error: "Failed to leave event" });
    }
  };
  

exports.getEventById = async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
 


