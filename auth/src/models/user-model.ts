import mongoose, { Schema, Model, Document } from "mongoose";
import { Password } from "../services/passwords";
interface User {
  name?: string;
  email: string;
  password: string;
}
interface UserDocument extends Document {
  _id: mongoose.Types.ObjectId;
  name?: string;
  email: string;
  password: string;
  createdAt: string;
  isPasswordCorrect(password: string): Promise<boolean>;
}
interface UserModel extends Model<UserDocument> {
  build(user: User): UserDocument;
}
const userSchema = new Schema(
  {
    name: { type: String, required: false },
    email: { type: String, required: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },  
  }
);
userSchema.statics.build = (user: User): UserDocument => {
  return new User(user);
};
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await Password.toHash(this.password);
  }
  next();
});
userSchema.methods.isPasswordCorrect = async function (password: string) {
  return await Password.compare(password, this.password);
};
const User = mongoose.model<UserDocument, UserModel>("User", userSchema);
export { User };
