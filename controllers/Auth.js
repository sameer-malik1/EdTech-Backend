const User = require('../models/User');
const OTP = require('../models/Otp');
const Profile = require('../models/Profile');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
require('dotenv').config();


// otp Sender
exports.sendOTP = async (req,res)=>{
    try {
        // fetch email from request body
        const {email} = req.body;

        //check if email already exist or not
        const checkUserExist = User.findOne({email});
        if(checkUserExist){
            return res.status(400).json({
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
        let result = await OTP.findOne({otp:otp});
        if(result){
            otp = otpGenerator.generate(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false
            });
            result = await OTP.findOne({otp:otp});
        }

        // create an entry of OTP into database
        const payload = {email,otp};
        const otpBody= await OTP.create(payload);
        console.log('saved OTP in database ',otpBody);

        // response
        res.status(200).json({
            success:true,
            message:'OTP sent successfully',
            otp,
        })

        



        
    } catch (error) {
        console.log("Error occured while generating OTP ",error);
        res.status(500).json({
            success:false,
            message:'Internal Server Error'
        })
        
    }
}


// sign up
exports.signUp = async ()=>{
    try {
        //fetch data from request body
        const {firstName,lastName,email,password,confirmPassword,accountType,contactNumber,otp} = req.body;

        // validation 
        if(!firstName || !lastName || !email || !password || !confirmPassword || !contactNumber || !otp){
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
        const checkUserExistance = User.findOne({email});
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
        }else if(otp !== recentOtp){
            return res.status(400).json({
            success:false,
            message:'Invalid OTP'
        })
        }

        // hashed password before saving into db
        const hashedPassword = await bcrypt.hash(password,10);

        //create entry of profileDetails in DB
        const profileDetails = Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contact:null

        })

        // create account entry into DB
        const user = User.create({
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
            message:'User created successfully'
        })

        
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
        if(!existingUser){
            return res.status(401).json({
                success:false,
                message:'Create Account first to login'
            })
        }

        // compare passwords and generate token
        if(await bcrypt.compare(password,user.password)){
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

            // create cookie and send response
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly,

            }
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
        // fetch data from request body
        const {oldPassword,newPassword,confirmPassword} = req.body;

        // validation
        if(!oldPassword || !newPassword || !confirmPassword){
            res.status(403).json({
                success:false,
                message:'All Field are required, please fill all fields'
            })

        }

        // update password in DB

        // send mail - pasword updated

        // return response
        
    } catch (error) {
        
    }
}

