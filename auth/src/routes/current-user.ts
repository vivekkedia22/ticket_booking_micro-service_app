import { NextFunction, Router } from "express";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { User } from "../models/user-model";
import { BadRequestError } from "../../../common/src/errors/bad-request-error";
import { currentUser } from "@tickets_microservice123/common";

const router = Router();
router.get(
  "/api/users/currentuser",
  currentUser,
  (req: Request, res: Response) => {
    const currentUser = req.currentUser;
    res.send({ currentUser: currentUser || null });
  }
);

export { router as currentUserRouter };
