const mongoose=require('mongoose')


mongoose.set('strictQuery', false);
mongoose.connect("mongodb://127.0.0.1/cozastore", { useNewUrlParser: true },()=>{
    console.log("category database connected");
});


const categorySchema=new mongoose.Schema({

    name:{
        type:String,
    required:true},

    date:{
        type:String,
    required:true}, 

    status:{
        type: Boolean,
        required:true
    }
    
})


const category_details=new mongoose.model("category_detail",categorySchema)

module.exports=category_details;