
require('dotenv').config()

const accountSid = process.env.AUTH_SID
const authToken = process.env.AUTH_TOKEN
const client = require('twilio')(accountSid,authToken)
const MessagingResponce = require('twilio').twiml.MessagingResponse

const nodemailer = require('nodemailer')



// const otp =(verifiedNumber,otpValue)=>{
        
//         client.messages.create({
//         to: '+91'+verifiedNumber,
//         from: process.env.FROM_NUMBER,
//         body:`${otpValue} is your otp, please do not share it with others`
//     }).then((message)=>{
//         console.log(message.sid);
//     }).catch((err)=>{
//         console.log(err);
//     })
// } 

const otp = (verifiedEmail, otpValue)=>{
    // const userPostOtpLogin = async function (req, res, next) {
        // let checkmail = await userdata.findOne({ useremail: req.body.useremail })
        // let OtpCode = Math.floor(100000 + Math.random() * 900000)
        // otp = OtpCode
        // otpEmail = checkmail.useremail
        let mailTransporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "cozastore.tech@gmail.com",
            pass: "qgugogtpjodsdmov"
          }
        })
        let docs = {
          from: "cozastore.tech@gmail.com",
          to: verifiedEmail,
          subject: "cozastore Varification",
          text: `Hey there! we are thrilled to have you as a member of cozastore, ${otpValue} is your otp, please do not share it with others`
        }
        mailTransporter.sendMail(docs, (err) => {
          if (err) {
            console.log(err)
          }
        })  
      
      
}

module.exports=otp


