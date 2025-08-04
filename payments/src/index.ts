import mongoose from "mongoose";
import nats, { RetentionPolicy } from "nats";
import { natsWrapper } from "./natsWrapper";
import { app } from "./app";
import { Subjects } from "@tickets_microservice123/common";
import { OrderCreatedListener } from "./events/listeners/order-created-listener";
import { OrderCancelledListener } from "./events/listeners/order-cancelled-listener";

const start = async () => {
  if (!process.env.JWT_KEY || !process.env.MONGO_URI || !process.env.NATS_URL) {
    throw new Error("JWT_KEY or MONGO_URI  or NATS_URL is not defined");
  }

  try {
    await natsWrapper.connect(process.env.NATS_URL!);

    await natsWrapper.addStream();

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
    const orderCancelledListener = new OrderCancelledListener(
      natsWrapper.client,
      "ORDERS",
      natsWrapper.jetStreamManager
    );
    await orderCreatedListener.subsribe();
    await orderCancelledListener.subsribe();
    orderCreatedListener.listen();
    orderCancelledListener.listen();
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("Connected to mongoDB!!");
  } catch (error) {
    console.log("Error connecting to the mongodb database", error);
  }
};
start();

app.listen(3003, () => {
  console.log(`Payments service is running on port 3003`);
});
