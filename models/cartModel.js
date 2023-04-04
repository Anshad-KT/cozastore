const mongoose=require('mongoose')


mongoose.set('strictQuery', false);
const addressConnection= require('../config/mongodb')

const cartSchema=new mongoose.Schema({

    userId:{
        type:String,
    required:true},

    products:{
        type:Array,
        required:true
    }

    
})


const cart_details=new mongoose.model("cart_detail",cartSchema)

module.exports=cart_details;