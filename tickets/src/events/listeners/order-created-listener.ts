import {
  Listeners,
  OrderCreatedEvent,
  Subjects,
} from "@tickets_microservice123/common";
import { JsMsg } from "nats";
import { Ticket } from "../../model/ticket.model";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { natsWrapper } from "../../nats-wrapper";
import mongoose from "mongoose";

export class OrderCreatedListener extends Listeners<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  durableName: string = "order-created";
  async onMessage(data: OrderCreatedEvent["data"], msg: JsMsg) {
    //todo Logic to lock the ticket
    // const { ticket } = data;
    const ticket = await Ticket.findById(data.ticket.id);
    if (!ticket) {
      throw new Error("Ticket not found");
    }
    ticket.set({ orderId: data.id });
    await ticket.save();
    const publisher = new TicketUpdatedPublisher(
      this.natsClient,
      natsWrapper.jetStreamManager,
      "TICKETS"
    );
    await publisher.publishData({
      id: ticket.id,
      title: ticket.title,
      price: Number(ticket.price),
      userId: ticket.price,
      version: ticket.version,
      orderId: ticket.orderId!,
    });
    msg.ack();
  }
}
