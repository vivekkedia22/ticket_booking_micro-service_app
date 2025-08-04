import jwt from "jsonwebtoken";
import request from "supertest";
import { Buffer } from "node:buffer";
import { app } from "../app";
import mongoose from "mongoose";
const signUp = () => {
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
const signUpNew = () => {
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email: `${Math.random()}@test.com`,
  };
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  const sessionObj = { jwt: token };
  const base64 = Buffer.from(JSON.stringify(sessionObj)).toString("base64");
  const sessionCookie = [`session=${base64}`];
  return sessionCookie;
};
export { signUp ,signUpNew};
