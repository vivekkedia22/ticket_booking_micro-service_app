import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from "@tickets_microservice123/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
