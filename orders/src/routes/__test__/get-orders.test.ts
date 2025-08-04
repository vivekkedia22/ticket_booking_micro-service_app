import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../app";
import { signUp, signUpNew } from "../../utils/authHelper";
import { Ticket } from "../../models/ticket.model";

const buildTicket =async () => {
  const ticket = Ticket.build({ title: "this is a new concert", price: 2000 });
  await ticket.save();
  return ticket;
};

it("returns a 401 status when not signed in", async () => {
  await request(app)
    .get("/api/orders")
    .send({ ticketId: new mongoose.Types.ObjectId() })
    .expect(401);
});

it("returns an empty array when the user does not have orders", async () => {
  const cookie = signUp();
  const ticket = await buildTicket();
  const response = await request(app)
    .get("/api/orders")
    .set("Cookie", cookie!)
    .expect(200);
  expect(response.body.length).toEqual(0);
});
it("returns orders", async () => {
  let { sessionCookie: cookie1, id: userId1 } = signUpNew();
  let { sessionCookie: cookie2, id: userId2 } = signUpNew();
  const ticket = await buildTicket();
  const ticket2 = await buildTicket();
  const ticket3 = await buildTicket();

  await request(app)
    .post("/api/orders")
    .set("Cookie", cookie1!)
    .send({ ticketId: ticket._id })
    .expect(201);
  await request(app)
    .post("/api/orders")
    .set("Cookie", cookie2!)
    .send({ ticketId: ticket2._id })
    .expect(201);
  await request(app)
    .post("/api/orders")
    .set("Cookie", cookie2!)
    .send({ ticketId: ticket3._id })
    .expect(201);

  const response = await request(app)
    .get("/api/orders")
    .set("Cookie", cookie1!)
    .expect(200);

  expect(response.body.length).toEqual(1);
  expect(response.body[0].ticket.id).toEqual(String(ticket._id));
  expect(response.body[0].userId).toEqual(String(userId1));

  const response2 = await request(app)
    .get("/api/orders")
    .set("Cookie", cookie2!)
    .expect(200);

  expect(response2.body.length).toEqual(2);
  expect(response2.body[0].ticket.id).toEqual(String(ticket2._id));
  expect(response2.body[0].userId).toEqual(String(userId2));
  expect(response2.body[1].ticket.id).toEqual(String(ticket3._id));
  expect(response2.body[1].userId).toEqual(String(userId2));
});

