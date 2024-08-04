const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');


// auth 
exports.auth = async (req,res,next)=>{
    try {
        // extract token first
        const token = req.cookies.token || req.body.token || req.header('Authorisation').replace("Bearer ","");
        if(!token){
            return res.status(401).json({
                success:false,
                message:'Token is missing'
            })

        }
        // verify token 
        try {
            const decodedPayload = jwt.verify(token,process.env.JWT_SECRET);
            console.log('decoded Payload in auth ',decodedPayload);
            req.user = decodedPayload;
            
        } catch (error) {
            console.log(error);
            res.status(401).json({
                success:false,
                message:'invalid token'
            })
            
        }
        next();
        
        
    } catch (error) {
        res.status(401).json({
            success:false,
            message:'something went wrong while validating the token'
        })
        
    }
}

// isStudent
exports.isStudent = async (req,res)=>{
    try {
        if(req.user.accountType !== "Student"){
            return res.status(401).json({
                success:false,
                message:'This is a protected routes for Students only'
            })
        }
        next();
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:'User role cannot be verified ,plz try again'
        })
    }
}

// for Instructor
exports.isInstructor = async (req,res,next)=>{
    try {
        if(req.user.accountType !== "Instructor"){
            return res.status(401).json({
                success:false,
                message:'This is a protected routes for Instructor only'
            })
        }
        next();
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:'User role cannot be verified ,plz try again'
        })
    }
    
}

// for Admin
exports.isAdmin = async (req,res,next)=>{
    try {
        if(req.user.accountType !== "Admin"){
            return res.status(401).json({
                success:false,
                message:'This is a protected routes for Admin only'
            })
        }
        next();
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:'User role cannot be verified ,plz try again'
        })
    }
}

