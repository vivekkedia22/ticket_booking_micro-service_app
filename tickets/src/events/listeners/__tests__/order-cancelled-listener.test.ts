import { OrderCancelledEvent } from "@tickets_microservice123/common";
import nats, { StringCodec } from "nats";
import mongoose from "mongoose";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { Ticket } from "../../../model/ticket.model";

const setup = async () => {
  //create an instance of the listener
  const listener = new OrderCancelledListener(
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
  const data: OrderCancelledEvent["data"] = {
    id: ticket.orderId!,
    ticket: {
      id: ticket._id.toHexString(),
    },
    version: 1,
  };
  //create a fake message object
  //@ts-ignore
  const msg: JsMsg = {
    ack: jest.fn(),
  };

  return { listener, data, msg, ticket };
};

it("updates the ticket,publishes an event and acks the message", async () => {
  const { listener, data, msg, ticket } = await setup();
  //call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);
  //write assertions to make sure a ticket was created
  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).not.toBeDefined();
  expect(msg.ack).toHaveBeenCalled();

  //publishes a ticket updated event
  expect(natsWrapper.client.jetstream).toHaveBeenCalled();
});
