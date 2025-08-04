import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from "@tickets_microservice123/common";
import { body } from "express-validator";
import { Ticket } from "../models/ticket.model";
import { Order } from "../models/order.model";
import { natsWrapper } from "../natsWrapper";
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";
const router = Router();
router.post(
  "/api/orders",
  requireAuth,
  [
    body("ticketId")
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage("TicketId is required"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;
    const foundTicket = await Ticket.findById(ticketId);
    if (!foundTicket) {
      throw new NotFoundError();
    }
    const isTicketReserved = await foundTicket.isReserved();
    if (isTicketReserved) {
      throw new BadRequestError(400, "Ticket is already reserved");
    }
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + 15 * 60);
    const order = Order.build({
      userId: req.currentUser!.id,
      ticket: foundTicket,
      expiresAt: expiration,
      status: OrderStatus.Created,
    });
    await order.save();
    //todo emit the order created event
    const publisher = new OrderCreatedPublisher(
      natsWrapper.client,
      natsWrapper.jetStreamManager,
      "ORDERS"
    );
    await publisher.publishData({
      id: order.id,
      version: order.version,
      userId: order.userId,
      status: order.status,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: foundTicket.id,
        price: foundTicket.price,
      },
    });

    res.status(201).send(order);
  }
);
export { router as createOrderRouter };
