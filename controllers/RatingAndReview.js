const RatingAndReview = require('../models/RatingAndReviews');
const Course = require('../models/Course');
const mongoose = require('mongoose');


// create rating and review handler
exports.createRating = async (req,res)=>{
    try {
        const userId = req.user.id;
        const {rating,review,courseId} = req.body;
        // check if user is already enrolled or not
        const courseDetails = await Course.findOne({_id:courseId,
            
            studentEnrolled:{$elemMatch: {$eq:userId}}
        },{new:true});

        if(!courseDetails){
            res.status(404).json({
                success:false,
                message:'Student is not enrolled in the course'

            })
        }

        // check if user already reviewed 
        const alreadyReviewed = await RatingAndReview.findOne({user:userId,course:courseId});
        if(alreadyReviewed){
            res.status(403).json({
                success:false,
                message:'Course is already reviewed by user'
            })
        }

        // create rating and review
        const ratingReview = await RatingAndReview.create({
            rating,
            review,
            user:userId,
            course:courseId
        });
        // update course with this rating and review
       const updatedCourse = await Course.findByIdAndUpdate({_id:courseId,
            $push:{
                ratingAndReview:ratingReview._id,
            }
        },{new:true})
        console.log('updated course with ratreview ',updatedCourse);

        // return response
        res.status(200).json({
            success:true,
            message:'Rating and Review is created successfully',
            ratingReview,
        })
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:'something went wrong while creating rating and review',
            
        })
    }
}

// average rating handler
exports.averageRating = async (req,res)=>{
    try {
        const {courseId} = req.body;

        // calculate average rating
        const result = await RatingAndReview.aggregate([
            {
                $match:{
                    course: mongoose.Types.ObjectId(courseId)
                }
            },
            {
                $group:{
                    _id:null,
                    averageRating:{$avg:'$rating'},
                }
            }
        ]);

        // return rating
        if(result > 0){
            return res.status(200).json({
                success:true,
                averageRating:result[0].averageRating,
            })
        }
        // if no rating/review exist
        res.status(200).json({
            success:true,
            message:'Average rating is 0, no rating is given till now',
            averageRating:0
        })
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
            
        })
        
    }
}

// get a course's rating/reviews handler
exports.getCourseRatingReviews = async (req,res)=>{
    try {
        const courseId = req.body.courseId;

        // validation
        if(!courseId){
            return res.json({
                success:false,
                message:'Course not found'
            })
        }

        // find all the RatingReviews
        const ratingReviews = await RatingAndReview.find({_id:courseId});

        res.status(200).json({
            success:true,
            message:'All ratingReviews of specific course fetched successfully'
        })
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
            
        })
        
    }
}

// get rating of all the courses handler
exports.getAllRatingReviews = async (req,res)=>{
    try {
        const courseId = req.body.courseId;

        // validation
        if(!courseId){
            return res.json({
                success:false,
                message:'Course not found'
            })
        }

        // find all the RatingReviews
        const ratingReviews = await RatingAndReview.find({}).sort({rating:"desc"})
                                    .populate({path:"user",select:"firstName lastName email image"})
                                    .populate({path:"course",select:"courseName"})
                                    .exec();


        return res.status(200).json({
            success:true,
            message:'All ratingReviews of all the courses fetched successfully'
        })
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
            
        })
        
    }
}