import {
  OrderCreatedEvent,
  OrderStatus,
} from "@tickets_microservice123/common";
import { Order } from "../../../models/order.model";
import { natsWrapper } from "../../../natsWrapper";
import { OrderCreatedListener } from "../order-created-listener";
import mongoose from "mongoose";
import { JsMsg } from "nats";
import { JsMsgImpl } from "nats/lib/jetstream/jsmsg";
const setup = async () => {
  const listener = new OrderCreatedListener(
    natsWrapper.client,
    "ORDERS",
    natsWrapper.jetStreamManager
  );
  const data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    userId: "123",
    expiresAt: "123",
    version: 0,
    ticket: {
      id: "123",
      price: 10,
    },
  };
  //@ts-ignore
  const msg: JsMsg = {
    ack: jest.fn(),
  };
  return { listener, data, msg };
};
it("replicates the order info", async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  const order = await Order.findById(data.id);
  if (!order) {
    throw new Error("Order not found");
  }
  expect(order!.price).toEqual(data.ticket.price);
});
it("acks the message", async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
