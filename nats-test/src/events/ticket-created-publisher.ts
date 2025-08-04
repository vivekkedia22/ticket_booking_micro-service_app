import { JetStreamManager, NatsConnection } from "nats";
import { Publisher } from "./base-publisher";
import { Subjects } from "./subjects";
import { TicketCreatedEvent } from "./ticket-created-event";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketsCreated = Subjects.TicketsCreated;
  stream: string = "TICKETS";
  constructor(nc: NatsConnection, jsm: JetStreamManager,stream: string) {
    super(nc, jsm,stream);
  }
}
