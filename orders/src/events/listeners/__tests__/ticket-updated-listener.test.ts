import { TicketUpdatedEvent } from "@tickets_microservice123/common";
import { natsWrapper } from "../../../natsWrapper";

import mongoose from "mongoose";
import { JsMsg } from "nats";
import { Ticket } from "../../../models/ticket.model";
import { TicketUpdatedListener } from "../ticket-updated-listener";

const setup = async () => {
  //create an instance of the listener
  const listener = new TicketUpdatedListener(
    natsWrapper.client,
    "TICKETS",
    natsWrapper.jetStreamManager
  );
  //create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId(),
    title: "concert",
    price: 20,
    version: 0,
  });
  await ticket.save();
  //create a fake data event
  const data: TicketUpdatedEvent["data"] = {
    id: ticket.id,
    title: "concert",
    price: 20,
    userId: "123",
    version: 1,
  };
  //create a fake message object
  //@ts-ignore
  const msg: JsMsg = {
    ack: jest.fn(),
  };

  return { ticket, listener, data, msg };
};

it("finds,updates and save a ticket", async () => {
  const { listener, data, msg ,ticket} = await setup();
  //call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);
  //write assertions to make sure a ticket was created
  const updatedTicket = await Ticket.findById(data.id);
  expect(updatedTicket).toBeDefined();
  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(ticket.version+1);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();
  //call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  //write assertions to make sure ack function is called
  expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event has a skipped version number', async () => {
  const { listener, data, msg } = await setup();
  data.version = 10;
  try {
    await listener.onMessage(data, msg);
  } catch (err) {}
  expect(msg.ack).not.toHaveBeenCalled();
});