import { Router } from "express";
import { body } from "express-validator";
import { Request, Response } from "express";
import {
  BadRequestError,
  currentUser,
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from "@tickets_microservice123/common";

import { Ticket } from "../model/ticket.model";
import { natsWrapper } from "../nats-wrapper";
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher";
const router = Router();

router.put(
  "/api/tickets/:id",
  [
    body("title")
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ min: 10 })
      .withMessage("Title must be at least 10 characters"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be greater than 0"),
  ],
  requireAuth,
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;
    const owner = req.currentUser?.id!;
    const { id } = req.params;
    let ticket = await Ticket.findById(id);

    if (!ticket) {
      throw new NotFoundError();
    }
    if (ticket.orderId) {
      throw new BadRequestError(400,"Ticket is reserved");
    }
    if (ticket.owner !== owner) {
      throw new NotAuthorizedError();
    }

    ticket.set({ title, price });
    await ticket.save();
    const natsClient = natsWrapper.client;
    const jsm = natsWrapper.jetStreamManager;
    const publisher = new TicketUpdatedPublisher(natsClient, jsm, "TICKETS");
    publisher.publishData({
      id: String(ticket!._id),
      title: ticket!.title,
      price: Number(ticket!.price),
      userId: ticket!.owner,
      version: ticket!.version,
    });

    res.status(201).send(ticket);
  }
);
export { router as updateTicketRouter };
