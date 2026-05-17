import express from "express"
import { handleDeleteDirectory, handleGetDirectory, handlePostDirectory, handleUpdateDirectory } from "../controller/directoryController.js";
import { validateIdMiddleware } from "../middleware/validateId.js";


const router = express.Router()

router.param("parentDirId",validateIdMiddleware)
router.param("id",validateIdMiddleware)

router.post("/{:parentDirId}", handlePostDirectory )

router.get('/{:id}',handleGetDirectory)

router.put("/{:id}",handleUpdateDirectory)

router.delete("/{:id}",handleDeleteDirectory)

export default router

