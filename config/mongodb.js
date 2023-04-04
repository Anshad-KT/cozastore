const mongoose=require('mongoose')
require('dotenv').config()

mongoose.set('strictQuery', false);
const mongo = mongoose.connect(process.env.MONGO, { useNewUrlParser: true },()=>{
    console.log("cozastore database connected");
});

module.exports=mongo
