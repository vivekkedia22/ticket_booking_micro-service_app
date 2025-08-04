import express, { Request, Response, NextFunction } from "express";
import cookieSession from "cookie-session";
import { currentUser, errorHandler, NotFoundError } from "@tickets_microservice123/common";
import { paymentRoutes } from "./routes/index.routes";
const app = express();
app.set("trust proxy", true);
app.use(express.json());
app.use(
  cookieSession({ signed: false, secure: process.env.NODE_ENV !== "test" })
);
app.use(currentUser)
app.use(paymentRoutes);
app.use((req, res, next) => {
  throw new NotFoundError();
});
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next);
});
export { app };