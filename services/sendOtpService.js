import {Resend} from "resend"
import { otpModel } from "../model/otpModel.js"


export async function SendOtpService(email) {
    const otp = Math.round(1000 + Math.random()* 9000)
    // console.log(otp);

    await otpModel.findOneAndUpdate(
        { email },
        { otp },
        { upsert: true }
    )

    const resend = new Resend(process.env.RESEND_KEY);

    const html = `
    <div>
        <div>
         <h2> Hey ${email} <h2>
        </div>
        <div>
          <p>The OTP for registration to <b>Quickdrive</b> is ${otp}.<p>
          <p>This OTP is valid for 10 mins only<p>
         </div>
        <div>
          <p>If you have not made this request, please report to 
          <b>contact@quickdrive.online</b>
         </div>
        <div>
          <p>Thank You</p>
          <p>Team Quickdrive <p>
        </div>
    </div>
    `

    const result = await resend.emails.send({
        from: "Rishabh Pandey <otp@quickdrive.online>",
        to: email,
        subject: "OTP for Registration to Quickdrive",
        html,
    });

    return result

}


