import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderProduct {
  product: mongoose.Types.ObjectId;
  quantity: number;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  products: IOrderProduct[];
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
}

const OrderSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IOrder>('Order', OrderSchema);