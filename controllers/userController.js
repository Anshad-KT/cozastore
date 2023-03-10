let otp = require('../helpers/otp')
const Promise = require('promise')

const bcrypt = require('bcrypt')
let user_details = require('../models/userModel')
let product_details = require('../models/productModel')
const category_details = require('../models/categoryModel')
const cart_details = require('../models/cartModel')
const order_details = require('../models/orderModel')
const { ExecutionContextContextImpl } = require('twilio/lib/rest/studio/v1/flow/execution/executionContext')
const { reject } = require('promise')
const address_details=require('../models/addressModel')
const { default: mongoose } = require('mongoose')
const {v4 : uuidv4} = require('uuid')
const Razorpay = require('razorpay');

var instance = new Razorpay({
  key_id: 'rzp_test_03pins9a8mVlgN',
  key_secret: 'EAY2f074OyETGQarM9TbZdtW',
});
/////

//msgs to display to hbs

let loginMsg
let SignupMsg;
let otpMsg
let filter
let checkPhone;
let userSession;
let editMsg
let productParams
let colour
let quantity
let size
let uss
let Id
let editPassMsg
//
let didSIgnUp=false;
let didLogin=false
//
let userOtpname


let otpNumber;
let signupData;
let loginData;
let loginOtpData
let otpValue
let categoryRequested
let details;
let userdone
let addressParams

// const MessagingResponce = require('../helpers/otp')


////

let userGetProfile =async function(req, res, next) {
    try {

        if(userSession){
            let userProfile = await user_details.findOne({username:userSession})
          
            let prode= await order_details.aggregate([
                {
                    $match:{orderedUser:userSession}
                },
                {
                   $unwind:'$products'
                },
                
            ])
            let len=prode.length;
            res.render('user-profile',{name:userProfile.name,username:userProfile.username,phone:userProfile.phone,email:userProfile.email,len})
        }else{
            res.redirect('/login')
        }

    } catch (error) {
        console.log(error.message);
    }
   
    
}
let userGetEditProfile =async function(req, res, next) {
    try {
        if(userSession){
            
            let userProfile = await user_details.findOne({username:userSession})
            let selectedAddress = await address_details.aggregate([
               
               {
                  $match:{
                     userId:userSession
                  }
               },
               {
                  $unwind:"$address"
               },
               {
                   $match:{
                       "address.id":addressParams
                   }
               }


            ])
            console.log(selectedAddress);
            res.render('user-editprofile',{name:userProfile.name,username:userProfile.username,phone:userProfile.phone,email:userProfile.email,editMsg,selectedAddress})
            editMsg=null

        }else{
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message);
    }
   
    
}
let userGetEditProfilePassword =function(req, res, next) {
    if(userSession){
        res.render('user-editpassword',{editPassMsg})
        editPassMsg = null;
    }else{
        res.redirect('/login')
    }
    
}

let userGetCheckout =async function(req, res, next) {
    if(userSession){
        let userProfile = await user_details.findOne({username:userSession})
        console.log(userdone);
        let totalAmount=0
        for(var i=0;i<userdone.length;i++){
            totalAmount=userdone[i].total+totalAmount
        }
        console.log(totalAmount);
        let length = userdone.length
        let selectedAddress= await address_details.aggregate([
            {
                $match:{userId:userSession}
            },
            {
                $unwind:"$address"
            },
            {
                $match:{"address.id":addressParams}
            },
        ])
        // console.log(addressParams);
        // console.log(selectedAddress);
        res.render('user-checkout',{name:userProfile.name,username:userProfile.username,phone:userProfile.phone,email:userProfile.email,selectedAddress,userdone,totalAmount})
    }else{
        res.redirect('/login')
    }
    
}

