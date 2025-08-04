import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { User } from "../models/user-model";

import jwt from "jsonwebtoken";
import {
  BadRequestError,
  validateRequest,
  DatabaseConnectionError,
} from "@tickets_microservice123/common";
const router = Router();

router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Pssword must of min length 4 and max 20"),
  ],
  validateRequest,
  async (req: Request, res: Response): Promise<any> => {
    const { email, password } = req.body;

    // console.log("creating a user");
    let foundUser;
    try {
      foundUser = await User.findOne({ email });
    } catch (error) {
      throw new DatabaseConnectionError();
    }
    if (foundUser) {
      throw new BadRequestError(401, "Email already in use");
    }
    try {
      const user = User.build({ email, password });
      await user.save();

      const userJwt = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_KEY!
      );

      //store it om session object
      req.session = {
        jwt: userJwt,
      };

      return res
        .status(201)
        .send({ message: "User was created successfully", user });
    } catch (error) {
      throw new DatabaseConnectionError();
    }
  }
);

export { router as signUpRouter };
