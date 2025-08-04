import {
  Listeners,
  OrderCreatedEvent,
  OrderStatus,
  Subjects,
} from "@tickets_microservice123/common";
import { JsMsg } from "nats";

import { natsWrapper } from "../../natsWrapper";
import mongoose from "mongoose";
import { Order } from "../../models/order.model";

export class OrderCreatedListener extends Listeners<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  durableName: string = "payments-order-created";
  async onMessage(data: OrderCreatedEvent["data"], msg: JsMsg) {
    const { id, status, ticket, userId, version } = data;
    const order = Order.build({
      id,
      userId,
      status,
      price: ticket.price,
      version,
    });
    await order.save();
    msg.ack();
  }
}
