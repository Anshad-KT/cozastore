const mongoose=require('mongoose')


mongoose.set('strictQuery', false);
const addressConnection= require('../config/mongodb')

const couponSchema=new mongoose.Schema({

    code:{
        type:String,
    required:true},

    discountType:{
        type:String,
    required:true}, 
    
    discountAmount:{
        type:String,
    required:true},
    
    maxDiscountAmount:{
        type:String,
        required:true,
    },

   
    
    minPurchase:{
        type:String,
    required:true},

    createDate:{
        type:String,
    required:true}, 
    
    expiryDate:{
        type:String,
    required:true},
    
    status:{
        type: Boolean,
        required:true
    },
    usedUsers:{
        type:Array,
    }
    
})


const coupon_details=new mongoose.model("coupon_detail",couponSchema)

module.exports=coupon_details;