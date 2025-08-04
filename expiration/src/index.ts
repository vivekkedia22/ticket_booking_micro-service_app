import { OrderCreatedListener } from "./events/listener/order-created-listener";
import { natsWrapper } from "./nats-wrapper";
import nats from "nats";
const start = async () => {
  if (!process.env.NATS_URL) {
    throw new Error(" NATS_URL is not defined");
  }

  try {
    await natsWrapper.connect(process.env.NATS_URL!);

    await natsWrapper.addStream();
    console.log("CONNECTED TO THE NATS SERVER");
    (async () => {
      for await (const s of natsWrapper.client.status()) {
        // console.log(`NATS status: ${s.type}`, s.data);
        if (s.type === nats.Events.Disconnect) {
          console.log("NATS connection closed. Exiting...");
          process.exit();
        }
      }
    })();
    process.on("SIGINT", async () => {
      console.log("Shutting down nats client…");
      await natsWrapper.client.close();
    });
    process.on("SIGTERM", async () => {
      console.log("Shutting down nats client…");
      await natsWrapper.client.close();
    });

    const orderCreatedListener = new OrderCreatedListener(
      natsWrapper.client,
      "ORDERS",
      natsWrapper.jetStreamManager
    );
    await orderCreatedListener.subsribe();
    orderCreatedListener.listen();
  } catch (error) {
    console.log("Error connecting to the NATS server", error);
  }
};
start();
