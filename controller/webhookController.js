import Razorpay from "razorpay";
import { subscriptionModel } from "../model/subscriptionModel.js";
import { userModel } from "../model/userModel.js";


export async function handleRazorpayWebhook(req, res) {
  // console.log("Running webhook")
  // console.log(req.body);
  
  const signature = req.headers["x-razorpay-signature"];
  const isSignatureValid = Razorpay.validateWebhookSignature(
    JSON.stringify(req.body),
    signature,
    process.env.RAZORPAY_WEBHOOK_SECRET
  );
  if (isSignatureValid) {
    // console.log("Signature verified");

    if (req.body.event === "subscription.activated") {
      const rzpSubscription = req.body.payload.subscription.entity;

      const planId = rzpSubscription.plan_id;

      const subscription = await subscriptionModel.findOne({
        razorpaySubscriptionId: rzpSubscription.id,
      });

      subscription.status = rzpSubscription.status;

      await subscription.save();

      //   const storageQuotaBytes = PLANS[planId].storageQuotaBytes;
      const user = await userModel.findOne({ _id: subscription.userId })

      user.maxStorageInBytes += subscription.storageQuotainBytes;
      await user.save();

      // console.log("subscription activated");
    }
  } else {
    console.log("Signature not verified");
  }
  res.end("OK");
}