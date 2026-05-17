import express from "express"
import { fetchIdToken, sendOtp, verifyOtp } from "../controller/authController.js"


const router = express.Router()

router.post("/send-otp",sendOtp)

router.post("/verify-otp",verifyOtp)

router.post("/google/callback",fetchIdToken)



export default router