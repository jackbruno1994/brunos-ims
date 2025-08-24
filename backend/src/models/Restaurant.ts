import { Schema, model } from 'mongoose';
import { Restaurant } from '@brunos-ims/shared';

const restaurantSchema = new Schema<Restaurant>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  operatingHours: {
    open: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    close: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    }
  },
  contactInfo: {
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    }
  },
  managers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Index for better performance
restaurantSchema.index({ country: 1 });
restaurantSchema.index({ name: 1 });

export const RestaurantModel = model<Restaurant>('Restaurant', restaurantSchema);