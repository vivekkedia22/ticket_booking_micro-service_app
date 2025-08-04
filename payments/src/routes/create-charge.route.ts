import { Router } from "express";
import { Request, Response } from "express";
import { body } from "express-validator";
import { Order } from "../models/order.model";
import {
  requireAuth,
  validateRequest,
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  BadRequestError,
} from "@tickets_microservice123/common";
import { stripe } from "../stripe";
import { Payment } from "../models/payment.model";
import { PaymentCreatedPublisher } from "../events/publishers/payment-created-publisher";
import { natsWrapper } from "../natsWrapper";
import mongoose from "mongoose";

const router = Router();
router.post(
  "/api/payments",
  requireAuth,
  [body("token").not().isEmpty(), body("orderId").not().isEmpty()],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId, price } = req.body;
    const userId = req.currentUser!.id;
    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError();
    }
    if (userId !== order?.userId) {
      throw new NotAuthorizedError();
    }
    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError(400, "Cannot pay for a cancelled order");
    }
    if (price !== order.price) {
      throw new BadRequestError(400, "Order price does not match");
    }

    const charge = await stripe.charges.create({
      currency: "usd",
      amount: order.price * 100,
      source: token,
    });
    const payment = Payment.build({ orderId: orderId, stripeId: charge.id });
    await payment.save();
    const publisher = new PaymentCreatedPublisher(
      natsWrapper.client,
      natsWrapper.jetStreamManager,
      "PAYMENTS"
    );
    publisher.publishData({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });
    res.status(201).send({ id: payment.id });
  }
);
export { router as createChargeRouter };