let userGetCart = async function(req, res, next) {

        Id = await user_details.findOne({username:userSession})
             console.log(Id);
             uss=Id._id.toString()
             console.log(uss);
             if(userSession){
             userdone = await cart_details.aggregate(
                     
                     
                [
                {
                    $match:{userId:uss}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        
                        productId:"$products.productId",
                        quantity:"$products.quantity",
                        size:"$products.size",
                        colour:"$products.colour"
                    }
                },
                {
                    $lookup:{
                        from:'product_details',
                        localField:'productId',
                        foreignField:'productIndex',
                        as:'product'
                    }
                },
                {
                    $project:{
                        productId:1,quantity:1,size:1,colour:1,product:{$arrayElemAt:['$product',0]}
                    }
                }

            ])

            console.log(userdone[0].product);
    
    for(var i=0;i<userdone.length;i++){
       userdone[i].total =parseInt(userdone[i].quantity)*parseInt(userdone[i].product.price);
    
        // console.log(userdone[0].product);

        
     }
    let amount=0;
     for(var i=0;i<userdone.length;i++){
         amount =amount + userdone[i].total
        
    } 

   
    
    

            res.render('user-cart',{userdone,amount})
        }else{
            res.redirect('/login')
        }
        
   
   
    
}
let userGetOrders = async function(req, res, next){
    if(userSession){
      let orders = await order_details.findOne({orderedUser:userSession})
      
        // console.log(orders);
        let resp = await order_details.aggregate([
            {
                $match:{orderedUser:userSession}
            },
            {
                $unwind:'$products'
            }
        ])

        for(var i=0;i<resp.length;i++){
             if(resp[i].products.status=="Cancelled"){
                 resp[i].products.red=true;
                 resp[i].products.green=false;
                 resp[i].products.yellow=false;                     
             }else if(resp[i].products.status=="Delivered"){
                resp[i].products.green=true; 
                resp[i].products.red=false; 
                resp[i].products.yellow=false;                 
            }else if(resp[i].products.status=="Pending"){
                resp[i].products.green=false; 
                resp[i].products.red=false;   
                resp[i].products.yellow=true;               
            }
            
        }
        
        for(var j=0;j<resp.length;j++){
            resp[j].products.userId=resp[j]._id
            
        }
        
       // let userProfile = await user_details.findOne({username:userSession})
         res.render('user-orders',{resp,total:orders.billAmount})

    }else{
        res.redirect('/login')
    }
    
}

let userGetDeleteCart =  async function(req, res, next) {
     
    if(userSession){
        let cartIds = req.params.id
        
        
        await cart_details.updateOne({userId:uss},{$pull:{products:{productId:cartIds}}})

        
        
        res.redirect('/cart')
    }else{
        res.redirect('/login')
    }
    
}

let userGetDeleteOne = async function(req, res, next) {
     
    if(userSession){
        
        let parm=req.query
        
        console.log(parm.orderId+" "+parm.productIndex);

        await order_details.updateOne({_id:parm.orderId,"products.productIndex":parm.productIndex},{$set:{"products.$.status":"Cancelled"}})

        res.redirect('/orders')

    }else{
        res.redirect('/login')
    }
    
}

let userGetAddress = async function(req, res, next) {
     
    if(userSession){
        
       console.log("hii");
        let allAddress= await address_details.aggregate([
            {
                $match:{userId:userSession}
            },
            {
                $unwind:"$address"
            }
        ])
        console.log("all address");
        console.log(allAddress);
       
        res.render('user-addresslist',{allAddress})

    }else{
        res.redirect('/login')
    }
    
}


let userGetAddressParams = async function(req, res, next) {
     
    if(userSession){
        
      
        addressParams=req.params.id
        console.log(addressParams);
        res.redirect('/checkout')

    }else{
        res.redirect('/login')
    }
    
}

let userPostChangeQuantity =async function(req, res, next) {
     
    if(userSession){
        console.log(req.body);
        // await cart_details.updateOne({userId:userSession,},
        //     {
        //         $set:{}
        //     }
        //     )

        
        res.redirect('/cart')

    }else{
        res.redirect('/login')
    }
    
}

let userPostAddAddress =async function(req, res, next) {
     
    if(userSession){
        // console.log(req.body);
        // await cart_details.updateOne({userId:userSession,},
        //     {
        //         $set:{}
        //     }
        //     )
         let newAddress ={}
         newAddress.userId=req.session.user;
         newAddress.address=req.body

         newAddress.address.id=uuidv4()

         console.log(newAddress.address.id);
      
         let checkAddress = await address_details.findOne({userId:userSession})
         if(checkAddress==null){
            await address_details.insertMany([newAddress])
            console.log("address inserted");
         }else{
            let conv=mongoose.Types.ObjectId(checkAddress._id)
             await address_details.updateOne({userId:req.session.user},{$push:{address:{housename:newAddress.address.housename,postalname:newAddress.address.postalname,pincode:newAddress.address.pincode,district:newAddress.address.district,state:newAddress.address.state,country:newAddress.address.country,id:newAddress.address.id}}})
           console.log("addres pushed"); 
        }         
        
        res.redirect('/editprofile')

    }else{
        res.redirect('/login')
    }
    
}

// let userGetCartParams = async function(req, res, next) {
//     try {

//         if(userSession){
            
//             productParams = req.params.id
//             console.log(productParams);
//             res.redirect('/cart');

