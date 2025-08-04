import {
  ExpirationCompleteEvent,
  OrderStatus,
} from "@tickets_microservice123/common";
import { Ticket } from "../../../models/ticket.model";
import { natsWrapper } from "../../../natsWrapper";
import { ExpirationCompleteListener } from "../expiration-complete-listener";
import mongoose from "mongoose";
import { Order } from "../../../models/order.model";
import { StringCodec } from "nats";
const setup = async () => {
  const listener = new ExpirationCompleteListener(
    natsWrapper.client,
    "ORDERS",
    natsWrapper.jetStreamManager
  );
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId(),
    title: "concert",
    price: 20,
    version: 0,
  });
  await ticket.save();
  const order = Order.build({
    userId: "123",
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket,
  });
  await order.save();
  //create a fake data event
  const data: ExpirationCompleteEvent["data"] = {
    orderId: order._id.toHexString(),
  };
  //create a fake message object
  //@ts-ignore
  const msg: JsMsg = {
    ack: jest.fn(),
  };
  return { listener, data, msg, order, ticket };
};

it("updates the order status to cancelled", async () => {
  const { listener, data, msg, order } = await setup();
  //call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);
  //write assertions to make sure a ticket was created
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});
it("emits a OrdereCancelled event", async () => {
  const { listener, data, msg, order } = await setup();
  await listener.onMessage(data, msg);

  const publisher = natsWrapper.client.jetstream();
  const publish = publisher.publish as jest.Mock;
  expect(publish).toHaveBeenCalled();
  const sc = StringCodec();
  console.log("publish.mock.calls[0][1]", sc.decode(publish.mock.calls[0][1]));
  const eventData = JSON.parse(sc.decode(publish.mock.calls[0][1]));
  expect(eventData.id).toEqual(order.id);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();
  //call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);
  //write assertions to make sure ack function is called
  expect(msg.ack).toHaveBeenCalled();
});
