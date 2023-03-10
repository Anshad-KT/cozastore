const mongoose=require('mongoose')


mongoose.set('strictQuery', false);
mongoose.connect("mongodb://127.0.0.1/cozastore", { useNewUrlParser: true },()=>{
    console.log("user database connected");
});


const LogInSchema=new mongoose.Schema({
    username:{
        type:String,
    required:true},


    name:{
        type:String,
    required:true}, 

    email:{
        type:String,
    required:true}, 
    
    
    phone:{
        type:Number,
    required:true},


    password:{
        type:String,
    required:true
},


   



      
    
    status:{
        type:Boolean,
        required:true
    }
})


const user_details=new mongoose.model("user_detail",LogInSchema)

module.exports=user_details;