const mongoose=require('mongoose')


mongoose.set('strictQuery', false);
const addressConnection= require('../config/mongodb')


const categorySchema=new mongoose.Schema({

    name:{
        type:String,
    required:true},

    date:{
        type:String,
    required:true}, 

    status:{
        type: Boolean,
        required:true
    }
    
})


const category_details=new mongoose.model("category_detail",categorySchema)

module.exports=category_details;