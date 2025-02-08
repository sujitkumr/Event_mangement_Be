const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['guest', 'user', 'admin'], 
    default: 'user'
  },
  eventsCreated: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event' 
  }],
  eventsAttending: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event' 
  }]
}, { 
  timestamps: true 
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });


userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare plaintext password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


module.exports = mongoose.model("User", userSchema);