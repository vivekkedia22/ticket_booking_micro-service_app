import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../app";
import { signUp, signUpNew } from "../../utils/authHelper";
import { Order } from "../../models/order.model";
import {
  NotFoundError,
  NotAuthorizedError,
  OrderStatus,
} from "@tickets_microservice123/common";
import { Ticket } from "../../models/ticket.model";

const buildTicket = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId(),
    title: "this is a new concert",
    price: 2000,
    version: 0,
  });
  await ticket.save();
  return ticket;
};

it("returns a 401 status when not signed in", async () => {
  await request(app)
    .patch(`/api/orders/${new mongoose.Types.ObjectId()}`)
    .send()
    .expect(401);
});

it("returns a 404 status when the order is not found", async () => {
  const cookie = signUp();
  await request(app)
    .patch(`/api/orders/${new mongoose.Types.ObjectId()}`)
    .set("Cookie", cookie!)
    .send()
    .expect(404);
});

it("returns a 401 status when the user is not authorized", async () => {
  const cookie = signUp();
  const order = await Order.create({
    userId: new mongoose.Types.ObjectId().toHexString(),
    ticket: new mongoose.Types.ObjectId(),
  });
  await request(app)
    .patch(`/api/orders/${order._id}`)
    .set("Cookie", cookie!)
    .send()
    .expect(401);
});

it("patch the order", async () => {
  const { sessionCookie: cookie, id: userId } = signUpNew();
  const ticket = await buildTicket();
  const order = await Order.create({
    userId,
    ticket,
  });

  const response = await request(app)
    .patch(`/api/orders/${order._id}`)
    .set("Cookie", cookie!)
    .expect(200);

  expect(response.body.status).toEqual(OrderStatus.Cancelled);
});
