import express from "express"
import { handleDeleteFile, handleGetFile, handleUpdateFile, handleUploadComplete, handleUploadInitiate } from "../controller/fileController.js";
import { validateIdMiddleware } from "../middleware/validateId.js";

const router = express.Router()

router.param("parentDirId",validateIdMiddleware)
router.param("id",validateIdMiddleware)

// router.post("/{:parentDirId}",handlePostFile)

router.post("/upload/initiate",handleUploadInitiate)
router.post("/upload/complete",handleUploadComplete)
// router.post("/upload/cancel",handleUploadCancel)

router.get("/:id",handleGetFile)

router.put("/:id",handleUpdateFile)

router.delete("/:id",handleDeleteFile)

export default router
