
const {instance} = require('../config/razorpay');
const Course = require('../models/Course');
const User = require('../models/User');
const mongoose = require('mongoose');
const mailSender = require('../utils/mailSender');


// capture the payment
exports.caturePayment = async (req,res)=>{
    try {
        // fetch courseId and userId 
        const {courseId} = req.body;
        const userId = req.user.id;

        // validation
        // validate the course exist or not
        let course;
        try {
             course = await Course.findById(courseId);
            if(!course){
            return res.json({
                success:false,
                message:'course does not exist'
            })
        }

        // check if user is already enrolled in the course
        const uid = mongoose.Types.ObjectId(userId);
        if(course.studentEnrolled.includes(uid)){
            return res.status(200).json({
                success:true,
                message:'User is already enrolled in the course'
            })
        }

            
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success:false,
                message:error.message,
            })
            
        }

        // create the order
        const amount = course.price;
        const currency = 'INR';
        const options ={
            amount:amount*100,
            currency,
            receipt: Math.random(Date.now).toString(),
            notes:{
                courseId:course._id,
                userId,
            }
        }
        try {
            // initiate the payment using razorpay
            const paymentResponse = await instance.orders.create(options);
            console.log("Payment Response: ",razorpayResponse);
            return res.status(200).json({
                success:true,
                courseName:course.courseName,
                courseDescription:course.courseDescription,
                orderId:paymentResponse._id,
                currency:paymentResponse.currency,
                amount:paymentResponse.amount,

            })
            
        } catch (error) {
            console.log(error);
            res.json({
                success:false,
                message:'could not initiate order'
            })
            
        }
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"something went wrong while capturing the payment",
            error:error.message,
        })
    }
}

// verify the signatures of razorpay and server
exports.verifySignature = async (req,res)=>{
    try {
        const webHookSecret = "12345678";
        
        const signature = req.headers('x-razorpay-signature');

        const shasum = crypto.createHmac('sha256',webHookSecret);
        shasum.update(JSON.stringify(req.body));
        const digest = shasum.digest('hex');

        // checking the secret from razorpay and server are matched or not
        if(signature === digest ){
            console.log('Payment is Authorized');
            // actions to perform after matching of sigatures
            const {courseId,userId} = req.body.payload.payment.entity.notes;
            try {
                // find the course and enroll the student in it
                const enrolledCourse = await Course.findOneAndUpdate({_id:courseId},
                    {
                        $push:{
                            studentEnrolled:userId,
                        }
                    },
                    {new:true}

                );
                if(!enrolledCourse){
                    return res.json({
                        success:false,
                        message:'Course not found'
                    });
                }
                console.log('Enrolled course: ',enrolledCourse);

                // find the user and add the course to their list enrolledCourses
                const enrolledStudent = await User.findOneAndUpdate({_id:userId},{
                    $push:{
                        courses:courseId,
                    }
                },{new:true})

                console.log("Enrolled student: ",enrolledStudent);

                // send confirmation mail to the user who bought the course
                const emailResponse = await mailSender(enrolledStudent.email,"Congratulations for the successful course enrollment",
                    "Congratulations you are enrolled in new Course"
                );
                console.log('Email response while purchase of course: ',emailResponse);

                res.status(200).json({
                    success:true,
                    message:"Signature verified and course added"
                });




                
            } catch (error) {
                res.status(500).json({
                    success:false,
                    message:error.message,
                })
                
            }
        }
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        })
        
    }
}