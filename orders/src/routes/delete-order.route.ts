import { Router, Request, Response } from "express";
import { Order } from "../models/order.model";
import {
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  requireAuth,
} from "@tickets_microservice123/common";
import { natsWrapper } from "../natsWrapper";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";

const router = Router();
router.patch(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate("ticket");

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    order.set({ status: OrderStatus.Cancelled });
    await order.save();

    //!todo  pub event
    new OrderCancelledPublisher(
      natsWrapper.client,
      natsWrapper.jetStreamManager,
      "ORDERS"
    ).publishData({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });
    res.status(200).send(order);
  }
);
export { router as deleteOrderRouter };
