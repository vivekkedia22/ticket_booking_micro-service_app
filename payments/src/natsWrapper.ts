import { Subjects } from "@tickets_microservice123/common";
import nats, { NatsConnection, RetentionPolicy } from "nats";

class NatsWrapper {
  private _client?: nats.NatsConnection;
  private _jsm?: nats.JetStreamManager;
  get client(): NatsConnection {
    if (!this._client) {
      throw new Error("Cannot access NATS client before connecting");
    }
    return this._client;
  }
  get jetStreamManager(): nats.JetStreamManager {
    if (!this._jsm) {
      throw new Error("Cannot access JetStreamManager before connecting");
    }
    return this._jsm;
  }
  async connect(url: string): Promise<void> {
    try {
      this._client = await nats.connect({ servers: url });
      this._jsm = await this._client.jetstreamManager();
      console.log("connected to NATS");
    } catch (error) {
      throw error;
    }
  }
  async addStream() {
    try {
      await this.jetStreamManager.streams.add({
        name: "TICKETS",
        subjects: [Subjects.TicketUpdated, Subjects.TicketsCreated],
        retention: RetentionPolicy.Interest,
      });

      await this.jetStreamManager.streams.add({
        name: "ORDERS",
        subjects: [
          Subjects.OrderCreated,
          Subjects.OrderCancelled,
          Subjects.ExpirationComplete,
        ], //todo fix it
        retention: RetentionPolicy.Limits,
      });
      await this.jetStreamManager.streams.add({
        name: "PAYMENTS",
        subjects: [Subjects.PaymentCreated],
        retention: RetentionPolicy.Interest,
      });
    } catch (error: any) {
      if (error.message.includes("stream already exists")) {
        return;
      }
      if (error.message.includes("stream name already in use")) {
        return;
      }
      // console.log("error while making stream");
      // console.error(error.message);
    }
  }
}
export const natsWrapper = new NatsWrapper();
