// publisher.ts
import { connect } from "nats";
import { TicketCreatedPublisher } from "./events/ticket-created-publisher";

(async () => {
  const nc = await connect({ servers: "localhost:4222" });
  const jsm = await nc.jetstreamManager();

  const pa = new TicketCreatedPublisher(nc, jsm, "TICKETS");
  // await pa.addStream();
  await pa.publishData({ id: "123", title: "concert", price: 20 });
  process.on("SIGINT", async () => {
    console.log("Shutting down…");
    await nc.drain(); // waits for in-flight acks
    await nc.close();
    process.exit();
  });
})();

/*
  // Create the stream if it doesn't exist
  try {

    await jsm.streams.add({
      name: "TICKETS",
      subjects: ["ticket.*"],
      retention: RetentionPolicy.Limits,
    });
    console.log("Stream created.");
  } catch (err: any) {
    if (err.message.includes("stream name already in use")) {
      console.log("Stream already exists.");
    } else {
      console.log("this is err", err);
    }
  }

  const data = {
    id: "123",
    title: "concert is here",
    price: 20,
  };
  const newData = {
    id: "123456",
    title: "concert_party",
    price: 200,
  };
  const pa = await js.publish(
    "ticket.created",
    sc.encode(JSON.stringify(data))
  );
  console.log("Published to stream created:", pa);
  let promises = [];
  for (let i = 0; i < 1; i++) {
    promises.push(
      js.publish("ticket.something", sc.encode(JSON.stringify(newData)))
    );
  }
  const pab = await Promise.all(promises);
  console.log("Published to stream something:", pab);
*/
