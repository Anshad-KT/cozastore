const accountSid = "AC0c2ac5ad85fa539d5504f311e86b3567"
const authToken = "f145bed12b1636e1811f4bb671f40981"
const client = require('twilio')(accountSid,authToken)
const MessagingResponce = require('twilio').twiml.MessagingResponse



const otp =(verifiedNumber,otpValue)=>{
        
        client.messages.create({
        to: '+91'+verifiedNumber,
        from: "+12765218224",
        body:`${otpValue} is your otp, please do not share it with others`
    }).then((message)=>{
        console.log(message.sid);
    }).catch((err)=>{
        console.log(err);
    })
} 

module.exports=otp


