import { Subjects } from "@tickets_microservice123/common";
import nats, {
  DiscardPolicy,
  JetStreamManager,
  NatsConnection,
  RetentionPolicy,
} from "nats";
class NatsWrapper {
  private _client?: NatsConnection;
  private _jsm?: JetStreamManager;
  get client() {
    if (!this._client) {
      throw new Error("Cannot access NATS client before connecting");
    }
    return this._client;
  }
  get jetStreamManager() {
    if (!this._jsm) {
      throw new Error("Cannot access NATS client before connecting");
    }
    return this._jsm;
  }

  async connect(url: string) {
    this._client = await nats.connect({ servers: url });
    this._jsm = await this._client.jetstreamManager();
  }
  async addStream() {
    try {
      await this._jsm?.streams.add({
        name: "ORDERS",
        subjects: [Subjects.OrderCreated, Subjects.OrderCancelled,Subjects.ExpirationComplete], //!todo need to be changed
        retention: RetentionPolicy.Interest,
      });
      await this._jsm?.streams.add({
        name: "TICKETS",
        subjects: [Subjects.TicketUpdated, Subjects.TicketsCreated],
        retention: RetentionPolicy.Interest,
      });
      await this.jetStreamManager.streams.add({
        name: "PAYMENTS",
        subjects: [Subjects.PaymentCreated],
        retention: RetentionPolicy.Interest,
      });
    } catch (error: any) {
      if (error.message.includes("stream already exists")) {
        //skip
      }
    }
  }
}
export const natsWrapper = new NatsWrapper();
