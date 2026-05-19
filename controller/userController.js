import { userModel } from "../model/userModel.js";
import { directoryModel } from "../model/directoryModel.js";
import { sessionModel } from "../model/sessionModal.js";
import { Types } from "mongoose";
import { fileModel } from "../model/fileModel.js";
import { loginSchema, registerSchema } from "../validators/authValidator.js";

export async function handleGetUser(req, res) {
    const rootDir = await directoryModel.findOne({_id: req.user.rootDirId})
    res.status(200).json({
        name: req.user.name,
        email: req.user.email,
        picture: req.user.picture,
        role: req.user.role,
        maxStorageinBytes : req.user.maxStorageinBytes,
        usedStorageinBytes : rootDir.size
    })
}

export async function handleGetAllUsers(req, res) {
    const users = await userModel.find({ deleted: false }).select("name email role").lean()
    const allSessions = await sessionModel.find().select("uid -_id").lean()
    const sessionsArray = allSessions.map(({ uid }) => { return uid.toString() })

    const newUsers = users.map((user) => {
        if (sessionsArray.includes(user._id.toString())) return { ...user, loggedIn: true }
        else return { ...user, loggedIn: false }
    })


    res.status(200).json(newUsers)
}

export async function handleRegisterUser(req, res, next) {
    const { name, email, password } = req.body

    const { sucess, data, error } = registerSchema.safeParse({ name, email, password })
    if (error) return res.status(401).json({ erorr: "Invalid input" })

    const userExists = await userModel.findOne({ email }).lean()
    if (userExists) return res.status(409).json({
        error: "User already exists",
        message:
            "A user with this email address already exists. Please try logging in or use a different email.",
    });

    const rootDirId = new Types.ObjectId()
    const userId = new Types.ObjectId()

    try {
        const userRootDir = await directoryModel.insertOne({
            _id: rootDirId,
            name: `root-${email}`,
            parentDirId: null,
            userId
        })
        const createdUser = new userModel({
            _id: userId,
            name,
            email,
            maxStorageinBytes : 1073741824,
            password,
            rootDirId,
        })
        await createdUser.save()

        res.status(201).json({ message: "User Registered" });
    } catch (error) {
        console.log(error);
        next(error);
    }
}

export async function handleLoginUser(req, res) {
    const { email, password } = req.body

    const { sucess, data, error } = loginSchema.safeParse({  email, password })
    if (error) return res.status(401).json({ erorr: "Invalid input" })

    const user = await userModel.findOne({ email })
    if (!user) return res.status(404).json({ error: "No user found" })

    const isValidPassword = await user.comparePassword(password)
    if (!isValidPassword) return res.status(401).json({ error: "Invalid credentials" })

    if (user.deleted) return res.status(401).json({ error: "Account has been deleted. Contact admin to recover" })

    const allSessions = await sessionModel.find({ uid: user._id })

    if (allSessions.length > 1) {
        await sessionModel.findOneAndDelete({ _id: allSessions[0]._id })
    }

    try {
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
        res.json("Login sucessfull")
    } catch (error) {
        console.log(error);

        res.status(400).json({ error })
    }
}

export async function handleLogoutUser(req, res) {
    const user = req.user
    //  console.log(user);
    await sessionModel.findOneAndDelete({ uid: user.id })
    res.clearCookie("token")
    res.status(204).end();
}

export async function handleLogoutUserAll(req, res) {
    const user = req.user
    // console.log(sessionModel);

    await sessionModel.deleteMany({ uid: user.id })
    res.clearCookie("token")
    res.status(204).end();
}

export async function handleAdminLogout(req, res) {
    await sessionModel.deleteMany({ uid: req.params.userId })
    res.status(204).end();
}

export async function handleSoftDelete(req, res, next) {
    const { userId } = req.params
    const user = req.user

    if (!Types.ObjectId.isValid(userId)) return res.status(401).json({ error: "Invalid Id " })
    if (userId === user._id.toString()) return res.status(401).json({ error: "you can't delete your self " })

    try {
        await sessionModel.deleteMany({ uid: userId })
        await userModel.findByIdAndUpdate({ _id: userId }, { deleted: true })
        res.status(204).end();

    } catch (error) {
        console.log(error);
        next(error)

    }
}

export async function handleHardDelete(req, res, next) {
    const { userId } = req.params
    const user = req.user

    if (!Types.ObjectId.isValid(userId)) return res.status(401).json({ error: "Invalid Id " })
    if (userId === user._id.toString()) return res.status(401).json({ error: "you can't delete your self " })

    try {
        let files = await fileModel.find({ userId }).select("ext").lean()
        await Promise.all([
            await userModel.deleteOne({ _id: userId }),
            await directoryModel.deleteMany({ userId }),
            await fileModel.deleteMany({ userId }),
            await sessionModel.deleteMany({ uid: userId })
        ])
        files.map(async ({ _id, ext }) => {
            await rm(`./storage/${_id}${ext}`)
        })
    } catch (error) {
        console.log(error);
        next(error)

    }
}