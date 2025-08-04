import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from "@tickets_microservice123/common";
export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketsCreated = Subjects.TicketsCreated;
}
