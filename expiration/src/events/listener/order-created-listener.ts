import {
  Listeners,
  OrderCreatedEvent,
  Subjects,
} from "@tickets_microservice123/common";
import { JsMsg } from "nats";

import { natsWrapper } from "../../nats-wrapper";
import { expirationQueue } from "../../queues/expiration-queue";

export class OrderCreatedListener extends Listeners<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  durableName: string = "expiration-order-created";
  async onMessage(data: OrderCreatedEvent["data"], msg: JsMsg) {
    // const expiresIn = new Date(data.expiresAt).getTime() - new Date().getTime();
    const expiresIn = 40 * 1000;
    await expirationQueue.add({ orderId: data.id }, { delay: expiresIn });
    msg.ack();
  }
}
