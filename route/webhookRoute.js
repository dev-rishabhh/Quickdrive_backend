import express from "express"
import  {handleRazorpayWebhook} from "../controller/webhookController.js"

const router = express.Router()

router.post("/razorpay",handleRazorpayWebhook)

export default router