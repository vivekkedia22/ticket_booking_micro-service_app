import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import request from "supertest";

import { Order } from "../../models/order.model";
import { OrderStatus } from "@tickets_microservice123/common";
import { app } from "../../app";
import { stripe } from "../../stripe";
import { Payment } from "../../models/payment.model";

jest.mock("../../stripe");
const signUpNew = () => {
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email: `${Math.random()}@test.com`,
  };
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  const sessionObj = { jwt: token };
  const base64 = Buffer.from(JSON.stringify(sessionObj)).toString("base64");
  const sessionCookie = [`session=${base64}`];
  return { sessionCookie, userId: payload.id };
};
const setup = async () => {
  const { sessionCookie, userId } = signUpNew();
  const validOrder = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    status: OrderStatus.Created,
    price: 10,
    version: 0,
  });
  const cancelledOrder = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    status: OrderStatus.Cancelled,
    price: 10,
    version: 0,
  });
  const unauthorizedOrder = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    price: 10,
    version: 0,
  });

  await validOrder.save();
  await cancelledOrder.save();
  await unauthorizedOrder.save();

  return { sessionCookie, validOrder, unauthorizedOrder, cancelledOrder };
};

it("returns a 404 status when the order is not found", async () => {
  const { sessionCookie, validOrder, unauthorizedOrder, cancelledOrder } =
    await setup();
  await request(app)
    .post("/api/payments/")
    .send({
      orderId: new mongoose.Types.ObjectId().toHexString(),
      token: "token",
    })
    .set("Cookie", sessionCookie)
    .expect(404);
});
it("returns a 401 status when order is not owned by the user", async () => {
  const { sessionCookie, unauthorizedOrder } = await setup();
  await request(app)
    .post("/api/payments/")
    .send({
      orderId: unauthorizedOrder.id,
      token: "token",
    })
    .set("Cookie", sessionCookie)
    .expect(401);
});
it("returns a 400 status when purchasing the order that is cancelled", async () => {
  const { sessionCookie, cancelledOrder } = await setup();
  await request(app)
    .post("/api/payments/")
    .send({
      orderId: cancelledOrder.id,
      token: "token",
    })
    .set("Cookie", sessionCookie)
    .expect(400);
});
it("returns a 400 error when the price doesnt match the provided price", async () => {
  const { sessionCookie, validOrder } = await setup();
  await request(app)
    .post("/api/payments/")
    .send({
      orderId: validOrder.id,
      token: "token",
      price: 1230,
    })
    .set("Cookie", sessionCookie)
    .expect(400);
});

it("creates the charge when the order is valid", async () => {
  const { sessionCookie, validOrder } = await setup();
  await request(app)
    .post("/api/payments/")
    .send({
      orderId: validOrder.id,
      token: "token",
      price: 10,
    })
    .set("Cookie", sessionCookie)
    .expect(201);
});

it("returns a 201 with valid input", async () => {
  const { sessionCookie, validOrder } = await setup();
  await request(app)
    .post("/api/payments/")
    .send({
      orderId: validOrder.id,
      token: "tok_visa",
      price: 10,
    })
    .set("Cookie", sessionCookie)
    .expect(201);

  expect(stripe.charges.create).toHaveBeenCalled();
  //@ts-ignore
  const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  console.log(chargeOptions);
  expect(chargeOptions.source).toEqual("tok_visa");
  expect(chargeOptions.amount).toEqual(1000);
  expect(chargeOptions.currency).toEqual("usd");
  const payment = await Payment.findOne({
    orderId: validOrder.id,
    stripeId: "abcdefgg",
  });
  expect(payment).not.toBeNull();
});
