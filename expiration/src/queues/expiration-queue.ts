import Queue from "bull";
import { delay } from "nats";
import { ExpirationCompletePublisher } from "../events/publisher/expiration-complete-publisher";
import { natsWrapper } from "../nats-wrapper";

interface Payload {
  orderId: string;
}

export const expirationQueue = new Queue<Payload>("order:expiration", {
  redis: { host: process.env.REDIS_HOST },
});

expirationQueue.process(async (job) => {
  const publisher = new ExpirationCompletePublisher(
    natsWrapper.client,
    natsWrapper.jetStreamManager,
    "ORDERS"
  );
  publisher.publishData({ orderId: job.data.orderId });
});
    