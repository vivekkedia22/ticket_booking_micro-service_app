import {
  OrderCancelledEvent,
  OrderCreatedEvent,
  OrderStatus,
} from "@tickets_microservice123/common";
import { Order } from "../../../models/order.model";
import { natsWrapper } from "../../../natsWrapper";
import { OrderCreatedListener } from "../order-created-listener";
import mongoose from "mongoose";
import { JsMsg } from "nats";
import { JsMsgImpl } from "nats/lib/jetstream/jsmsg";
import { OrderCancelledListener } from "../order-cancelled-listener";
const setup = async () => {
  const listener = new OrderCancelledListener(
    natsWrapper.client,
    "ORDERS",
    natsWrapper.jetStreamManager
  );
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: "123",
    status: OrderStatus.Created,
    price: 10,
    version: 0,
  });
  await order.save();
  const data: OrderCancelledEvent["data"] = {
    id: order.id,
    version: 1,
    ticket: {
      id: "123",
    },
  };

  //@ts-ignore
  const msg: JsMsg = {
    ack: jest.fn(),
  };
  return { listener, data, order, msg };
};
it("updates the order info", async () => {
  const { listener, data, msg, order } = await setup();

  await listener.onMessage(data, msg);
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
  expect(updatedOrder!.version).toEqual(1);
});
it("acks the message", async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
