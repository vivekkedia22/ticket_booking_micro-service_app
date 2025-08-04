import express from "express";
import { userRoutes } from "./routes/index";
import { NotFoundError, errorHandler } from "@tickets_microservice123/common";
import { Request, Response, NextFunction } from "express";
import cookieSession from "cookie-session";

const app = express();
app.set("trust proxy", true);
app.use(express.json());
app.use(
  cookieSession({ signed: false, secure: process.env.NODE_ENV !== "test" })
);
app.use(userRoutes);
app.use((req, res, next) => {
  throw new NotFoundError();
});
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next);
});
export { app };
