// export * from "./routesa";
import { Router } from "express";
import { createTicketRouter } from "./create-ticket.route";
import { getTicketRouter } from "./get-ticket.route";
import { getTicketsRouter } from "./get-tickets.route";
import { updateTicketRouter } from "./update-ticket.route";
const router = Router();

router.use(createTicketRouter);
router.use(getTicketRouter);
router.use(getTicketsRouter);
router.use(updateTicketRouter);
export { router as ticketRoutes };
