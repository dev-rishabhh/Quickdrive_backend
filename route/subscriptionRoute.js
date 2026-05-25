import express from "express"
import { handleSubscriptionInitiate } from "../controller/subscriptionController.js"


const router = express.Router()

router.post("/", handleSubscriptionInitiate)

export default router