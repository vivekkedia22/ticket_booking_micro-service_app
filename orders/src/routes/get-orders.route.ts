import { Request, Response, Router } from "express";
import { Order } from "../models/order.model";
import { BadRequestError, requireAuth } from "@tickets_microservice123/common";

const router = Router();

router.get("/api/orders", requireAuth, async (req: Request, res: Response) => {
  const orders = await Order.find({ userId: req.currentUser!.id }).populate(
    "ticket"
  );
  return res.status(200).send(orders);
});

export { router as getOrdersRouter };
