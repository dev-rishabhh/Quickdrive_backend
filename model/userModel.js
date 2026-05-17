import { model, Schema } from "mongoose"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Name name is required"],
            minLength: [3, "name field should a string with at least three characters",]
        },
        email: {
            type: String,
            required: [true, "Email name is required"],
            match: [
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/,
                "please enter a valid email",
            ],
        },
        password: {
            type: String,
            minLength: 4,
        },
        picture: {
            type: String,
            default:"https://cdn-icons-png.flaticon.com/512/9131/9131478.png"
        },
        role: {
            type: String,
            enum : ["user", "admin", "manager"],
            default : "user"
        },
        rootDirId: {
            type: Schema.Types.ObjectId,
            ref: "directories",
        },
        maxStorageinBytes:{
            type: Number
        },
        deleted: {
            type: Boolean,
            default : false
        },

    },
    {
        strict: "throw"
    }
)

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return ;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password,this.password)
}

export const userModel = model("users", userSchema)



