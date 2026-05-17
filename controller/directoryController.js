import { rm } from "fs/promises";
import { directoryModel } from "../model/directoryModel.js";
import { fileModel } from "../model/fileModel.js";
import { nameSchema } from "../validators/authValidator.js";
import { updateParentSize } from "../services/updateDirSize.js";
import { deleteS3Files } from "../services/s3Services.js";

export async function handlePostDirectory(req, res, next) {
    const user = req.user

    const parentDirId = req.params.parentDirId || user.rootDirId.toString()
    const folderName = req.headers.dirname || "New Folder"


    const { sucess, data, error } = nameSchema.safeParse({ name: folderName })
    if (error) return res.status(401).json({ erorr: "Invalid input" })

    try {
        const parentDir = await directoryModel.findOne({ _id: parentDirId, userId: user._id })
        if (!parentDir) return res.status(401).json({ error: "You don't have access to this folder" })

        await directoryModel.insertOne({
            name: folderName,
            parentDirId,
            userId: req.user._id
        })

        res.json({ message: "Folder Created" });
    } catch (err) {
        if (err.code === 121) {
            res
                .status(400)
                .json({ error: "Invalid input, please enter valid details" });
        } else {
            next(err);
        }
        // console.log(error.errInfo.details.schemaRulesNotSatisfied[0].propertiesNotSatisfied[0]);
    }
}

export async function handleGetDirectory(req, res, next) {
    const user = req.user

    const id = req.params.id || user.rootDirId.toString()

    try {
        const dirData = await directoryModel.findOne({ _id: id, userId: user._id })

        if (!dirData) return res.status(401).json({ error: "Directory not found" })

        const files = await fileModel.find({ parentDirId: id }).lean()

        const directories = await directoryModel.find({ parentDirId: id }).lean()

        res.json({ ...dirData, files: files.map(({ _id, name, size, createdAt, updatedAt }) => ({ id: _id, name, size, createdAt, updatedAt })), directories: directories.map(({ _id, name, size, createdAt, updatedAt }) => ({ id: _id, name, size, createdAt, updatedAt })) })
    } catch (error) {
        next(error)
    }
}

export async function handleUpdateDirectory(req, res, next) {
    const { id } = req.params
    const user = req.user
    try {
        const newFolderName = req.body.newDirName
        await directoryModel.findByIdAndUpdate(
            { _id: id, userId: user._id },
            { name: newFolderName }
        )
        res.status(200).json({ message: "Directory Renamed!" });
    } catch (error) {
        next(error)
    }
}

export async function handleDeleteDirectory(req, res, next) {
    const id = req.params.id
    try {

        const dir = await directoryModel.findOne({ _id: id, userId: req.user._id }).select("_id size parentDirId").lean()
        if (!dir) return res.status(401).json({ error: "You don't have access to this folder" })

        async function getDirectoryContents(id) {
            let files = await fileModel.find(
                { parentDirId: id },
                { projection: { _id: 1, ext: 1 } }
            ).select("ext").lean()

            let directories = await directoryModel.find(
                { parentDirId: id },
                { projection: { _id: 1, } }
            ).select("_id").lean()

            for (const { _id } of directories) {
                const { files: childFiles, directories: childDirectories } = await getDirectoryContents(_id)
                directories = [...directories, ...childDirectories]
                files = [...files, ...childFiles]
            }

            return { files, directories }
        }

        const { files, directories } = await getDirectoryContents(id)

        // files.map(async ({ _id, ext }) => {
        //     await rm(`./storage/${_id}${ext}`)
        // })
        const keys = files.map(({ _id, ext })=>({Key: `${_id}${ext}`}) )
        console.log(keys);
        
        await deleteS3Files(keys)
        

        await updateParentSize(dir.parentDirId, dir.size, "dec")

        await fileModel.deleteMany({ _id: { $in: files.map(({ _id, }) => _id) } })
        await directoryModel.deleteMany({ _id: { $in: [...directories.map(({ _id }) => _id), id] } })

        res.json("Folder Deleted")
    } catch (error) {
        next(error)
    }

}
