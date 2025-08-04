import { OrderStatus } from "@tickets_microservice123/common";
import mongoose, { Model, Schema, Document } from "mongoose";

interface Order {
  id: string;
  userId: string;
  price: number;
  status: OrderStatus;
  version: number;
}

interface OrderDocument extends Document {
  version: number;
  userId: string;
  status: OrderStatus;
  price: number;
}

interface OrderModel extends Model<OrderDocument> {
  build(order: Order): OrderDocument;
}

const orderSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: OrderStatus,
      default: OrderStatus.Created,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  {
    versionKey: "version",
    toJSON: {
      transform(doc, ret) {
        (ret as any).id = ret._id;
        delete (ret as any)._id;
      },
    },
  }
);

orderSchema.statics.build = (order: Order) => {
  return new Order({
    _id: order.id,
    userId: order.userId,
    status: order.status,
    price: order.price,
    version: order.version,
  });
};

// orderSchema.pre("save", async function (next) {
//   this.$where = {
//     version: this.get("version") - 1,
//   };
//   next();
// });

const Order = mongoose.model<OrderDocument, OrderModel>("Order", orderSchema);

export { Order };
