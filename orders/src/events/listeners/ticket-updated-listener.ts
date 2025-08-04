import {
  Listeners,
  Subjects,
  TicketCreatedEvent,
  TicketUpdatedEvent,
} from "@tickets_microservice123/common";
import { JsMsg } from "nats";
import { Ticket } from "../../models/ticket.model";
import { natsWrapper } from "../../natsWrapper";
import mongoose from "mongoose";

export class TicketUpdatedListener extends Listeners<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  durableName: string = "ticket-updated";
  async onMessage(data: TicketUpdatedEvent["data"], msg: JsMsg): Promise<void> {
    const { id, title, price, version } = data;

    const ticket = await Ticket.findOne({
      _id: id,
      version: version - 1,
    });

    if (!ticket) {
      throw new Error(
        "whats this re. when there is no ticket what the hell r u updating"
      );
    }

    ticket.set({ id, title, price ,version});
    await ticket.save();

    console.log(
      "this is ticket i got from the ticket updated listener",
      ticket
    );
    msg.ack();
  }
}
