import { Subjects } from "./subjects";

export interface TicketCreatedEvent {
  subject: Subjects.TicketsCreated;
  data: {
    id: string;
    title: string;
    price: number;
  };
}
export interface TicketUpdatedEvent {
  subject: Subjects.TicketUpdated;
  data: {
    id: string;
    title: string;
    price: number;
  };
}
