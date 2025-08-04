import { Router } from "express";

import { createOrderRouter } from "./create-order.route";
import { getOrderRouter } from "./get-order.route";
import { getOrdersRouter } from "./get-orders.route";
import { deleteOrderRouter } from "./delete-order.route";

const router = Router();

router.use(createOrderRouter);
router.use(getOrderRouter);
router.use(getOrdersRouter);
router.use(deleteOrderRouter);

export { router as orderRoutes };
