const mongoose=require('mongoose')


mongoose.set('strictQuery', false);
mongoose.connect("mongodb://127.0.0.1/cozastore", { useNewUrlParser: true },()=>{
    console.log("cart database connected");
});


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