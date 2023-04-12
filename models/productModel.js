const mongoose=require('mongoose')


mongoose.set('strictQuery', false);
const addressConnection= require('../config/mongodb')

const ProductSchema=new mongoose.Schema({
    
    title:{
        type:String,
    required:true},

    price:{
        type:Number,
    required:true}, 
    
    rating:{
        type:Number
    },

    productIndex:{
        type:String,
    required:true},

    imageReference:{
        type:Array,
    required:true},

    category:{
        type:String,
    required:true},

    stock:{
        type:Number,
    required:true},

    size:{
        type:Array,
    required:true},

    colour:{
        type:Array,
    required:true},

    subcategory:{
        type:String,
    required:true},

    brand:{
        type:String,
    required:true},

    uploadedDate:{
        type:String,
    },
    description:{
        type:String,
    },
    status:{
        type: Boolean,
        required:true
    }
    
})


const product_details=new mongoose.model("product_detail",ProductSchema)

module.exports=product_details;