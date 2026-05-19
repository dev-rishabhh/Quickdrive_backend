import mongoose from "mongoose"

export async function connectDB() {
    try {
        await mongoose.connect(process.env.DB_URL)
        console.log("Database connected");
    } catch (error) {
        console.log("Error Connectting to database");
        // console.log(error)
        process.exit(1);
    }
}

process.on("SIGINT", async () => {
    await client.close()
    console.log("Database Disconnected!");
    process.exit(0)
})
