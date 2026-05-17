import mongoose from "mongoose";
import { sessionModel } from "../model/sessionModal.js";


export async function checkAuth(req, res,next) {
    const id= req.signedCookies.token
    // console.log(id);
    

    if (!id) return res.status(401).json({error:"Login first"})

    const session =await  sessionModel.findOne({_id:id}).populate("uid")
    // console.log(session);

    if (!session) return res.status(401).json({ error: "No  such user exists. Please Register first." })
        
    req.user = session.uid

    next()
}

export async function checkNotRegularUser(req,res,next){
    if(req.user.role==="user") return res.status(401).json({error :"Permission denied"})
    return next()
}

export async function checkAdmin(req,res,next){
    if(!req.user.role==="admin") return res.status(401).json({error :"Permission denied"})
    return next()
}

export async function checkNotDeleted(req,res,next){
    if(req.user.deleted) return res.status(401).json({error :"Account has been deleted. Contact admin to recover"})
    return next()
}