//         }else{
//             res.redirect('/login')
//         }
        
//     } catch (error) {
//         console.log(error.message);
//     }
   
    
// }

let userPostCartOperation = async function(req, res, next) {
    

        if(userSession){
            console.log(req.body);
             quantity = req.body.quantity
             size = req.body.size,
             colour = req.body.colour
             
             //store the user id to cart database
             let userCart={}
              Id = await user_details.findOne({username:userSession})
             console.log(Id);
              uss=Id._id.toString()
             
             let checkDb =  await cart_details.findOne({userId:Id._id})
          
             if(checkDb == null){
                
                 userCart.userId=Id._id;
                 
                 userCart.products=[{productId:details,quantity:quantity,colour:colour,size:size}]
                 
                 
                 cart_details.insertMany([userCart])
                 console.log("cart pushed"); 
                 
 
             }else{
                 
                 
                 userCart.productId=[{productId:details}]
                  let eval = await cart_details.findOne({userId:Id._id,"products.productId":userCart.productId})
           
                 await cart_details.updateOne({userId:Id._id},{$push:{products:{productId:details,quantity:quantity,colour:colour,size:size}}})
                 console.log("cart pushed");
             }
             console.log(Id._id);
            
                   

            res.redirect('/cart');

        }else{
            res.redirect('/login')
        }
        

    
    
}

let userPostCheckoutBilling = async function(req, res, next) {
    
    // try {
        
    if(userSession){
       
         let billingDetails = req.body
        
         // userCart.products=[{productId:details,quantity:quantity,colour:colour,size:size}]
         let orders = {products:[]}
         orders.orderedUser=req.body.username
         orders.deliveryAddress={houseName:billingDetails.housename,postalName:billingDetails.postalname,pincode:billingDetails.pincode,district:billingDetails.district,state:billingDetails.state,country:billingDetails.country}
         //need to add total amount
         let totalCash = 0;
         for(var i=0;i<userdone.length;i++){
             totalCash = totalCash + userdone[i].total
         } 
         //  console.log(totalCash);
         orders.billAmount=totalCash;
         orders.orderDate=new Date().toDateString()
    
         let h=new Date()
         orders.deliveryDate= new Date(h.setDate(h.getDate() + 7)).toDateString()
        
         for(var i=0;i<userdone.length;i++){
            orders.products[i]=userdone[i].product
            orders.products[i].quantity=userdone[i].quantity
            orders.products[i].price=userdone[i].total
            orders.products[i].status="Pending"

         }
          
   
         console.log(orders);
         orders.paymentType=req.body.checkout

         if(orders.paymentType=="Pay using razorpay")
         function generateRazorpay(){
            const Razorpay = require('razorpay');
            var instance = new Razorpay({ key_id: 'YOUR_KEY_ID', key_secret: 'YOUR_SECRET' })

            var options = {
            amount: 50000,  // amount in the smallest currency unit
            currency: "INR",
            receipt: "order_rcptid_11"
            };
instance.orders.create(options, function(err, order) {
  console.log(order);
});
         }

         await order_details.insertMany([orders])
      
         
         await cart_details.deleteOne({userId:uss})
         
         console.log("cart deleted");
         res.redirect('/home')
      
    }else{
        

       
    } 

    // } catch (error) {
    //     console.log(error.message);
    // }



}

let userPostEditPassword =async function(req, res, next) {
    if(userSession){
        
        let passwordUpdation = req.body
        let pass = await user_details.findOne({username:userSession})
        let result = await bcrypt.compare(passwordUpdation.previouspassword,pass.password)
        if(result){
            passwordUpdation.newpassword=await bcrypt.hash(passwordUpdation.newpassword,10)
            await user_details.updateOne({username:userSession},{$set:{password:passwordUpdation.newpassword}})
            editPassMsg="password updated successfully"
            
        }else{
             editPassMsg="password doesnt match"
        }
        console.log("hi");

       res.redirect('/editpassword')
      

    }else{

    }


   
    
  
}

let userPostEditProfile = async function(req, res, next) {
    // try {
      if(userSession){
       let userUpdates = req.body
        
    
       let check =  await user_details.findOne({username:userUpdates.username})
         
        if(check == null){
            let checkPhone =  await user_details.findOne({phone:userUpdates.phone})
            if(checkPhone==null){
                console.log(userSession);
                
                await user_details.updateOne({username:userSession},{$set:{name:userUpdates.name,username:userUpdates.username,phone:userUpdates.phone,email:userUpdates.email}})
                req.session.user=userUpdates.username;
                userSession=req.session.user
                res.redirect('/editprofile')
                console.log("success");

            }else{

                editMsg="phone already in use"
                res.redirect('/editprofile')
                console.log("phone failed");
            }  
            
        }else{
            editMsg = "username already present"
            console.log("username failed");
            res.redirect('/editprofile')
        }
                                
       
       
      
      }else{
          res.redirect('/login')
      }
      
    // } catch (error) {
    //   console.log(error.message);
    // }
  }

