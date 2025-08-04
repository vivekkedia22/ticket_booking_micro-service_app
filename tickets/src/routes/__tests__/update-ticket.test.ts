import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { signUp, signUpNew } from "../../utils/authHelper";
import { natsWrapper } from "../../nats-wrapper";
import { Ticket } from "../../model/ticket.model";

const createTicket = async () => {
  const cookie = signUp();
  return request(app)
    .post("/api/tickets/")
    .set("Cookie", cookie!)
    .send({ title: "abcdefgihj", price: 12 });
};

it("returns BadRequestError if the title or price is not valid", async () => {
  const cookie = signUp();
  const response = await createTicket();
  const ticketId = response.body.id;
  await request(app)
    .put(`/api/tickets/${ticketId}`)
    .set("Cookie", cookie!)
    .send({ title: "", price: 2000 })
    .expect(400);
  await request(app)
    .put(`/api/tickets/${ticketId}`)
    .set("Cookie", cookie!)
    .send({ title: "jsdhfkjdshf dfjdsf kldsf", price: -1209 })
    .expect(400);
});
it("returns NotFoundError if the ticket id does not exist", async () => {
  const cookie = signUp();
  await request(app)
    .put(`/api/tickets/${new mongoose.Types.ObjectId()}`)
    .set("Cookie", cookie!)
    .send({ title: "John Cena is a retard ", price: 2000 })
    .expect(404);
});
it("returns NotAuthorizedError if the user is not authrenticated", async () => {
  await request(app)
    .put(`/api/tickets/${new mongoose.Types.ObjectId()}`)
    .send({ title: "John Cena is a retard ", price: 2000 })
    .expect(401);
});
it("returns NotAuthorizedError if the user doesnt owns the ticket", async () => {
  const cookie = signUpNew();
  await createTicket();
  const ticketId = (await createTicket()).body.id;

  await request(app)
    .put(`/api/tickets/${ticketId}`)
    .set("Cookie", cookie!)
    .send({ title: "John Cena is a retard bhadwa", price: 2000 })
    .expect(401);

  const getResponse = await request(app)
    .get(`/api/tickets/${ticketId}`)
    .set("Cookie", cookie!)
    .send()
    .expect(200);
  expect(getResponse.body.title).not.toEqual("John Cena is a retard bhadwa");
  expect(getResponse.body.price).not.toEqual("2000");
});
it("updates the ticket provided valid inputs", async () => {
  const cookie = signUp();

  const ticketId = (await createTicket()).body.id;
  const response = await request(app)
    .put(`/api/tickets/${ticketId}`)
    .set("Cookie", cookie!)
    .send({ title: "John Cena is a retard bhadwa", price: 2000 })
    .expect(201);
  expect(response.body.title).toEqual("John Cena is a retard bhadwa");
  expect(response.body.price).toEqual("2000");
});
it("publishes an event", async () => {
  const cookie = signUp();
  const ticketId = (await createTicket()).body.id;
  await request(app)
    .put(`/api/tickets/${ticketId}`)
    .set("Cookie", cookie!)
    .send({ title: "John Cena is a retard ", price: 2000 })
    .expect(201);

  expect(natsWrapper.client.jetstream).toHaveBeenCalled();
});

it("rejects updates if the ticket is reserved", async () => {
  const cookie = signUp();
  const response = await request(app)
    .post("/api/tickets/")
    .set("Cookie", cookie!)
    .send({ title: "abcdefgihj", price: 12 });
  const ticketId = response.body.id;
  const ticket = await Ticket.findById(ticketId);
  ticket!.orderId = new mongoose.Types.ObjectId().toHexString();
  await ticket!.save();

  await request(app)
    .put(`/api/tickets/${ticketId}`)
    .set("Cookie", cookie!)
    .send({ title: "John Cena is a retard ", price: 2000 })
    .expect(400);
});
