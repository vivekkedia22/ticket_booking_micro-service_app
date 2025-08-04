import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  process.env.JWT_KEY = "abcd";

  mongoServer = await MongoMemoryServer.create({});

  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  const collections = await mongoose.connection.db?.collections();
  for (const collection of collections!) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();

  await mongoServer.stop();
});
