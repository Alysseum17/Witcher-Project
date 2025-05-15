import mongoose from 'mongoose';
import slugify from 'slugify';

const markerSchema = new mongoose.Schema({
  class: {
    type: String,
    required: [true, 'A marker must have a class'],
    default: 'waypoint',
  },
  title: {
    type: String,
    required: [true, 'A marker must have a title'],
    maxlength: [
      40,
      'A marker title must have less or equal than 40 characters',
    ],
  },
  description: {
    type: String,
    required: [true, 'A marker must have a description'],
  },
  lat: {
    type: Number,
    required: [true, 'A marker must have a latitude'],
    unique: true,
  },
  lng: {
    type: Number,
    required: [true, 'A marker must have a longitude'],
    unique: true,
  },
});

markerSchema.pre('save', function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

export const Marker = mongoose.model('Marker', markerSchema);
