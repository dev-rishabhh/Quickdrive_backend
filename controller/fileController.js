import path from "path";
import { rm } from "fs/promises";
import { directoryModel } from "../model/directoryModel.js";
import { sessionModel } from "../model/sessionModal.js";
import { fileModel } from "../model/fileModel.js";
import { nameSchema } from "../validators/authValidator.js";
import { updateParentSize } from "../services/updateDirSize.js";
import { userModel } from "../model/userModel.js";
import { deleteS3File, generateGETURL, generatePOSTURL, verifyPostData, } from "../services/s3Services.js";

export async function handleGetFile(req, res, next) {
    const { id } = req.params
    const user = req.user
    try {
        const file = await fileModel.findOne({ _id: id, userId: user._id, }).lean()
        if (!file) return res.status(404).json({ error: "File not found" })

        const url = await generateGETURL({ key: `${id}${file.ext}`, filename: file.name })

        // If "download" is requested, set the appropriate headers

        if (req.query.action === "download") {
            const url = await generateGETURL({
                key: `${id}${file.ext}`,
                download: true,
                filename: file.name
            })
            return res.redirect(url)
        }

        res.redirect(url)

    } catch (error) {
        next(error)
    }
}

export async function handleUpdateFile(req, res, next) {
    const { id } = req.params
    const user = req.user

    const file = await fileModel.findOne({ _id: id, userId: user._id, })
    if (!file) return res.status(404).json({ error: "File not found" })

    try {
        file.name = req.body.newFilename
        await file.save()

        return res.status(200).json({ message: "Renamed" });
    } catch (error) {
        next(error)
    }
}

export async function handleDeleteFile(req, res, next) {
    const { id } = req.params
    const user = req.user

    const file = await fileModel.findOne({ _id: id, userId: user._id, }).select("ext size parentDirId")
    if (!file) return res.status(404).json({ error: "File not found" })

    try {
        const response =await deleteS3File({key: `${file._id}${file.ext}`})
        // console.log(res);
        
        await file.deleteOne()
        await updateParentSize(file.parentDirId, file.size, "dec")
        res.status(200).json({ message: "File Deleted Successfully" });
    } catch (error) {
        next(error)
    }
}

export async function handleUploadInitiate(req, res, next) {
    const user = req.user

    const parentDirId = req.body.parentDirId || req.user.rootDirId

    const parentDir = await directoryModel.findOne({ _id: parentDirId, userId: user._id })
    if (!parentDir) return res.status(404).json({ error: "File not found" })

    const rootDir = await directoryModel.findOne({ _id: user.rootDirId })

    const fileName = req.body.name || "untitled"
    // console.log(fileName);


    const { sucess, data, error } = nameSchema.safeParse({ name: fileName })
    if (error) return res.status(401).json({ erorr: "Invalid input" })

    const fileSize = req.body.size

    const totalSizeAfterAddingFileSize = rootDir.size + Number(fileSize)
    
    // console.log(totalSizeAfterAddingFileSize);
    // console.log(user.maxStorageinBytes);
    
    

    if (totalSizeAfterAddingFileSize > user.maxStorageinBytes) {
        return res.status(413).json({ error: "File size is excedding max limit." })
    }

    const ext = path.extname(fileName)
    // console.log(ext);

    try {
        const insertedFile = await fileModel.insertOne(
            {
                ext,
                name: fileName,
                size: fileSize,
                parentDirId,
                isUploading: true,
                userId: user._id
            }
        );
        const fileId = insertedFile._id
        // console.log(fileId);

        const key = `${fileId}${ext}`;
        // console.log(key);

        // console.log(req.body.contentType);
        // await getAllBuckets()

        const url = await generatePOSTURL({ key: key, contentType: req.body.contentType })
        // console.log(url);

        return res.json({ fileId, url })

    } catch (err) {
        console.log(err);
        res.status(400).json({ error: "File could not be uploaded" })

    }
}

export async function handleUploadComplete(req, res, next) {
    const user = req.user

    const fileId = req.body.fileId
    // console.log(fileId);

    const file = await fileModel.findOne({ _id: fileId, userId: user._id, })
    if (!file) return res.status(404).json({ error: "File not found" })

    try {
        const fileSize = await verifyPostData({ key: `${file._id}${file.ext}` })

        if (file.size !== fileSize) {
            await file.deleteOne()
            // console.log("File Size does not match");
            return res.status(413).json({message :"File Size does not match"})
        }

        file.isUploading = false
        await file.save()

        updateParentSize(file.parentDirId, fileSize, "inc")

        return res.status(201).json({ message: "File uploaded successfully", fileId })

    } catch (err) {
        await file.deleteOne()
        // console.log(err);
        res.status(400).json({ error: "File could not be uploaded" })
    }
}

// export async function handleUploadCancel(req, res, next) {
//     const user = req.user

//     const fileId = req.body.fileId
//     return
//     const file = await fileModel.findOne({ _id: fileId, userId: user._id, })

//     if (!file) return res.status(404).json({ error: "File not found" })

//     try {
//         await file.deleteOne()
//         return res.status(200).json({ message:"Canceled sucessfully" })

//     } catch (err) {
//         await file.deleteOne()
//         res.status(400).json({ error: "Something went wrong" })
//     }
// }

