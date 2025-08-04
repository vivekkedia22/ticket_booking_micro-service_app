import mongoose, { Document, Model, Schema } from "mongoose";
import { Order } from "./order.model";
import { OrderStatus } from "@tickets_microservice123/common";

interface Ticket {
  id: mongoose.Types.ObjectId;
  title: string;
  price: number;
  version: number;
}

export interface TicketDocument extends Document {
  id: string;
  title: string;
  price: number;
  isReserved: () => Promise<boolean>;
  version: number;
}
interface TicketModel extends Model<TicketDocument> {
  build: (ticket: Ticket) => TicketDocument;
}
const ticketSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    versionKey: "version",
    // optimisticConcurrency: true,
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        (ret as any).id = ret._id;
        delete (ret as any)._id;
        delete (ret as any).__v;
      },
    },
  }
);
ticketSchema.pre("save", function (done) {
  this.$where = {
    version: this.get("version") - 1,
  };
  done();
}); 
ticketSchema.statics.build = (ticket: Ticket): TicketDocument => {
  console.log("soething is happening here", ticket);
  return new Ticket({
    _id: ticket.id,
    title: ticket.title,
    price: ticket.price,
    version: ticket.version,
  });
};
ticketSchema.methods.isReserved = async function () {
  const foundOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });
  return !!foundOrder;
};

const Ticket = mongoose.model<TicketDocument, TicketModel>(
  "Ticket",
  ticketSchema
);
export { Ticket };
