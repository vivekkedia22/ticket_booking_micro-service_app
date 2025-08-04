import mongoose, { Document, Model, Schema } from "mongoose";
import { OrderStatus } from "@tickets_microservice123/common";

import { TicketDocument } from "./ticket.model";
interface Order {
  ticket: TicketDocument;
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
}

interface OrderDocument extends Document {
  _id: mongoose.Types.ObjectId;
  ticket: TicketDocument;
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  version:number;
}
interface OrderModel extends Model<OrderDocument> {
  build(order: Order): OrderDocument;
}

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expiresAt: {
      type: mongoose.Schema.Types.Date,
    },
  },
  {
    versionKey: "version",
    optimisticConcurrency: true,
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        // delete ret.__v;
        (ret as any).id = ret._id;
        delete (ret as any)._id;
      },
    },
  }
);
orderSchema.statics.build = (order: Order) => {
  return new Order(order);
};
const Order = mongoose.model<OrderDocument, OrderModel>("Order", orderSchema);
export { Order };
