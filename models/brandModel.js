const mongoose=require('mongoose')


mongoose.set('strictQuery', false);
mongoose.connect("mongodb://127.0.0.1/cozastore", { useNewUrlParser: true },()=>{
    console.log("brand database connected");
});


const brandSchema=new mongoose.Schema({

    name:{
        type:String,
    required:true},

    imageReference:{
        type:String,
    },
    
    date:{
        type:String,
    required:true}, 
    
    status:{
        type: Boolean,
        required:true
    }
})


const brand_details=new mongoose.model("brand_detail",brandSchema)

module.exports=brand_details;