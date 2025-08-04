import { Router } from "express";
import { body } from "express-validator";
import { Request, Response } from "express";
import {
  currentUser,
  requireAuth,
  validateRequest,
} from "@tickets_microservice123/common";

import { natsWrapper } from "../nats-wrapper";
// import { publisher } from "../events/publishers/ticket-created-publisher";
import { Ticket } from "../model/ticket.model";
import mongoose, { Mongoose } from "mongoose";
import { app } from "../app";
import { TicketCreatedPublisher } from "../events/publishers/ticket-created-publisher";
const router = Router();

router.post(
  "/api/tickets/",
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
    const ticket = Ticket.build({ title, price, owner });
    await ticket.save();
    const natsClient = natsWrapper.client;
    const jsm = natsWrapper.jetStreamManager;
    const publisher = new TicketCreatedPublisher(natsClient, jsm, "TICKETS");
    await publisher.publishData({
      id: String(ticket._id),
      title: ticket.title,
      price: Number(ticket.price),
      userId: ticket.owner,
      version: ticket.version,
    });

    res.status(201).send(ticket);
  }
);
export { router as createTicketRouter };
