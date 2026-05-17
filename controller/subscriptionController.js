import Razorpay from "razorpay"
import { subscriptionModel } from "../model/subscriptionModel.js";
import { userModel } from "../model/userModel.js";

const rzpInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
});

export const PLANS = {
  plan_SpWmRO3kd7BdhU: {
    storageQuotaBytes: 2 * 1024 ** 3,
  },
  plan_SpWo8nRiWe6NBE: {
    storageQuotaBytes: 2 * 1024 ** 4,
  },
  plan_SpWmlkZmb0z5Dm: {
    storageQuotaBytes: 5 * 1024 ** 4,
  },
  plan_SpWnnAG6spo8Bp: {
    storageQuotaBytes: 5 * 1024 ** 4,
  },
  plan_SpWn5zGEADk8Ma: {
    storageQuotaBytes: 10 * 1024 ** 4,
  },
  plan_SpWodErK6l7l5J: {
    storageQuotaBytes: 10 * 1024 ** 4,
  },
};



export async function handleSubscriptionInitiate(req, res, next) {
    const planId = req.body.planId
    const {storageQuotaBytes} =  PLANS[planId]
    // console.log(typeof storageQuotaBytes)

    try {
        const newSubscription = await rzpInstance.subscriptions.create({
            plan_id: planId,
            total_count: 120,
            notes: {
                userId: req.user.id,
            },
        });

        const subscription = new subscriptionModel({
            razorpaySubscriptionId: newSubscription.id,
            storageQuotainBytes : storageQuotaBytes,
            userId: req.user.id
        })

        await subscription.save()

        return res.json({ subscriptionId: newSubscription.id })
    } catch (error) {
        console.log(error);
        next(error)
    }
}

export async function handleSubscriptionComplete(req, res, next) {
    const subscriptionId = req.body.razorpay_subscription_id
    // console.log(planId)

    try {
        const subscription = await subscriptionModel.findOne({id: subscriptionId})
        // console.log(subscription);

        subscription.status = "active"
        await subscription.save()

        // console.log(Long.fromNumber(subscription.storageQuotainBytes))
        const user = await userModel.findOne({_id : subscription.userId})
        // console.log(user);
        
        user.maxStorageinBytes += subscription.storageQuotainBytes
        await user.save()
        res.json({message : "Payment verified. Storage upgraded"})

    } catch (error) {
        console.log(error);

        next(error)
    }
}