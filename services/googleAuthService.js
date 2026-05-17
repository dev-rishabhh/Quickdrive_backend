import { OAuth2Client } from "google-auth-library"


const googleClient = new OAuth2Client({
    client_id: process.env.GOOGLE_CLIENT_ID
})


export async function fetchUserFromGoogle(code) {
    const loginTicket = await googleClient.verifyIdToken({
        idToken: code,
        audience:  process.env.GOOGLE_CLIENT_ID
    });

    const userData = loginTicket.getPayload();
    return userData
}

