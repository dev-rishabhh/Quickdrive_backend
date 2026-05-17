import { model, Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    razorpaySubscriptionId: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    storageQuotainBytes: {
      type: Schema.Types.Number,
    },
    status: {
      type: String,
      enum: [
        "created",
        "active",
        "pending",
        "past_due",
        "paused",
        "canceled",
        "in_grace",
      ],
      default: "created",
    },
  },
  {
    strict: "throw",
    timestamps: true,
  }
);

export const subscriptionModel = model("subscription", subscriptionSchema);

