import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../app";
import { signUp } from "../../utils/authHelper";
import { Ticket } from "../../models/ticket.model";
import { natsWrapper } from "../../natsWrapper";

it("returns a 401 status when not signed in", async () => {
  await request(app)
    .post("/api/orders")
    .send({ ticketId: new mongoose.Types.ObjectId() })
    .expect(401);
});

it("returns a 400 status when given invalid inputs", async () => {
  const cookie = signUp();
  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", cookie!)
    .send({ ticketId: "" })
    .expect(400);

  await request(app)
    .post("/api/orders")
    .set("Cookie", cookie!)
    .send({ ticketId: "invalid" })
    .expect(400);
});

it("returns a 404 status when the ticket does not exist", async () => {
  const cookie = signUp();
  await request(app)
    .post("/api/orders")
    .set("Cookie", cookie!)
    .send({ ticketId: new mongoose.Types.ObjectId().toHexString() })
    .expect(404);
});

it("returns a 400 status when the ticket is already reserved", async () => {
  const cookie = signUp();
  const ticket = Ticket.build({ title: "this is a new concert", price: 2000 });
  await ticket.save();

  const order = await request(app)
    .post("/api/orders")
    .set("Cookie", cookie!)
    .send({ ticketId: ticket._id })
    .expect(201);
  expect(order.body.ticket.id).toEqual(String(ticket._id));
  await request(app)
    .post("/api/orders")
    .set("Cookie", cookie!)
    .send({ ticketId: ticket._id })
    .expect(400);
});

it("reserves a ticket", async () => {
  const cookie = signUp();
  const ticket = Ticket.build({ title: "this is a new concert", price: 2000 });
  await ticket.save();

  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", cookie!)
    .send({ ticketId: ticket._id })
    .expect(201);
});

it("emits an event when the order is created", async () => {
  const cookie = signUp();
  const ticket = Ticket.build({ title: "this is a new concert", price: 2000 });
  await ticket.save();

  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", cookie!)
    .send({ ticketId: ticket._id })
    .expect(201);

  expect(natsWrapper.client.jetstream).toHaveBeenCalled();
});
