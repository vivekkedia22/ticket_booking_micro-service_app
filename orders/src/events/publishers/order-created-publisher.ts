import {
  Publisher,
  OrderCreatedEvent,
  Subjects,
} from "@tickets_microservice123/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}

