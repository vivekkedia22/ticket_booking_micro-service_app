import mongoose, { Schema } from "mongoose";

interface Payment {
  orderId: string;
  stripeId: string;
}
interface PaymentDocument extends mongoose.Document {
  orderId: string;
  stripeId: string;
}
interface PaymentModel extends mongoose.Model<PaymentDocument> {
  build(attrs: Payment): PaymentDocument;
}
const paymentSchema = new Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    stripeId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        (ret as any).id = ret._id;
        delete (ret as any)._id;
      },
    },
  }
);
paymentSchema.statics.build = (attrs: Payment) => {
  return new Payment(attrs);
};
const Payment = mongoose.model<PaymentDocument, PaymentModel>(
  "Payment",
  paymentSchema
);
export { Payment };
