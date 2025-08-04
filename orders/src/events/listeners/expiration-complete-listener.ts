import {
  BadRequestError,
  ExpirationCompleteEvent,
  Listeners,
  OrderStatus,
  Subjects,
} from "@tickets_microservice123/common";
import { JsMsg } from "nats";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";
import { natsWrapper } from "../../natsWrapper";
import { Order } from "../../models/order.model";
import mongoose from "mongoose";

export class ExpirationCompleteListener extends Listeners<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
  durableName: string = "expiration-complete";
  async onMessage(data: ExpirationCompleteEvent["data"], msg: JsMsg) {
    const orderId = data.orderId;
    const order = await Order.findById(orderId).populate("ticket");
    if (!order) {
      throw new BadRequestError(500, "order not found");
    }
    if (order.status === OrderStatus.Complete) {
      return msg.ack();
    }
    order.set({ status: OrderStatus.Cancelled });

    await order.save();
    const publisher = new OrderCancelledPublisher(
      this.natsClient,
      natsWrapper.jetStreamManager,
      "ORDERS"
    );
    await publisher.publishData({
      id: orderId,
      version: order!.version,
      ticket: {
        id: new mongoose.Types.ObjectId(order.ticket.id).toHexString(),
      },
    });
    msg.ack();
  }
}
