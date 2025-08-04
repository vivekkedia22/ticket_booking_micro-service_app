import request from "supertest";
import { Ticket } from "../ticket.model";

it("implements optimized concurrency control", async () => {
  const ticket = Ticket.build({
    title: "this is a new concert",
    price: "2000",
  });
  await ticket.save();
  const ticket1 = await Ticket.findById(ticket.id);
  const ticket2 = await Ticket.findById(ticket.id);

  ticket1!.set({ price: "3000" });
  ticket2!.set({ price: "4000" });
  await ticket1!.save();
  try {
    await ticket2!.save();
  } catch (error) {
    console.log(await Ticket.findById(ticket._id));
    return;
  }
  throw new Error("Should not reach this point");
});

it("increments the version number on multiple saves", async () => {
  const ticket = Ticket.build({
    title: "this is a new concert",
    price: "2000",
  });
  await ticket.save();
  expect(ticket!.version).toEqual(0);
  ticket.set({ price: "3000" });
  await ticket.save();

  expect(ticket!.version).toEqual(1);
  ticket.set({ price: "4000" });
  await ticket.save();

  expect(ticket!.version).toEqual(2);
});
