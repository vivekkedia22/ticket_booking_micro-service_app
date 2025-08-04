import { Request, Response, Router } from "express";
import { Order } from "../models/order.model";
import {
  NotFoundError,
  NotAuthorizedError,
  requireAuth,
} from "@tickets_microservice123/common";

const router = Router();
router.get(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate("ticket");
    console.log(order);
    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    res.send(order);
  }
);
export { router as getOrderRouter };
