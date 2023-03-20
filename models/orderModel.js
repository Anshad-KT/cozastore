const mongoose=require('mongoose')


mongoose.set('strictQuery', false);
mongoose.connect("mongodb://127.0.0.1/cozastore", { useNewUrlParser: true },()=>{
    console.log("orders database connected");
});


const OrderSchema=new mongoose.Schema({
    

    orderedUser:{
        type:String,
    required:true}, 
    

    deliveryAddress:{

        houseName: { type: String },
        postalName: { type: String },
        pincode: { type: Number },
        district: { type: String},
        state: { type: String},
        country: { type: String},
        
      },
    
    billAmount:{
        type:Number,
    required:true},
    

    products:{
        type:Array,
        required:true,
    },

    
    couponId:{
        type:String,
    },

    couponDiscount:{
        type:String
    },
  
    orderDate:{
        type:String,
        required:true
    },

    deliveryDate:{
        type:String,
        required:true
    },
   

    paymentType:{
        type:String,
        required:true
    },

    


    
})


const order_details=new mongoose.model("order_detail",OrderSchema)

module.exports=order_details;