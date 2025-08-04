import {
  Listeners,
  Subjects,
  TicketCreatedEvent,
} from "@tickets_microservice123/common";
import { JsMsg } from "nats";
import { Ticket } from "../../models/ticket.model";
import { natsWrapper } from "../../natsWrapper";
import mongoose from "mongoose";

export class TicketCreatedListener extends Listeners<TicketCreatedEvent> {
  subject: Subjects.TicketsCreated = Subjects.TicketsCreated;
  durableName: string = "ticket-created";
  async onMessage(data: TicketCreatedEvent["data"], msg: JsMsg): Promise<void> {
    const { id, title, price, version } = data;

    const ticket = Ticket.build({
      id: new mongoose.Types.ObjectId(id),
      title,
      price,
      version
    });
    await ticket.save();
    console.log(
      "this is ticket dat i got from the listener of ticket created",
      ticket
    );
    msg.ack();
  }
}
