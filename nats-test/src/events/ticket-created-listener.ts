import { Listeners } from "./base-listener";

import nats, { JetStreamManager, NatsConnection } from "nats";
import { Subjects } from "./subjects";
import { TicketCreatedEvent,TicketUpdatedEvent } from "./ticket-created-event";

class TicketCreatedListener extends Listeners<TicketCreatedEvent> {
  subject: Subjects.TicketsCreated = Subjects.TicketsCreated;
  durableName: string = "ticket-created";

  constructor(
    natsClient: NatsConnection,
    stream: string,
    jsm: JetStreamManager
  ) {
    super(natsClient, stream, jsm);
  }

  onMessage(data: TicketCreatedEvent["data"], msg: nats.JsMsg): void {
    console.log(
      `msg received for ticket:created of #${
        msg.seq
      } with data ${this.sc.decode(msg.data)}`
    );
    // console.log(data.cost)
    msg.ack();
  }
}

class TicketUpdatedListener extends Listeners<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  durableName: string = "ticket-updated";

  constructor(
    natsClient: NatsConnection,
    stream: string,
    jsm: JetStreamManager
  ) {
    super(natsClient, stream, jsm);
  }

  onMessage(data: TicketUpdatedEvent["data"], msg: nats.JsMsg): void {
    console.log(
      `msg received for ticket:updated of #${
        msg.seq
      } with data ${this.sc.decode(msg.data)}`
    );
    // console.log(data.cost)
    msg.ack();
  }
}

(async () => {
  console.log("start");
  const nc = await nats.connect({ servers: "localhost:4222" });
  const js = nc.jetstream();
  const jsm = await nc.jetstreamManager();
  console.log(await jsm.streams.info("TICKETS"));
  const l1 = new TicketCreatedListener(nc, "TICKETS", jsm);
  const l2 = new TicketUpdatedListener(nc, "TICKETS", jsm);
  console.log("somthig something");
  await l1.subsribe();
  await l2.subsribe();
  console.log("tralaleo tralala");
  await l1.listen();
  await l2.listen();

  process.on("SIGINT", async () => {
    console.log("Shutting down…");
    await nc.drain(); // waits for in-flight acks
    await nc.close();
    process.exit();
  });
})();

