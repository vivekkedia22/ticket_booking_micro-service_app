import {
  Publisher,
  Subjects,
  TicketUpdatedEvent,
} from "@tickets_microservice123/common";
export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
