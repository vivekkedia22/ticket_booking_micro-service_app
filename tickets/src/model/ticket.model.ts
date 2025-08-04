import mongoose, { Document, Model, Schema } from "mongoose";

interface Ticket {
  title: string;
  price: string;
  owner?: string;
}
interface TicketDocument extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  price: string;
  owner: string;
  version: number;
  orderId?:string
}
interface TicketModel extends Model<TicketDocument> {
  build(ticket: Ticket): TicketDocument;
}
const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    owner: {
      type: String,
    },
    orderId:{
      type:String
    }
  },
  {
    versionKey: "version",
    optimisticConcurrency: true,
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        // delete ret.__v;
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);
ticketSchema.statics.build = (ticket: Ticket): TicketDocument => {
  return new Ticket(ticket);
};

const Ticket = mongoose.model<TicketDocument, TicketModel>(
  "Ticket",
  ticketSchema
);
export { Ticket };
