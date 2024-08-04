const nodemailer = require('nodemailer');
require('dotenv').config();

const mailSender = async (email,title,body) =>{
    try{
        const transporter = nodemailer.createTransport({
            service:'gmail',
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS
            }
        });

        // sendMail
        const info = transporter.sendMail({
            from: "Edu-Notion | by Apna Organization",
            to:`${email}`,
            subject:`${title}`,
            html:`${body}`
        })

    }catch(error){
        console.log(error.message);

    }
}

module.exports = mailSender;