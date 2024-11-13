const Profile = require('../models/Profile');
const User= require('../models/User');
const Course = require('../models/Course');
const { uploadImageToCloudinary } = require('../utils/imageUploader');

// update profile
exports.updateProfile = async (req,res)=>{
    try {
        // fetch data
        const {dateOfBirth="",about="",contact} = req.body;
        const id = req.user.id; // id of logged in user get from decoded payload
        console.log("log of body data: ",dateOfBirth," ",about," "," ",contact);

        // validation
        // if(!gender || !contact || !id){
        //     return res.status(400).json({
        //         success:false,
        //         message:"All essential field are required"
        //     })
        // }

        // find user
        const userDetails = await User.findById(id);
        console.log("target user: ",userDetails);
        const profile = await Profile.findById(userDetails.additionalDetails);
    
        // Update the profile fields
        profile.dateOfBirth = dateOfBirth;
        profile.about = about;
        profile.contactNumber = contactNumber;
    
        // Save the updated profile
        await profile.save();
    
        return res.json({
          success: true,
          message: "Profile updated successfully",
          profile,
        });



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
exports.updateDisplayPicture = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture
    const userId = req.user.id
   
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    )
    const updatedProfile = await User.findByIdAndUpdate(
      { _id: userId },
      { image: image.secure_url },
      { new: true }
    )
    res.send({
      success: true,
      message: `Image Updated successfully`,
      data: updatedProfile,
    })
  }
  catch (error) {
      console.log("error log")
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};

exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      const userDetails = await User.findOne({
        _id: userId,
      })
        .populate("courses")
        .exec()
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        })
      }
      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
};