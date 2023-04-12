const mongoose=require('mongoose')


mongoose.set('strictQuery', false);
const addressConnection= require('../config/mongodb')

const reviewSchema=new mongoose.Schema({
    
    productIndex:{
        type:String,
    required:true},
    
    review:{
        type:Array,
    required:true},
    
    
})


const review_details=new mongoose.model("review_detail",reviewSchema)

module.exports=review_details;