//////////////////////////////////GET USER LOGIN PAGE///////////////////////


let userGetLogin = function(req, res, next) {
    if(userSession){
        res.redirect('/home')
    }else{
        res.render('user-login',{loginMsg});
        loginMsg=null;
    }
    
}


//////////////////////////////////GET USER SIGNUP PAGE///////////////////////


let userGetSignup =function(req, res, next) {
    if(userSession){
        res.redirect('/home')
    }else{
        res.render('user-signup', {SignupMsg});
    SignupMsg=null
    }
    
}


//////////////////////////////////GET PLEASE ENTER PHONE NUMBER PAGE///////////////////////


let userGetOtpLogin =function(req, res, next) {
   
    if(userSession){
        res.redirect('/home')
    }else{
        res.render('user-otp-request');
    }
        
   
        
    
}

//////////////////////////////////GET USER PRODUCT PARAMS HELPER REQUEST//////////////////////////////////


let userGetProductDetails = async function(req, res, next) {
  try {
    if(userSession){
        details=req.params.id
        console.log(details+"this is the detailssss");
    
    res.redirect('/product-details')
    }else{
        res.redirect('/login')
    }
    
  } catch (error) {
    console.log(error.message);
  }
}

//////////////////////////////////GET A SPECIFIC PRODUCT PAGE///////////////////////


