import {
  Listeners,
  OrderCancelledEvent,
  Subjects,
} from "@tickets_microservice123/common";
import { JsMsg } from "nats";
import { natsWrapper } from "../../nats-wrapper";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { Ticket } from "../../model/ticket.model";

export class OrderCancelledListener extends Listeners<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  durableName: string = "order-cancelled";
  async onMessage(data: OrderCancelledEvent["data"], msg: JsMsg) {
    //todo logic to unlock the ticket
  const ticket = await Ticket.findById(data.ticket.id);
    if (!ticket) {
      throw new Error("Ticket not found");
    }
    ticket.set({ orderId: undefined });
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
      orderId: undefined,
    });
    msg.ack();
  }
}