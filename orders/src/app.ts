import express, { Request, Response, NextFunction } from "express";
import cookieSession from "cookie-session";
import {
  currentUser,
  errorHandler,
  NotFoundError,
} from "@tickets_microservice123/common";
import { orderRoutes } from "./routes/index.routes";
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({ signed: false, secure: false }));
app.use(currentUser);
app.use(orderRoutes);
app.use((req, res, next) => {
  throw new NotFoundError();
});
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next);
});
export { app };
