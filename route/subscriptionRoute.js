import express from "express"
import { handleSubscriptionComplete, handleSubscriptionInitiate } from "../controller/subscriptionController.js"


const router = express.Router()

router.post("/", handleSubscriptionInitiate)
// router.post("/complete", handleSubscriptionComplete)

export default router