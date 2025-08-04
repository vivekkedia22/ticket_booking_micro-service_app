import {
  AckPolicy,
  DeliverPolicy,
  JetStreamClient,
  JetStreamManager,
  JsMsg,
  nanos,
  NatsConnection,
  RetentionPolicy,
  StringCodec,
} from "nats";
import { Subjects } from "./subjects";

interface Event {
  subject: Subjects;
  data: any;
}
export abstract class Listeners<T extends Event> {
  private natsClient: NatsConnection;
  private js: JetStreamClient;
  private jsm: JetStreamManager;

  protected sc = StringCodec();
  protected ackWait: number = 5 * 1000;
  protected stream: string;

  abstract subject: T["subject"];
  abstract durableName: string;
  abstract onMessage(data: T["data"], msg: JsMsg): void;

  constructor(
    natsClient: NatsConnection,
    stream: string,
    jsm: JetStreamManager
  ) {
    this.natsClient = natsClient;
    this.js = this.natsClient.jetstream();
    this.jsm = jsm;
    this.stream = stream;
  }

  async subsribe() {
    // await this.addStream();

    try {
      await this.jsm.consumers.add(this.stream, {
        name: this.durableName,
        durable_name: this.durableName,
        ack_policy: AckPolicy.Explicit,
        deliver_policy: DeliverPolicy.All,
        ack_wait: nanos(this.ackWait),
        filter_subjects: [this.subject],
        // max_deliver:1,
      });

    } catch (err: any) {
      // await this.jsm.consumers.delete(this.stream, this.durableName);
      if (err.message.includes("consumer already exists")) {
        console.log("Consumer already exists.");
      } else {
        console.log(err.message);
        console.error("Error adding consumer:", err);
        throw err;
      }
    }
  }
  async listen() {
    // console.log("hulalal");
    const consumer = await this.js.consumers.get(this.stream, this.durableName);
    // console.log("this is info", await consumer.info());
    const messages = await consumer.consume();
    // console.log("meow");
    (async () => {
      for await (const msg of messages) {
        console.log(`msg received for ${this.subject} of #${msg.seq} `);
        this.onMessage(this.sc.decode(msg.data), msg);

        // msg.ack();
      }
    })();
    // console.log("bow");
    // return consumer;
  }
}
