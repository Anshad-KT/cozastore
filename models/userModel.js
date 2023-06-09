const mongoose=require('mongoose')


mongoose.set('strictQuery', false);
const addressConnection= require('../config/mongodb')

const LogInSchema=new mongoose.Schema({
    username:{
        type:String,
    required:true},


    name:{
        type:String,
    required:true}, 

    email:{
        type:String,
    required:true}, 
    
    
    phone:{
        type:Number,
    required:true},


    password:{
        type:String,
    required:true
    },

    wishlist:{
        type:Array,
    },

    status:{
        type:Boolean,
        required:true
    },

    wallet:{
        type:Number,
    }
})


const user_details=new mongoose.model("user_detail",LogInSchema)

module.exports=user_details;