import mongoose from "mongoose";
import { app } from "./app";
import { natsWrapper } from "./natsWrapper";
import { TicketCreatedListener } from "./events/listeners/ticket-created-listener";
import { TicketUpdatedListener } from "./events/listeners/ticket-updated-listener";
import { Subjects } from "@tickets_microservice123/common";
import { RetentionPolicy } from "nats";
import { ExpirationCompleteListener } from "./events/listeners/expiration-complete-listener";
import { PaymentCreatedListener } from "./events/listeners/payment-created-listener";
const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }
  if (!process.env.NATS_URL) {
    throw new Error("NATS_URL must be defined");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_DB_URI must be defined");
  }
  try {
    await natsWrapper.connect(process.env.NATS_URL!);
    console.log("NATS CONNECTED!");
  } catch (error: any) {
    console.log("NATS_CONNECTION_ERROR", error.message);
  }

  await natsWrapper.addStream();

  const ticketCreatedListener = new TicketCreatedListener(
    natsWrapper.client,
    "TICKETS",
    natsWrapper.jetStreamManager
  );
  const ticketUpdatedListener = new TicketUpdatedListener(
    natsWrapper.client,
    "TICKETS",
    natsWrapper.jetStreamManager
  );
  const expirationCompleteListener = new ExpirationCompleteListener(
    natsWrapper.client,
    "ORDERS",
    natsWrapper.jetStreamManager
  );
  const paymentCreatedListener = new PaymentCreatedListener(
    natsWrapper.client,
    "PAYMENTS",
    natsWrapper.jetStreamManager
  );
  await ticketCreatedListener.subsribe();
  await ticketUpdatedListener.subsribe();
  await expirationCompleteListener.subsribe();
  await paymentCreatedListener.subsribe();

  ticketCreatedListener.listen();
  ticketUpdatedListener.listen();
  expirationCompleteListener.listen();
  paymentCreatedListener.listen();
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("connected to mongodb");
  } catch (error) {
    console.log("Error in connecting to mongo db");
  }
};
start();
app.listen(3002, () => {
  console.log(`   Orders Service is running on port 3002  ⚙️ 💻️`);
});
