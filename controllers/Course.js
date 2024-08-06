const Course = require('../models/Course');
const Tag = require('../models/Tags');
const User = require('../models/User');
const {uploadImageToCloudinary} =require('../utils/imageUploader');
require('dotenv').config();


// create course handler
exports.createCourse = async (req,res)=>{
    try {
        // fetch data from request body
        const {courseName,courseDescription,whatYouWillLearn,price,tag} = require('../models/Course');
        const thumbnail = req.files.thumbnailImage;

        //validation 
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag){
            return res.status(400).json({
                success:false,
                message:'All fields are required'
            })
        }

        // check for instructor
        const userId = req.user.id;  // as user will be logged in 
        const instructorDetails = User.findById(userId);
        console.log('Instructor Details ',instructorDetails);
        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:'Instructor details not found'
            })
        }

        // check for tag
        const tagDetails = Tag.findById(tag)
        if(!tagDetails){
            return res.status(404).json({
                success:false,
                message:'tag details not found'
            })
        }

        // upload image to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME)


        // create entry into db
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            price,
            instructor:instructorDetails._id,
            tag:tagDetails._id,
            whatYouWillLearn,
            thumbnail:thumbnailImage.secure_url
        })

        // add the new course to the user schema of instructor
        await User.findByIdAndUpdate({_id:instructorDetails._id},
            {
                $push:{
                    courses: newCourse._id

            }},
            {new:true}
        );

        // update the tag schema
        await Tag.findByIdAndUpdate(
            {_id:tagDetails._id},
            {
                $push:{
                    courses:newCourse._id
                }
            },
            {new:true}
        )

        // return response
        res.status(200).json({
            success:true,
            message:'Course is created successfully',
            data:newCourse
        })

        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success:false,
            message:'something went wring while creating the course'
        })
        
    }
}

// get all courses
exports.showAllCourses = async (req,res) =>{
    try {
        const allCourses = Course.find({},{
            courseName:true,
            courseDescription:true,
            price:true,
            thumbnail:true,
            instructor:true,
            ratingAndReviews:true,
            studentEnrolled:true
        }).populate("instructor").exec();

        res.status(200).json({
            success:true,
            message:'data for all courses fetched successfully',
            data:allCourses
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success:false,
            message:'something went wring while fetching the courses '
        })
    }
}