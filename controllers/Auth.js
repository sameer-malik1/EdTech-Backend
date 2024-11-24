const User = require('../models/User');
const OTP = require('../models/Otp');
const Profile = require('../models/Profile');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
require('dotenv').config();
const mailSender = require('../utils/mailSender');


// otp Sender
exports.sendOTP = async (req,res)=>{
    try {
        // fetch email from request body
        const {email} = req.body;

        //check if email already exist or not
        const checkUserExist = await User.findOne({email});

        console.log("email exist: ",checkUserExist);
        
        if(checkUserExist){
           
            return res.status(401).json({
                success:false,
                message:'User already Exist'
            })
        }



        // generate OTP
        let otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false
        });

        // checking the otp is unique or not
        const result = await OTP.findOne({ otp: otp });
		console.log("Result is Generate OTP Func");
		console.log("OTP", otp);
		console.log("Result", result);
		while (result) {
			otp = otpGenerator.generate(6, {
				upperCaseAlphabets: false,
			});
		}
		const otpPayload = { email, otp };
		const otpBody = await OTP.create(otpPayload);
		console.log("OTP Body", otpBody);
		res.status(200).json({
			success: true,
			message: `OTP Sent Successfully`,
			otp,
		});
        
        await mailSender(otpPayload.email,"Registration OTP",otpPayload.otp);

        



        
    } catch (error) {
        console.log("Error occured while generating OTP ",error);
        res.status(500).json({
            success:false,
            message:'Internal Server Error'
        })
        
    }
}


// sign up
exports.signUp = async (req,res)=>{
    try {
        //fetch data from request body
        const {firstName,lastName,email,password,confirmPassword,accountType , otp} = req.body;

        // validation 
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp ){
            return res.status(403).json({
                success:false,
                message:'All fields are required.'
            })
        }
        // mating the passwords
        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:'Password & confirmPassword values are not matched, try again please.'
            })
        }
        // check user already exist or not
        const checkUserExistance = await User.findOne({email});
        if(checkUserExistance){
            return res.status(400).json({
                success:false,
                message:'User already Exist'
            })
        }

        // find the most recent OTP stored in db
        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log('recentOTP from AuthController ',recentOtp);
        if(recentOtp.length == 0){
            return res.status(400).json({
            success:false,
            message:'OTP not found'
        })
        }else if(otp !== recentOtp[0].otp){
            return res.status(400).json({
            success:false,
            message:'Invalid OTP'
        })
        }
        

        // hashed password before saving into db
        const hashedPassword = await bcrypt.hash(password,10);

        //create entry of profileDetails in DB
        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contact:null

        })

        // create account entry into DB
        const user = await User.create({
            firstName,
            lastName,
            email,
            password:hashedPassword,
            accountType,
            additionalDetails: profileDetails._id,
            image:`https://ui-avatars.com/api/?name=${firstName}+${lastName}`

        })

        // return response
        return res.status(200).json({
            success:true,
            message:'User created successfully',
            user,
        })

        // await mailSender(user.email,"Title",otp);

        
    } catch (error) {
        console.log("Error occured while creating Account ",error);
        res.status(500).json({
            success:false,
            message:'User cannot be registerd due to Internal Server Error'
        })
        
    }
}


// login
exports.login = async (req,res)=>{
    try {
        // fetch data from request body
        const {email,password} = req.body;

        // vallidation of fetched data
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:'Please Fill the all Fields'
            })
        }

        // check if existing user
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({
                success:false,
                message:'Create Account first to login'
            })
        }

        // compare passwords and generate token
        if(await bcrypt.compare(password,user.password)){
            console.log("inside password comparing")
            // generate token
            const payload = {
                email:user.email,
                id:user._id,
                accountType:user.accountType
            }
            const token =  jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:'2h',
            });
            user.token = token;
            user.password = undefined;

            console.log("outside password comparision");

            // create cookie and send response
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true,

            }
            console.log("outside options");
            res.cookie('token',token,options).status(200).json({
                success:true,
                token,
                user,
                message:'User successfully login'
            })
        }else{
            res.status(401).json({
                success:false,
                message:'Password is incorrect',
            })
        }
        
        
    } catch (error) {
        console.log("Error occured while Logging Account ",error);
        res.status(500).json({
            success:false,
            message:'Internal Server Error'
        })
        
    }
}


//change Password

exports.changePassword = async (req,res)=>{
    try {

        // get user data using req.user
        const userDetails = await User.findById(req.user.id);
        // fetch data from request body
        const {oldPassword,newPassword,confirmPassword} = req.body;

        // validation
        if(!oldPassword || !newPassword || !confirmPassword){
            res.status(403).json({
                success:false,
                message:'All Field are required, please fill all fields'
            })

        }
        // validate old password
        const isPasswordMatched = await bcrypt.compare(oldPassword,userDetails.password);

        if(!isPasswordMatched){
            res.status(401).json({ // if old psd doesn't match, return 401
                success:false,
                message:'your Old password is incorrect'
            })

        }
        // checking new psd and confirm psd are matched 
        if(newPassword !== confirmPassword){
            return res.status(401).json({
                success:false,
                message:'The newPassword and confirmPassword are not same'
            })
        }
        // hashed the password
        const encryptedPassword = await bcrypt.hash(password,10);

        // update password in DB
        const updatedUserDetails = await User.findByIdAndUpdate({_id:userDetails._id},{password:encryptedPassword},{new:true});


        // send notification email - pasword updated
        try {
            const mailResponse = await mailSender(userDetails.email,`Password updated Successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`);
            console.log('Email sent successfully',mailResponse);
            
        } catch (error) {
            console.error('Error occurred while sending email for password change',error);
            res.status(500).json({
                success:false,
                message:"Error occurred while sending mail",
                error:error.message,
            })
        }



        // return response
        res.status(200).json({
            success:true,
            message:'Password updated successfully'
        })
        
    } catch (error) {
        console.error('Error occurred while sending email for password change',error);
            res.status(500).json({
                success:false,
                message:"something went wrong hile sending mail for password change",
                error:error.message,
            })
        
    }
}
