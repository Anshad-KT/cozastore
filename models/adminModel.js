const mongoose=require('mongoose')


mongoose.set('strictQuery', false);
mongoose.connect("mongodb://127.0.0.1/cozastore", { useNewUrlParser: true },()=>{
    console.log("admin database connected");
});


const adminSchema=new mongoose.Schema({

    username:{
        type:String,
    required:true},

    email:{
        type:String,
    required:true}, 
    
    password:{
        type:String,
    required:true},
   
})


const admin_details=new mongoose.model("admin_detail",adminSchema)

module.exports=admin_details;