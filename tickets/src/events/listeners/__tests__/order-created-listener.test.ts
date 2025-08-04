import {
  OrderCreatedEvent,
  OrderStatus,
} from "@tickets_microservice123/common";
import nats, { StringCodec } from "nats";
import mongoose from "mongoose";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";
import { Ticket } from "../../../model/ticket.model";

const setup = async () => {
  //create an instance of the listener
  const listener = new OrderCreatedListener(
    natsWrapper.client,
    "TICKETS",
    natsWrapper.jetStreamManager
  );
  //create and save a ticket
  const ticket = Ticket.build({
    title: "concert",
    price: "20",
    owner: "123",
  });
  ticket.orderId = new mongoose.Types.ObjectId().toHexString();
  await ticket.save();
  //create a fake data event
  const data: OrderCreatedEvent["data"] = {
    id: ticket.orderId!,
    ticket: {
      id: ticket._id.toHexString(),
      price: Number(ticket.price),
    },
    status: OrderStatus.Created,
    userId: "123",
    version: 0,
    expiresAt: "123",
  };
  //create a fake message object
  //@ts-ignore
  const msg: JsMsg = {
    ack: jest.fn(),
  };

  return { listener, data, msg, ticket };
};

it("sets the userId of the ticket", async () => {
  const { listener, data, msg, ticket } = await setup();
  //   const someTicket = await Ticket.findById(ticket.id);
  //   someTicket!.set({ title: "hijru boys" });
  //   console.log("hello hney boney", someTicket);
  await listener.onMessage(data, msg);
  //   await someTicket!.save();
  const updatedTicket = await Ticket.findById(ticket.id);
  console.log(updatedTicket);
  expect(updatedTicket!.orderId).toEqual(data.id);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});

it("publishes a ticket updated event", async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  const jetStreamClient = natsWrapper.client.jetstream();

  // Spy on publish
  const publishMock = jetStreamClient.publish as jest.Mock;

  await listener.onMessage(data, msg);

  // Check publish was called
  expect(publishMock).toHaveBeenCalled();
  const sc = StringCodec();
  const ticketUpdatedData = JSON.parse(sc.decode(publishMock.mock.calls[0][1]));
  console.log(data);
  console.log(ticketUpdatedData);
  expect(data.id).toEqual(ticketUpdatedData.orderId);
});
