import { model, Schema } from "mongoose"

const directorySchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Dir name is required"]
        },
        parentDirId: {
            type: Schema.Types.ObjectId,
            default: null,
            ref: "directories",
        },
        size: {
            type: Number,
            default : 0,
            required: [true, "Size is required"]
        },
        userId: {
            type: Schema.Types.ObjectId
        }
    },
    {
        strict: "throw",
        timestamps: true, 
    }
)

export const directoryModel = model("directories", directorySchema)
