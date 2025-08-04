import { TicketCreatedEvent } from "@tickets_microservice123/common";
import { natsWrapper } from "../../../natsWrapper";
import { TicketCreatedListener } from "../ticket-created-listener";
import mongoose from "mongoose";
import { JsMsg } from "nats";
import { Ticket } from "../../../models/ticket.model";

const setup = async () => {
  //create an instance of the listener
  const listener = new TicketCreatedListener(
    natsWrapper.client,
    "TICKETS",
    natsWrapper.jetStreamManager
  );
  //create a fake data event
  const data: TicketCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
    userId: "123",
    version: 0,
  };
  //create a fake message object
  //@ts-ignore
  const msg: JsMsg = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it("creates and save a ticket", async () => {
  const { listener, data, msg } = await setup();
  //call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);
  //write assertions to make sure a ticket was created
  const ticket = await Ticket.findById(data.id);
  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();
    //call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  //write assertions to make sure ack function is called
  expect(msg.ack).toHaveBeenCalled();
});
