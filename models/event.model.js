const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  
  },
  date: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return value > Date.now();
      },
    }
  },
  location: {
    type: String,
    required: true,
    index: true
  },
 category: {
  type: String,
  enum: ['conference', 'workshop', 'social', 'webinar', 'other', 'seminar', 'networking'],
  default: 'other'
},

  imageUrl: {
    type: String,
    match: [/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/, 'Invalid URL format']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  capacity: {
    type: Number,
    required: true,
    min: 1, 
    validate: {
      validator: Number.isInteger,
      message: 'Capacity must be an integer'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


eventSchema.virtual('availableSeats').get(function() {
  return this.capacity - this.attendees.length;
});

// Indexes
eventSchema.index({ date: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ location: 'text' });

const Event = mongoose.model('Event', eventSchema);
module.exports = mongoose.model("Event", eventSchema);