import jwt from "jsonwebtoken";
import { Buffer } from "node:buffer";
import mongoose from "mongoose";

export const signUp = () => {
  const payload = {
    id: "686ae0ae514a4086e95732f3",
    email: "test@test.com",
  };
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  const sessionObj = { jwt: token };
  const base64 = Buffer.from(JSON.stringify(sessionObj)).toString("base64");
  const sessionCookie = [`session=${base64}`];
  return sessionCookie;
};

export const signUpNew = (): {
  sessionCookie: string[];
  id: mongoose.Types.ObjectId;
} => {
  const payload = {
    id: new mongoose.Types.ObjectId(),
    email: `${Math.random()}@test.com`,
  };
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  const sessionObj = { jwt: token };
  const base64 = Buffer.from(JSON.stringify(sessionObj)).toString("base64");
  const sessionCookie = [`session=${base64}`];
  return { sessionCookie, id: payload.id };
};

