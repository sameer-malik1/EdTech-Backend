const { findOne } = require('../models/CourseProgress');
const User= require('../models/User');
const mailSender = require('../utils/mailSender');
const bcrypt = require('bcrypt');

exports.resetPasswordToken = async (req,res)=>{
    try {
        // fetch data from request body
        const email = req.body.email;

        // check if user exist
        const user = await User.findOne({email:email});
        if(!user){
            return res.json({
                success:false,
                message:'your Email is not registered with us'
            })
        }
        // generate reset password token
        const token = crypto.randomUUID(); 

        // update user by adding token and expiration time
        const updatedDetails = await User.findOneAndUpdate({email:email},{
            token:token,
            resetPasswordExpires: Date.now() + 5*60*1000,
        },{new:true});

        // create URL
        const url = `http://localhost:3000/update-password/${token}`;

        // send mail containing the URL
        await mailSender(email,"Password Reset Link",`Password reset link: ${url}`);

        // return response
        res.json({
            success:true,
            message:'Mail sent successfully, please check email and change pwd'
        })
    } catch (error) {
        console.log("Error Occured while reseting Password,");
        res.status(500).json({
            success:false,
            message:'Something went wrong while sending reset link mail'
        })
        
    }
}


// reset password
exports.resetPassword = async (req,res)=>{
    try {
        // fetch data
        const {password,confirmPassword,token} = req.body;

        // comparing passwords
        if(password !== confirmPassword){
            res.json({
                success:false,
                message:'Passwords are not matched, make sure both passwords are same'
            })
        }

        // fetch user based on inserted token
        const userDetails = await User.findOne({token:token});
        if(!userDetails){
            return res.json({
                success:false,
                message:'Token is Invalid'
            })
        }

        // checking token expiry
        if(userDetails.resetPasswordExpires < Date.now){
            return res.json({
                success:false,
                message:'Token is Expired, please regenerate your token'
            })
        }

        // hash the password before saving into database
        const hashedPassword = await bcrypt(password,10);

        // updating password on Db
        await User.findOneAndUpdate({token:token},{password:hashedPassword},{new:true});

        // return response
        return res.status(200).json({
            success:true,
            message:'Password reset successfully.'
        })



        
    } catch (error) {
        console.log('Error occurred while reseting password',error);
        res.status(500).json({
            success:false,
            message:'something went wrong while reseting password'
        })
        
    }
}