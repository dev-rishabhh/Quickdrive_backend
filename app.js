import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { connectDB } from "./config/db.js";
import directoryRoutes from "./route/directoryRoute.js"
import fileRoutes from "./route/fileRoute.js"
import userRoutes from "./route/userRoute.js"
import authRoutes from "./route/authRoute.js"
import subscriptionRoutes from "./route/subscriptionRoute.js"

import { checkAuth, checkNotDeleted } from "./middleware/auth.js";

await connectDB();
const app = express()

app.use(express.json())
app.use(cookieParser(process.env.COOKIE_SECRET))

// console.log(process.env.FRONTEND_URL);

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}))


app.use("/directory", checkAuth, checkNotDeleted, directoryRoutes)
app.use("/file", checkAuth, checkNotDeleted, fileRoutes)
app.use("/subscriptions", checkAuth, subscriptionRoutes)
app.use("/", userRoutes)
app.use("/auth", authRoutes)

app.use((err, req, res, next) => {
    console.log(err);
    // res.status(err.status || 500).json({ error: err});
    res.status(err.status || 500).json({ error: "Something went wrong!" });
    next()
})

app.listen(process.env.PORT, () => {
    console.log("server statred on:", process.env.PORT);
})

