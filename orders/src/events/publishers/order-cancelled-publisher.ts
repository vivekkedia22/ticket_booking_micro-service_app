import {
  Subjects,
  Publisher,
  OrderCancelledEvent,
} from "@tickets_microservice123/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
