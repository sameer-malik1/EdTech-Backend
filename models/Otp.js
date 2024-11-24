const mongoose = require('mongoose');
const emailTemplate= require('../mail/templates/emailVerificationTemplate')

const OtpSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true
        
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires: 5*60*1000,

    }
})

// function to send mail
async function sendVerificationEmail(email,otp){
    try{
        const mailResponse = await mailSender(email,'verification mail from Edu-Notion', emailTemplate(otp));
        
       
        console.log('Email sent successfully: ',mailResponse)
    }
    catch(error){
        console.log('Error occured while sending mail for verification: ',error);
        throw error;
    }
}

// pre middleware that executes before createing entry into db
OtpSchema.pre("save",async (next)=>{
    console.log("New document saved to database");
    if(this.isNew){
    await sendVerificationEmail(this.email,this.otp);

    }
    next();
})

module.exports= mongoose.model('OTP',OtpSchema);