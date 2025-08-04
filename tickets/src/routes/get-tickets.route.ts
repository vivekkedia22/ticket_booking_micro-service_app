import { Request, Response, Router } from "express";
import { Ticket } from "../model/ticket.model";
import { NotFoundError } from "@tickets_microservice123/common";
const router = Router();

router.get(
  "/api/tickets/",
  async (req: Request, res: Response): Promise<void >=> {
    //TODO
    const tickets = await Ticket.find({ orderId: null });
    if (tickets.length === 0) {
      res.status(200).send([]);
      return;
    }
    res.status(200).send(tickets);
  }
);
export { router as getTicketsRouter };
