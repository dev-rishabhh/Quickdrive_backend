import { SendOtpService } from "../services/sendOtpService.js";
import { userModel } from "../model/userModel.js";
import { directoryModel } from "../model/directoryModel.js";
import { otpModel } from "../model/otpModel.js"
import { sessionModel } from "../model/sessionModal.js";
import { Types } from "mongoose";
import { fetchUserFromGoogle } from "../services/googleAuthService.js";
import { emailSchema, otpSchema } from "../validators/authValidator.js";

export async function sendOtp(req, res) {
    const { email } = req.body

    const { data, error } = await SendOtpService(email)

    if (error) return res.status(401).json({ error: `Something went wrong` })
    return res.status(201).json({ message: `OTP sent sucessfully on ${email}` })
}
export async function verifyOtp(req, res) {
    const { email, otp } = req.body

    const { sucess, data, error } = otpSchema.safeParse({ email, otp })
    if (error) return res.status(401).json({ erorr: "Invalid input" })

    const otpExists = await otpModel.findOne({ email, otp })
    // console.log(otpExists);

    if (!otpExists) return res.status(401).json({ error: `Invalid or Expired Otp` })
    return res.status(200).json({ message: `${email} verification sucessfull` })
}

export async function fetchIdToken(req, res) {
    const { code } = req.body;
    // console.log(req.body);
    // if()
    const { name, email, picture } = await fetchUserFromGoogle(code)

    const user = await userModel.findOne({ email })

    if (user) {
        if (user.deleted) return res.status(401).json({ error: "Account has been deleted. Contact admin to recover" })
        const allSessions = await sessionModel.find({ uid: user._id })

        if (allSessions.length > 1) {
            await sessionModel.findOneAndDelete({ _id: allSessions[0]._id })
        }
        if (!user.picture.includes("googleusercontent.com")) {
            user.picture = picture;
            await user.save();
        }

        const insertedSession = await sessionModel.insertOne({
            uid: user._id
        })

        res.cookie("token", insertedSession._id, {
            // sameSite: "lax",
            sameSite: "none",
            httpOnly:true,
            maxAge: 3600 * 1000 * 24,
            signed: true,
            secure: true
        })
        return res.status(200).json({ message: "Logged in." })

    }

    const rootDirId = new Types.ObjectId()
    const userId = new Types.ObjectId()

    try {
        const userRootDir = await directoryModel.insertOne({
            _id: rootDirId,
            name: `root-${email}`,
            parentDirId: null,
            userId
        })

        const createdUser = await userModel.insertOne({
            _id: userId,
            name,
            email,
            picture,
            rootDirId,
        })

        const insertedSession = await sessionModel.insertOne({
            uid: userId
        })

        res.cookie("token", insertedSession._id, {
            sameSite: "none",
            maxAge: 3600 * 1000 * 24,
            signed: true,
            secure: true
        })
        return res.status(201).json({ message: "Registration sucessfull and logged in." })
    } catch (err) {
        console.log(err);

    }
}




