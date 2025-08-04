    import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../app";
import { signUp, signUpNew } from "../../utils/authHelper";
import { Order } from "../../models/order.model";
import {
  NotFoundError,
  NotAuthorizedError,
} from "@tickets_microservice123/common";
import { Ticket } from "../../models/ticket.model";

const buildTicket = async () => {
  const ticket = Ticket.build({ title: "this is a new concert", price: 2000 });
  await ticket.save();
  return ticket;
};

it("returns a 401 status when not signed in", async () => {
  await request(app)
    .get(`/api/orders/${new mongoose.Types.ObjectId()}`)
    .send()
    .expect(401);
});

it("returns a 404 status when the order is not found", async () => {
  const cookie = signUp();
  await request(app)
    .get(`/api/orders/${new mongoose.Types.ObjectId()}`)
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
    .get(`/api/orders/${order._id}`)
    .set("Cookie", cookie!)
    .send()
    .expect(401);
});

it("returns the order", async () => {
  const { sessionCookie: cookie, id: userId } = signUpNew();
  const ticket = await buildTicket();
  const order = await Order.create({
    userId,
    ticket,
  });

  const response = await request(app)
    .get(`/api/orders/${order._id}`)
    .set("Cookie", cookie!)
    .expect(200);

  expect(response.body.id).toEqual(String(order._id));
  expect(response.body.userId).toEqual(String(order.userId));
  expect(response.body.ticket.id).toEqual(String(order.ticket._id));
});
