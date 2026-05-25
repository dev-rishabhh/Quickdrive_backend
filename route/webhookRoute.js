import express from "express"
import  {handleRazorpayWebhook} from "../controller/webhookController.js"

const router = express.Router()

router.post("/razorpay",handleRazorpayWebhook)
// router.post("/complete", handleSubscriptionComplete)

export default router