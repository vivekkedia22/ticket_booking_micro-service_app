import request from "supertest";
import { app } from "../../app";
import { signUp } from "../../utils/authHelper";

const createTicket = () => {
  const cookie = signUp();
  return request(app)
    .post("/api/tickets/")
    .set("Cookie", cookie!)
    .send({ title: "abcdefgihj", price: 12 });
};
it("can fetch a list of tickets", async () => {
  const cookie = signUp();
  await createTicket();
  await createTicket();
  const response = await request(app)
    .get("/api/tickets/")
    .set("Cookie", cookie!)
    .send()
    .expect(200);
  expect(response.body.length).toEqual(2);
});

it("returns not found error when no ticket is found", async () => {
  const cookie = signUp();

  const response = await request(app)
    .get("/api/tickets/")
    .set("Cookie", cookie!)
    .send()
    .expect(200);
  expect(response.body.length).toEqual(0);
});
