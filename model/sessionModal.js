import { model, Schema } from "mongoose"

const sessionSchema = Schema(
    {
        uid: {
            type: Schema.Types.ObjectId,
            ref:"users"
        },
        createdAt:{
            type : Date,
            default: Date.now(),
            expires:3600*24
        }
    },{
        strict : "throw",
    }
)

export  const sessionModel = model("session",sessionSchema)
