import { model, Schema } from "mongoose"

const filesSchema = new Schema(
    {
        ext: {
            type: String,
            required: [true, "extension is required"]
        },
        name: {
            type: String,
            required: [true, "File name is required"]
        },
        parentDirId: {
            type: Schema.Types.ObjectId,
            required: [true, "ParentId name is required"],
            default: null,
            ref: "directories"
        },
        isUploading:{
             type: Schema.Types.Boolean,
        },
        size: {
            type: Number,
            required: [true, "Size name is required"]
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

export const fileModel = model("files", filesSchema)
