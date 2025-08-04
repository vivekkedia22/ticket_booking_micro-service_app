import { Router } from "express";
import { body } from "express-validator";
import { Request, Response } from "express";
import {
  currentUser,
  NotFoundError,
  requireAuth,
  validateRequest,
} from "@tickets_microservice123/common";

import { Ticket } from "../model/ticket.model";
const router = Router();

router.get(
  "/api/tickets/:id",
  requireAuth,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const owner = req.currentUser?.id!;
    const foundTicket = await Ticket.findById(id);
    if (!foundTicket) {
      throw new NotFoundError();
    }
    res.status(200).send(foundTicket);
  }
);
export { router as getTicketRouter };
