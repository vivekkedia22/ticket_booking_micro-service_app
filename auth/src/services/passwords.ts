import { scrypt, randomBytes } from "node:crypto";
import { promisify } from "node:util";
const scryptAsync = promisify(scrypt);
export class Password {
  static async toHash(password: string) {
    const salt = randomBytes(8).toString("hex");
    const buff = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buff.toString("hex")}.${salt}`;
  }
  static async compare(password: string, storedPassword: string) {
    const [hashedPassword, salt] = storedPassword.split(".");
    const buff = (await scryptAsync(password, salt, 64)) as Buffer;
    return buff.toString("hex") === hashedPassword;
  }
}
