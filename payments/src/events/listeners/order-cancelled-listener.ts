import {
  BadRequestError,
  Listeners,
  OrderCancelledEvent,
  OrderStatus,
  Subjects,
} from "@tickets_microservice123/common";
import { JsMsg } from "nats";
import { natsWrapper } from "../../natsWrapper";
import { Order } from "../../models/order.model";

export class OrderCancelledListener extends Listeners<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  durableName: string = "payments-order-cancelled";
  async onMessage(data: OrderCancelledEvent["data"], msg: JsMsg) {
    const order = await Order.findById(data.id);
    if (!order) {
      throw new BadRequestError(400, "Order not found");
    }
    order.set({ status: OrderStatus.Cancelled, version: data.version });
    await order.save();
    msg.ack();
  }
}
