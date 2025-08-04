import {
  Listeners,
  OrderStatus,
  PaymentCreatedEvent,
  Subjects,
} from "@tickets_microservice123/common";
import { JsMsg } from "nats";
import { Order } from "../../models/order.model";

export class PaymentCreatedListener extends Listeners<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  durableName: string = "payment-created";
  async onMessage(data: PaymentCreatedEvent["data"], msg: JsMsg) {
    const { id, orderId, stripeId } = data;
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }
    order.set({ status: OrderStatus.Complete });
    await order.save();
    msg.ack();
  }
}
