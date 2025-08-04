import nats, {
  JetStreamClient,
  JetStreamManager,
  NatsConnection,
  RetentionPolicy,
} from "nats";
import { Subjects } from "./subjects";

interface Event {
  subject: Subjects;
  data: any;
}
export abstract class Publisher<T extends Event> {
  private natsClient: NatsConnection;
  private js: JetStreamClient;
  private jsm: JetStreamManager;

  protected sc = nats.StringCodec();

  abstract subject: T["subject"];
  protected stream: string;

  constructor(nc: NatsConnection, jsm: JetStreamManager, stream: string) {
    this.natsClient = nc;
    this.js = this.natsClient.jetstream();
    this.jsm = jsm;
    this.stream = stream;
  }
  async addStream() {
    try {
      await this.jsm.streams.add({
        name: this.stream,
        subjects: [this.subject],
        retention: RetentionPolicy.Limits,
      });
    } catch (error:any) {
      // await this.jsm.streams.delete(this.stream);
      console.log(error.message);
      console.error(error);
    }
  }
  async publishData(data: T["data"]) {
    await this.js.publish(this.subject, this.sc.encode(JSON.stringify(data)));
  }
}
