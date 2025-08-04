import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";

import { User } from "../models/user-model";
import {
  BadRequestError,
  validateRequest,
} from "@tickets_microservice123/common";

const router = Router();

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password").trim().notEmpty().withMessage("Password not given"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new BadRequestError(401, "Invalid credentials");
    }
    if (!(await existingUser.isPasswordCorrect(password))) {
      throw new BadRequestError(401, "Invalid credentials");
    }
    const userjwt = jwt.sign(
      { id: existingUser.id, email: existingUser.email },
      process.env.JWT_KEY!
    );
    req.session = {
      jwt: userjwt,
    };
    res.status(200).send(existingUser);
  }
);

export { router as signInRouter };
