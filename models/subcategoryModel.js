const mongoose=require('mongoose')


mongoose.set('strictQuery', false);
const addressConnection= require('../config/mongodb')

const subcategorySchema=new mongoose.Schema({

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


const subcategory_details=new mongoose.model("subcategory_detail",subcategorySchema)

module.exports=subcategory_details;