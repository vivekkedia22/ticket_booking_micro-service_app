import request from "supertest";
import { app } from "../../app";
import { signUp } from "../../utils/authHelper";
import { Ticket } from "../../model/ticket.model";
import { natsWrapper } from "../../nats-wrapper";

//mock the actual file

it("has a route handler listening to /api/tickets for post requests", async () => {
  const response = await request(app).post("/api/tickets/").send({});
  expect(response.status).not.toEqual(404);
});

it("can only be accessed if the user is signed in", async () => {
  const response = await request(app)
    .post("/api/tickets/")
    .send({})
    .expect(401);
});

it("returns a status other than 401 if the user is signed in", async () => {
  const cookie = signUp();
  const response = await request(app)
    .post("/api/tickets/")
    .set("Cookie", cookie!)
    .send({});
  expect(response.status).not.toEqual(401);
});

it("returns an error if invalid title  is provided", async () => {
  const cookie = signUp();
  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie!)
    .send({ title: "", price: "200" })
    .expect(400);
});

it("returns an error if invalid price is provided", async () => {
  const cookie = signUp();
  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie!)
    .send({ title: "John Cena", price: "" })
    .expect(400);
});

it("creates a ticket with valid inputs", async () => {
  const cookie = signUp();
  let tickets = await Ticket.find({});
  const length = tickets.length;
  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie!)
    .send({ title: "John Cena is back", price: 200 })
    .expect(201);
  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(length + 1);
});
it('publishes an event',async()=>{
  const cookie = signUp();
  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie!)
    .send({ title: "John Cena is back", price: 200 })
    .expect(201);
    console.log(natsWrapper)
  expect(natsWrapper.client.jetstream).toHaveBeenCalled();
})