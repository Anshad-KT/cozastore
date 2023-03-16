const mongoose=require('mongoose')


mongoose.set('strictQuery', false);
mongoose.connect("mongodb://127.0.0.1/cozastore", { useNewUrlParser: true },()=>{
    console.log("coupon database connected");
});


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
    }
    
})


const coupon_details=new mongoose.model("coupon_detail",couponSchema)

module.exports=coupon_details;