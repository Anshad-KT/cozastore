const mongoose=require('mongoose')

mongoose.set('strictQuery', false);
const addressConnection= require('../config/mongodb')

const brandSchema=new mongoose.Schema({

    name:{
        type:String,
    required:true},

    imageReference:{
        type:Array,
    },
    
    date:{
        type:String,
    required:true}, 
    
    status:{
        type: Boolean,
        required:true
    }
})


const brand_details=new mongoose.model("brand_detail",brandSchema)

module.exports=brand_details;