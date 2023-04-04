const mongoose=require('mongoose')


mongoose.set('strictQuery', false);
const addressConnection= require('../config/mongodb')

const addressSchema=new mongoose.Schema({

    userId:{
        type:String,
    required:true},

    address:{
        type:Array,
        required:true
    },
    defaultAddress:{
        type:String,
    }


    
})


const address_details=new mongoose.model("address_detail",addressSchema)

module.exports=address_details;