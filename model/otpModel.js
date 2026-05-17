import { model, Schema } from "mongoose"

const otpSchema = new Schema(
    {
        email: {
            type: String,
            required: [true, "Email name is required"],
            match: [
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/,
                "please enter a valid email",
            ],
            unique: true
        },
        otp: {
            type: String,
            required: [true, "password name is required"],
            minLength: 4,
        },
        createdAt :{
            type: Date,
            default : Date.now(),
            expires: 600
        }
    },
    {
        strict: "throw"
    }
)


export const otpModel = model("otp", otpSchema)