let userGetDetails = async function(req, res, next) {
    try {
        if(userSession){
            console.log(details+"this is the detailsssssssss");
            let value =  await product_details.find({productIndex:details})
        
            let j = value[0].imageReference
            console.log(j);
            let c=value[0].colour
            let s=value[0].size
            // for(var i=0;i<value.colour;i++){
            //     c[i] = value[i].colour
            // }
            // for(var i=0;i<value.size;i++){
            //     s[i] = value[0].size[i]
            // }

            
            console.log(c);
            res.render('user-product-details',{value,j,s,c});
        }else{
           res.redirect('/login')
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

//////////////////////////////////GET PLEASE ENTER OTP PAGE///////////////////////


let userGetOtp =function(req, res, next) {
    if(didLogin==true || didSIgnUp==true){
        
        res.render('user-otp',{otpMsg});
        otpMsg=null;
    }else{

        res.redirect('/signup')
        didLogin=false;
        didSIgnUp=false
        
    }
    res.render('user-otp');
}


//////////////////////////////////GET LANDING PAGE///////////////////////


let userGetHome = async function(req, res, next) {
    if(userSession){
        let products = await product_details.find()
        
        res.render('user-home', {products});
    }else{
        res.redirect('/login')
    }
    
}


//////////////////////////////////GET PRODUTS PAGE///////////////////////



let userGetProducts = async function(req, res, next) {
   try {
            
       if(userSession){
        console.log(filter);
        console.log(categoryRequested);
        let categories = await category_details.find({status:true})
        
        if(categoryRequested=="All Products"||categoryRequested==null){
            if(filter==null){
                let products = await product_details.find({status:true})
                res.render('user-products', {products,categories});
            }else{
    
                let products = await product_details.find({status:true}).sort({price:filter})
                
                res.render('user-products', {products,categories});
                // filter=null
            
        }
    }else{
        
        if(filter==null){
            let products = await product_details.find({category:categoryRequested,status:true})
            res.render('user-products', {products,categories});
        }else{
            let products = await product_details.find({category:categoryRequested,status:true}).sort({price:filter})
            res.render('user-products', {products,categories});
            categories=null
        }
        
    }
       }else{
           res.redirect('/login')
       }           

   } catch (error) {
    console.log(error.message);
   }
    


}



//////////////////////////////////GET REQUESTED PRODUCTS PARAMS HELPER REQUEST///////////////////////



let userGetProductsRequested = function(req, res, next) {
    categoryRequested = req.params.id
  
    res.redirect('/products')
}

let userGetFilter = function(req, res, next) {
    filter = req.params.id
   
    console.log(filter);
    res.redirect('/products')
}

//////////////////////////////////POST SIGNUP DETAILS///////////////////////



let userPostSignup = async function(req, res, next) {
    try {
        didSIgnUp=true
         signupData = {
            username:req.body.username,
            name:req.body.name,
            email:req.body.email,
            phone:req.body.phone,
            password:req.body.password,
        }
     
        const phoneValidator = await user_details.findOne({phone:signupData.phone})
        const usernameValidator = await user_details.findOne({username:signupData.username})

        if(phoneValidator == null){
           
            
            if(usernameValidator == null){

                otpNumber=signupData.phone;
               
                didSIgnUp=true;
               
                console.log("gate1");
                        
                res.redirect(`/otp`)
                
                otpValue = Math.floor(100000 + Math.random() * 900000)

                otp(otpNumber,otpValue);

               

            }else{
             
                SignupMsg="This username is taken"
                console.log(SignupMsg);
                console.log("hii");
                res.redirect('/signup')

            }
            
            
        }else{

            SignupMsg="This phone is already taken";
            
            res.redirect('/signup')
        }


        
    } catch (error) {
        console.log(error.message);
    }
}

//////////////////////////////////POST LOGIN PAGE///////////////////////



let userPostLogin = async function(req, res, next) {
    try {
        loginData = {
            email:req.body.email,
            password:req.body.password
        }
        const documentValidator = await user_details.findOne({email:loginData.email})
      

        if(documentValidator == null){
             
            loginMsg="invalid username and password"
            res.redirect('/login')
            

        }else if(documentValidator.status==false){
            loginMsg="This account has been blocked"
            res.redirect('/login')
        }else{
            
        
            let passwordValidator = await bcrypt.compare(loginData.password,documentValidator.password)
            if(passwordValidator){
                console.log("login success");
                req.session.user=documentValidator.username;
                userSession=req.session.user;
                console.log(req.session.user);
                res.redirect('/home')
            }else{
                loginMsg="invalid password"
                res.redirect('/login')
            }
        }
    
    
    } catch (error) {
        console.log(error.message);
    }
}


//////////////////////////////////POST OTP CHECKING REQUEST///////////////////////


let userPostOtp = async function(req, res, next) {
    try {
        
      

        if(req.body.otp==otpValue){
          
            if(signupData==null){

                if(checkPhone.status==false){
                    loginMsg="This account has been blocked"
                    res.redirect('/login')
                }else{
                    req.session.user=checkPhone.username;
                    userSession=req.session.user
                    console.log(req.session.user);
                    console.log("checkphone.username");
                    res.redirect('/home')
                    console.log("login success");
                }
                

            }else{
                signupData.status=true;
                console.log(otp)

                signupData.password=await bcrypt.hash(signupData.password,10)
                
                const userData =  await user_details.insertMany([signupData]);
                
                
                req.session.user=signupData.username
                userSession=req.session.user
                console.log(req.session.user);
                console.log("signup success");
                res.redirect('/home')
                signupData=null;
            }

           
        }else{
            otpMsg="wrong otp"
            res.redirect('/otp')
        }

    } catch (error) {
        console.log(error.message);
    }

}
    
/////////////////////////////POST  PRODUCTS PAGE///////////////////////


let userPostOtpLogin = async function(req, res, next) {
     didLogin=true;
     let number = req.body.phone;

     otpValue = Math.floor(100000 + Math.random() * 900000)

     console.log(otpValue);
     
      checkPhone = await user_details.findOne({phone:number})
     if(checkPhone==null){
        
        console.log("invalid telephone");
     }else{
        otp(number,otpValue);
     }
     didLogin=true
     res.redirect('/otp')
    
}

let userGetLogout = function (req, res, next) {
  
    req.session.user=null;
    userSession=null;
    res.redirect('/login')
   
  }









module.exports = {
    userGetSignup,
    userGetLogin,
    userGetOtpLogin,
    userGetOtp,
    userGetHome,
    userGetProducts,
    userGetProductsRequested,
    userPostSignup,
    userPostLogin,
    userPostOtp,
    userPostOtpLogin,
    userGetProductDetails,
    userGetDetails,
    userGetFilter,
    userGetLogout,
    userGetProfile,
    userGetEditProfile,
    userGetEditProfilePassword,
    userGetCheckout,
    userGetCart,
    userPostEditProfile,
    // userGetCartParams,
    userPostCartOperation,
    userPostCheckoutBilling,
    userGetOrders,
    userGetDeleteCart,
    userPostEditPassword,
    userGetDeleteOne,
    userPostChangeQuantity,
    userPostAddAddress,
    userGetAddress,
    userGetAddressParams
}

   
   