import request from "supertest";
import { app } from "../../app";
import { signUp } from "../../utils/authHelper";
import mongoose from "mongoose";
import { sign } from "jsonwebtoken";

it("returns NotFoundError if the ticket does not exist", async () => {
  const cookie = signUp();
  const response = await request(app)
    .get(`/api/tickets/${new mongoose.Types.ObjectId()}`)
    .send()
    .set("Cookie", cookie!)
    .expect(404);
});
it("fetches the ticket if the ticket exists", async () => {
  const cookie = signUp();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie!)
    .send({ title: "John Cena is a retard", price: 200 })
    .expect(201);
  const ticketId = response.body.id;
  await request(app)
    .get(`/api/tickets/${ticketId}`)
    .set("Cookie", cookie!)
    .send()
    .expect(200);
});

it("returns NotAuthorizedError if one user tries to fetch other user's ticket", () => {});

it("returns BadRequestError if the ticket id is not a Mongo ObjectID", () => {});
