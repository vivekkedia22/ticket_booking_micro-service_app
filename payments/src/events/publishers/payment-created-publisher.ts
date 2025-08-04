import {
  PaymentCreatedEvent,
  Publisher,
  Subjects,
} from "@tickets_microservice123/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
