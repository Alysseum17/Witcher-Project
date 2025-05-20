import mongoose from 'mongoose';

const markerSchema = new mongoose.Schema({
  map: {
    type: String,
    required: true,
  },
  class: {
    type: String,
    required: true,
    default: 'waypoint',
  },
  title: {
    type: String,
    required: true,
    maxlength: 100,
  },
  description: {
    type: String,
  },
  lat: {
    type: Number,
    required: true,
  },
  lng: {
    type: Number,
    required: true,
  },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isPublic: { type: Boolean, default: false },
});

export const Marker = mongoose.model('Marker', markerSchema);
