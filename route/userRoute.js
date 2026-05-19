import express from "express"
import { checkAdmin, checkAuth, checkNotDeleted, checkNotRegularUser } from "../middleware/auth.js"
import {
    handleAdminLogout,
    handleGetAllUsers,
    handleGetUser,
    handleHardDelete,
    handleLoginUser,
    handleLogoutUser,
    handleLogoutUserAll,
    handleRegisterUser,
    handleSoftDelete
} from "../controller/userController.js"


const router = express.Router()

// router.get("/",(req,res)=>{
//     res.json("hello world")
// })

router.get("/user", checkAuth, checkNotDeleted, handleGetUser)
router.get("/users", checkAuth,checkNotDeleted, checkNotRegularUser, handleGetAllUsers)

router.post("/user/register", handleRegisterUser)
router.post("/user/login", handleLoginUser)

router.post("/user/logout", checkAuth,checkNotDeleted, handleLogoutUser)
router.post("/user/logout-all", checkAuth,checkNotDeleted, handleLogoutUserAll)
router.post("/user/{:userId}/logout", checkAuth,checkNotDeleted, checkNotRegularUser, handleAdminLogout)

router.delete("/user/{:userId}/soft", checkAuth,checkNotDeleted, checkNotRegularUser, handleSoftDelete)
router.delete("/user/{:userId}/hard", checkAuth,checkNotDeleted, checkAdmin, handleHardDelete)


export default router