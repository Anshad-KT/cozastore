const mongoose=require('mongoose')


mongoose.set('strictQuery', false);
mongoose.connect("mongodb://127.0.0.1/cozastore", { useNewUrlParser: true },()=>{
    console.log("address database connected");
});


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