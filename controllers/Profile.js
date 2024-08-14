const Profile = require('../models/Profile');
const User= require('../models/User');
const Course = require('../models/Course');

// update profile
exports.updateProfile = async (req,user)=>{
    try {
        // fetch data
        const {dateOfBirth="",about="",gender,contact} = req.body;
        const id = req.user.id; // id of logged in user get from decoded payload

        // validation
        if(!gender || !contact || !id){
            return res.status(400).json({
                success:false,
                message:"All essential field are required"
            })
        }

        // find user
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = profileId;
        // update profile data
        profileDetails.about = about;
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.gender = gender;
        profileDetails.contact = contact;
        // push update to Db
        await profileDetails.save();

        // return respone
        res.status(200).json({
            success:false,
            message:'Profile details are updated successfully',
            profileDetails,
        })
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:'something went wrong while updating the Profile details'
        })
        
    }
}

// delete user handler
exports.deleteAccount = async (req,res)=>{
    try {
        const id = req.user.id;
        // find logged in user
        const userDetails = await User.findById(id);
        if(!userDetails){
            return res.status(400).json({
                success:false,
                message:'Id is missing'
            })
        }

        // delete profile
        await User.findByIdAndDelete({_id:userDetails.additionalDetails});

        // delete the user from enrolledStudents of all the other enrollderStudent in the course
         await Course.findByIdAndDelete({studentEnrolled:userDetails._id})

         // delete the user
         await User.findByIdAndDelete({_id:id});

         // return response
         res.status(200).json({
            success:false,
            message:'User deleted Successfully'
         })
        
        

        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:'something went wrong while deletion of User Account'
         })
        
    }
}

// get user details including profile details
exports.getAllUserDetails = async (req,res)=>{
    try {
        // fetch logged in user id
        const id = req.user.id;
        // validate and get user data from Db
        const userDetails = await User.findById({_id:id}).populate("additionalDetails").exec();

        // return response
        res.status(200).json({
            success:true,
            message:'User data fetched successfullly',
            userDetails,
        })
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
            
        })
        
    }
}

// update display picture