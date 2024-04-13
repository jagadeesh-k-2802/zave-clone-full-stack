const mongoose = require('mongoose');

const Group = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
      maxlength: [20, 'Name cannot be more than 20 characters']
    },
    color: {
      type: String,
      required: [true, 'color is required']
    },
    groupVisibility: {
      type: String,
      enum: ['visible', 'hidden'],
      default: 'hidden'
    },
    items: [
      {
        name: String,
        url: String,
        icon: String
      }
    ],
    user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

module.exports = mongoose.model('Group', Group);
