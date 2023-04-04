const mongoose=require('mongoose')


mongoose.set('strictQuery', false);
const addressConnection= require('../config/mongodb')

const bannerSchema=new mongoose.Schema({

    imageReference:{
        type:Array,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    product:{
        type:String,
        required:true
    },
    status:{
        type:Boolean,
        required:true
    }
   
})


const banner_details=new mongoose.model("banner_detail",bannerSchema)

module.exports=banner_details;