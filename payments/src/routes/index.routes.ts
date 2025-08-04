import { Router } from "express";
import { createChargeRouter } from "./create-charge.route";
const router = Router();
router.use(createChargeRouter);
export { router as paymentRoutes };
