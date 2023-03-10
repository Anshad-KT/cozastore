const mongoose=require('mongoose')


mongoose.set('strictQuery', false);
mongoose.connect("mongodb://127.0.0.1/cozastore", { useNewUrlParser: true },()=>{
    console.log("product database connected");
});


const ProductSchema=new mongoose.Schema({
    
    title:{
        type:String,
    required:true},

    price:{
        type:String,
    required:true}, 
    
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