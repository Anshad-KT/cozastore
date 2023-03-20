let otp = require('../helpers/otp')
const Promise = require('promise')
let ghh
let couponErrorMsg
var mongoose = require('mongoose')
let userOrderParam
const bcrypt = require('bcrypt')
let user_details = require('../models/userModel')
let product_details = require('../models/productModel')
const category_details = require('../models/categoryModel')
const cart_details = require('../models/cartModel')
const order_details = require('../models/orderModel')
const { ExecutionContextContextImpl } = require('twilio/lib/rest/studio/v1/flow/execution/executionContext')
const { reject } = require('promise')
const address_details = require('../models/addressModel')
const banner_details = require('../models/bannerModel')

const { v4: uuidv4 } = require('uuid')
const Razorpay = require('razorpay');
const { log } = require('console')
const { search } = require('../routes')
const coupon_details = require('../models/couponModel')

let payReciept
let orders;
var instance = new Razorpay({
    key_id: 'rzp_test_03pins9a8mVlgN',
    key_secret: 'EAY2f074OyETGQarM9TbZdtW',
});
/////

// let req.session.appliedCoupon
let loginMsg
let SignupMsg;
let otpMsg
let captured
let capturedFilter
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
// let req.session.appliedCoupon


let didSIgnUp = false;
let didLogin = false

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



let userGetProfile = async function (req, res, next) {
    try {

        if (userSession) {
            let userProfile = await user_details.findOne({ username: userSession }).lean()

            let prode = await order_details.aggregate([
                {
                    $match: { orderedUser: userSession }
                },
                {
                    $unwind: '$products'
                },

            ])
            let len = prode.length;
            res.render('user-profile', { name: userProfile.name, username: userProfile.username, phone: userProfile.phone, email: userProfile.email, len })
        } else {
            res.redirect('/login')
        }

    } catch (error) {
        console.log(error.message);
    }


}
let userGetEditProfile = async function (req, res, next) {
    try {
        if (userSession) {

            let userProfile = await user_details.findOne({ username: userSession }).lean()
            let selectedAddress = await address_details.aggregate([

                {
                    $match: {
                        userId: userSession
                    }
                },
                {
                    $unwind: "$address"
                },
                {
                    $match: {
                        "address.id": addressParams
                    }
                }


            ])
            let allAddress = await address_details.findOne({ userId: userSession }).lean()
            console.log(selectedAddress);
            res.render('user-editprofile', { name: userProfile.name, username: userProfile.username, phone: userProfile.phone, email: userProfile.email, editMsg, selectedAddress,allAddress })
            editMsg = null

        } else {
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message);
    }


}
let userGetEditProfilePassword = function (req, res, next) {
    if (userSession) {
        res.render('user-editpassword', { editPassMsg })
        editPassMsg = null;
    } else {
        res.redirect('/login')
    }

}

let userGetCheckout = async function (req, res, next) {
    if (userSession) {
        let userProfile = await user_details.findOne({ username: userSession }).lean()
        console.log(userdone);
        let totalAmount = 0
       
        let length = userdone.length
        let selectedAddress = await address_details.aggregate([
            {
                $match: { userId: userSession }
            },
            {
                $unwind: "$address"
            },
            {
                $match: { "address.id": addressParams }
            },
        ])
        // console.log(addressParams);
        console.log("checkout");
        console.log(selectedAddress);

        res.render('user-checkout', { name: userProfile.name, username: userProfile.username, phone: userProfile.phone, email: userProfile.email, selectedAddress, userdone, ghh })

    } else {
        res.redirect('/login')
    }

}

let userGetCart = async function (req, res, next) {

    Id = await user_details.findOne({ username: userSession })

    uss = Id._id.toString()

    if (userSession) {
        userdone = await cart_details.aggregate(


            [
                {
                    $match: { userId: uss }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {

                        productId: "$products.productId",
                        quantity: "$products.quantity",
                        size: "$products.size",
                        colour: "$products.colour"
                    }
                },
                {
                    $lookup: {
                        from: 'product_details',
                        localField: 'productId',
                        foreignField: 'productIndex',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        productId: 1, quantity: 1, size: 1, colour: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }

            ])



        for (var i = 0; i < userdone.length; i++) {
            userdone[i].total = parseInt(userdone[i].quantity) * parseInt(userdone[i].product.price);
        }
        let amount = 0;
        for (var i = 0; i < userdone.length; i++) {
            amount = amount + userdone[i].total

        }

      let k=0;
      let u=0;

        for (var i = 0; i < userdone.length; i++) {
            if (userdone[i].quantity == 0) {
                userdone[i].product.st = true
                k++;
            } else {
           
                userdone[i].product.st = false
            }
            if (userdone[i].quantity > userdone[i].product.stock) {
               u++;
                userdone[i].product.ot = true
            } else {
              
                userdone[i].product.ot = false
            }
            if(k==0&&u==0){
                userdone[i].product.dt = true
                userdone.bt=true
            }else{
               
                userdone[i].product.dt = false
                userdone.bt=false
               
            }
            



        }

        if(req.session.appliedCoupon){
            
           let repeatCheck = await coupon_details.findOne({code:req.session.appliedCoupon.code,usedUsers:{$eq:userSession}})
           if(repeatCheck==null){
            if(req.session.appliedCoupon.discountType=="percentage"){
                if(parseInt(amount)<parseInt(req.session.appliedCoupon.minPurchase)){
                    console.log(`sorry you need to purchase for minimum ${req.session.appliedCoupon.minPurchase} for this product`);
                    couponErrorMsg=`sorry you need to purchase for minimum ${req.session.appliedCoupon.minPurchase} for this product`
                    req.session.appliedCoupon.validity=false
                }else{
                    const deducted=(parseInt(amount)*parseInt(req.session.appliedCoupon.discountAmount))/100
                    if(parseInt(deducted)>parseInt(req.session.appliedCoupon.maxDiscountAmount)){
                        console.log(`sorry amount greater than ${req.session.appliedCoupon.maxDiscountAmount}`);
                        couponErrorMsg=`sorry amount greater than ${req.session.appliedCoupon.maxDiscountAmount}`
                        req.session.appliedCoupon.validity=false
                    }else{
                        amount=parseInt(amount)-parseInt(deducted)
                       
                        req.session.appliedCoupon.validity=true
                    }
                }
              
                
            }else{
                if(parseInt(amount)<parseInt(req.session.appliedCoupon.minPurchase)){
                    console.log(`sorry you need to purchase for minimum ${req.session.appliedCoupon.minPurchase} for this product`);
                    couponErrorMsg=`sorry you need to purchase for minimum ${req.session.appliedCoupon.minPurchase} for this product`
                    req.session.appliedCoupon.validity=false
                }else{
                    amount = parseInt(amount)-parseInt(req.session.appliedCoupon.discountAmount) 
                    req.session.appliedCoupon.validity=true
                } 
            
               
            }
           }else{

            couponErrorMsg=`this coupon is already used`
           
        }

            
        }
        
         ghh = parseInt(amount)
        
        let appliedCoupon = req.session.appliedCoupon
        

        res.render('user-cart', { userdone, ghh, appliedCoupon ,couponErrorMsg})
        
         appliedCoupon = null
       

    } else {
        res.redirect('/login')
    }




}

let userPostCheckoutBilling = async function (req, res, next) {

    // try {
    console.log("test", req.body);

    if (userSession) {

        let billingDetails = req.body

       let userdone1 = await cart_details.aggregate(


            [
                {
                    $match: { userId: uss }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {

                        productId: "$products.productId",
                        quantity: "$products.quantity",
                        size: "$products.size",
                        colour: "$products.colour"
                    }
                },
                {
                    $lookup: {
                        from: 'product_details',
                        localField: 'productId',
                        foreignField: 'productIndex',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        productId: 1, quantity: 1, size: 1, colour: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }

            ])
            console.log(userdone1);

        // userCart.products=[{productId:details,quantity:quantity,colour:colour,size:size}]
        orders = { products: [] }
        orders.orderedUser = req.body.username
        orders.deliveryAddress = { houseName: billingDetails.housename, postalName: billingDetails.postalname, pincode: billingDetails.pincode, district: billingDetails.district, state: billingDetails.state, country: billingDetails.country }
        //need to add total amount
        let totalCash = 0;
        for (var i = 0; i < userdone1.length; i++) {
            userdone1[i].total = parseInt(userdone1[i].quantity) * parseInt(userdone1[i].product.price);
        }
        for (var i = 0; i < userdone1.length; i++) {
            totalCash = parseInt(totalCash) + parseInt(userdone1[i].total)
            console.log(userdone1[i].total);
        }
          
        if(req.session.appliedCoupon){
            if(req.session.appliedCoupon.discountType=="percentage"){
                const deducted=(parseInt(totalCash)*parseInt(req.session.appliedCoupon.discountAmount))/100
                totalCash=parseInt(totalCash)
                orders.couponDiscount = parseInt(deducted)
                totalCash=parseInt(totalCash)-parseInt(deducted)
            }else{
               parseInt(totalCash) = parseInt(totalCash)-parseInt(req.session.appliedCoupon.discountAmount) 
            }

        }
        console.log(totalCash);
        orders.billAmount=0
        orders.billAmount= parseInt(totalCash);
        console.log(orders.billAmount);
        
       
        orders.orderDate = new Date().toDateString().slice(4);

        let h = new Date()
        orders.deliveryDate = new Date(h.setDate(h.getDate() + 7)).toDateString().slice(4);

        for (var i = 0; i < userdone1.length; i++) {
            orders.products[i] = userdone1[i].product
            orders.products[i].quantity = userdone1[i].quantity
            orders.products[i].price = userdone1[i].total
            orders.products[i].status = "Pending"

        }
        


        orders.paymentType = req.body.checkout
        if(req.session.appliedCoupon){
            orders.couponId = req.session.appliedCoupon.code 
            
             
            req.session.appliedCoupon=null;
        }

        console.log(req.body.checkout);

        if (orders.paymentType == "Pay using razorpay") {
            payReciept = uuidv4()


            var options = {

                amount: totalCash * 100,  
                currency: "INR",
                receipt: payReciept

            };
            instance.orders.create(options, function (err, order) {
                console.log(order);

                res.json(order)
            })


        } else {

            await order_details.insertMany([orders])


            await cart_details.deleteOne({ userId: uss })

            await coupon_details.updateOne({code:orders.couponId},{$push:{usedUsers:userSession}}) 
            console.log("hi");
            res.json({ COD: true })

           

        }



        console.log("cart deleted");
    


    } else {



    }

    // } catch (error) {
    //     console.log(error.message);
    // }



}


let userGetOrders = async function (req, res, next) {
   
    if (userSession) {
        let orders = await order_details.findOne({ orderedUser: userSession }).lean()

        console.log(userOrderParam);
        let resp = await order_details.aggregate([
            
            {
                $match: { _id: userOrderParam }
            },
            
            {
                $unwind: '$products'
            }
        ])

        console.log(resp);

        for (var i = 0; i < resp.length; i++) {
            if (resp[i].products.status == "Cancelled") {
                resp[i].products.red = true;
                resp[i].products.green = false;
                resp[i].products.yellow = false;
            } else if (resp[i].products.status == "Delivered") {
                resp[i].products.green = true;
                resp[i].products.red = false;
                resp[i].products.yellow = false;
            } else if (resp[i].products.status == "Pending") {
                resp[i].products.green = false;
                resp[i].products.red = false;
                resp[i].products.yellow = true;
            }

        }

        for (var j = 0; j < resp.length; j++) {
            resp[j].products.userId = resp[j]._id

        }

        // let userProfile = await user_details.findOne({username:userSession})
        res.render('user-orders', { resp, total: orders.billAmount })

    } else {
        res.redirect('/login')
    }

}

let userGetDeleteCart = async function (req, res, next) {

    if (userSession) {
        let cartIds = req.query
        console.log(cartIds);
       
       let qty = parseInt(cartIds.quantity)
       await cart_details.updateOne({ userId: uss}, { $pull: { products: { productId: cartIds.productId,colour:cartIds.colour,size:cartIds.size,quantity:qty} } })
       
       console.log("deleted cart");


        res.redirect('/cart')
    } else {
        res.redirect('/login')
    }

}


let userGetDeleteOne = async function (req, res, next) {

    if (userSession) {

        let parm = req.query

        console.log(parm.orderId + " " + parm.productIndex);
        
        await order_details.updateOne({ _id: parm.orderId, "products.productIndex": parm.productIndex }, { $set: { "products.$.status": "Cancelled" } })

        res.redirect('/orders')

    } else {
        res.redirect('/login')
    }

}

let userGetAddress = async function (req, res, next) {

    if (userSession) {

        console.log("hii");
        let allAddress = await address_details.aggregate([
            {
                $match: { userId: userSession }
            },
            {
                $unwind: "$address"
            }
        ])
        console.log("all address");
        console.log(allAddress);

        res.render('user-addresslist', { allAddress })

    } else {
        res.redirect('/login')
    }

}


let userGetAddressParams = async function (req, res, next) {

    if (userSession) {


        addressParams = req.params.id
        console.log(addressParams);
        res.redirect('/checkout')

    } else {
        res.redirect('/login')
    }

}
let userGetDeleteAddressParams =  async function (req, res, next) {

    if (userSession) {


       let addressdltParams = req.params.id
       await address_details.updateOne({ userId: userSession } , { $pull: { address: { id:addressdltParams } } })
      
        res.redirect('/editprofile')

    } else {
        res.redirect('/login')
    }

}

let userGetApplyCoupon = async function (req, res, next) {

console.log("hi");

    if (userSession) {
         
        let appliCoupon = req.body
        console.log(req.body);
        const checkDate = await coupon_details.findOne({code:appliCoupon.coupon}).lean()
        console.log(checkDate);
      
        if(checkDate==null){
            console.log("invalid coupon");
            res.redirect('/cart')
        }else{
            let checkValidCoupon =()=>{
                const date =new Date()
                const formattedDate = date.toISOString().slice(0, 10);
                if(formattedDate>checkDate.expiryDate){
                    console.log("coupon expired");
                }else{
                    req.session.appliedCoupon=checkDate
                    
                    res.redirect('/cart')
                }
            }
            checkValidCoupon()
        }
        
       
        

    } else {
        res.redirect('/login')
    }

}

let userGetOrdersList = async function (req, res, next) {

    console.log("hi");
    
        if (userSession) {
             
            
            const checkOrder = await order_details.find({orderedUser:userSession}).lean()
           
            
            res.render('user-orderlist',{checkOrder})
            
           
            
    
        } else {
            res.redirect('/login')
        }
    
    }

let userGetOrderParam = async function (req, res, next) {

   
    
        if (userSession) {
             
            
            userOrderParam=mongoose.Types.ObjectId(req.params.id)
            console.log(userOrderParam);
            res.redirect('/orders')
            
           
            
    
        } else {
            res.redirect('/login')
        }
    
    }

let userPostChangeQuantity = async function (req, res, next) {

    if (userSession) {
        const cart =req.body.cart
        const productId=req.body.product
        let k = req.body.count
        let count = parseInt(k)
        await cart_details.updateOne({ _id: req.body.cart, "products.productId": req.body.product },
            {
                $inc: { 'products.$.quantity': count }
            })

         console.log("quantity changed");
        
         let cartQuantity = await cart_details.findOne({ _id: req.body.cart, "products.productId": req.body.product })
        //  console.log(cartQuantity.products[0].quantity);
       
         const frontQuantity =cartQuantity.products[0].quantity
                  
         res.json({quantity:frontQuantity,cart:cart,productId:productId})

    } else {
        res.redirect('/login')
    }

}

let userPostAddAddress = async function (req, res, next) {

    if (userSession) {
        // console.log(req.body);
        // await cart_details.updateOne({userId:userSession,},
        //     {
        //         $set:{}
        //     }
        //     )
        let newAddress = {}
        newAddress.userId = req.session.user;
        newAddress.address = req.body

        newAddress.address.id = uuidv4()

        console.log(newAddress.address.id);

        let checkAddress = await address_details.findOne({ userId: userSession }).lean()
        if (checkAddress == null) {
            await address_details.insertMany([newAddress])
            console.log("address inserted");
        } else {
            let conv = mongoose.Types.ObjectId(checkAddress._id)
            await address_details.updateOne({ userId: req.session.user }, { $push: { address: { housename: newAddress.address.housename, postalname: newAddress.address.postalname, pincode: newAddress.address.pincode, district: newAddress.address.district, state: newAddress.address.state, country: newAddress.address.country, id: newAddress.address.id } } })
            console.log("addres pushed");
        }

        res.redirect('/editprofile')

    } else {
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

let userPostCartOperation = async function (req, res, next) {


    if (userSession) {
        console.log(req.body);
        quantity = parseInt(req.body.quantity)
        size = req.body.size,
            colour = req.body.colour

        //store the user id to cart database
        let userCart = {}
        Id = await user_details.findOne({ username: userSession }).lean()
        console.log(Id);
        uss = Id._id.toString()

        let checkDb = await cart_details.findOne({ userId: Id._id }).lean()

        if (checkDb == null) {

            userCart.userId = Id._id;

            userCart.products = [{ productId: details, quantity: quantity, colour: colour, size: size }]

            cart_details.insertMany([userCart])
            console.log("cart inserted");


        } else {



            userCart.productId = [{ productId: details }]
            let eval = await cart_details.findOne({ userId: Id._id }).lean()
            console.log("hi");
            let cj=0;
            if(eval.products.length==0){
                await cart_details.updateOne({ userId: Id._id }, { $push: { products: { productId: details, quantity: quantity, colour: colour, size: size } } })
                console.log("cart pushed");
            }else{
                for(var i=0;i<eval.products.length;i++){
                   
                    
                    if (userCart.productId[0].productId == eval.products[i].productId && size == eval.products[i].size && colour == eval.products[i].colour) {
                   console.log(userCart)
                   await cart_details.updateOne({ userId: Id._id , "products.productId": userCart.productId[0].productId },
                       {
                           $inc: { 'products.$.quantity': quantity }
                       })
                       cj++;
                      
               }
            }   
               if(cj==0){
            
              
                await cart_details.updateOne({ userId: Id._id }, { $push: { products: { productId: details, quantity: quantity, colour: colour, size: size } } })
                console.log("cart pushed");
            
               }

               
                   
               
               
            }
       
          
           
           
        }
        console.log(Id._id);



        res.redirect('/cart');

    } else {
        res.redirect('/login')
    }




}




let userPostEditPassword = async function (req, res, next) {
    if (userSession) {

        let passwordUpdation = req.body
        let pass = await user_details.findOne({ username: userSession }).lean()
        let result = await bcrypt.compare(passwordUpdation.previouspassword, pass.password)
        if (result) {
            passwordUpdation.newpassword = await bcrypt.hash(passwordUpdation.newpassword, 10)
            await user_details.updateOne({ username: userSession }, { $set: { password: passwordUpdation.newpassword } })
            editPassMsg = "password updated successfully"

        } else {
            editPassMsg = "password doesnt match"
        }
        console.log("hi");

        res.redirect('/editpassword')


    } else {

    }





}


let userVerifyPayment = async function (req, res, next) {
    if (userSession) {


        console.log(req.body);


        const crypto = require('crypto')
        let hmac = crypto.createHmac('sha256', 'EAY2f074OyETGQarM9TbZdtW')
        hmac.update(req.body['payment[razorpay_order_id]'] + '|' + req.body['payment[razorpay_payment_id]'])
        hmac = hmac.digest('hex')
        if (hmac == req.body['payment[razorpay_signature]']) {
            for (var i = 0; i < userdone.length; i++) {
                orders.products[i].paymentId = req.body['payment[razorpay_payment_id]']
            }
            console.log("done");
            console.log(orders);
            await order_details.insertMany([orders])
            await cart_details.deleteOne({ userId: uss })
            
            res.json({ status: true })
        } else {
            console.log("failed transaction");
        }




        console.log("hi");




    } else {

    }





}


let userPostSearch = async function (req, res, next) {
    if (userSession) {


        let payload = req.body.payload.trim()

        let searchResults = await product_details.find({ title: { $regex: new RegExp('^' + payload + '.*', 'i') } }).exec()
        searchResults = searchResults.slice(0, 10)
        res.send({ payload: searchResults })

    } else {
         
    }





}

let userPostEditProfile = async function (req, res, next) {
    // try {
    if (userSession) {
        let userUpdates = req.body


        let check = await user_details.findOne({ username: userUpdates.username }).lean()

        if (check == null) {
            let checkPhone = await user_details.findOne({ phone: userUpdates.phone }).lean()
            if (checkPhone == null) {
                console.log(userSession);

                await user_details.updateOne({ username: userSession }, { $set: { name: userUpdates.name, username: userUpdates.username, phone: userUpdates.phone, email: userUpdates.email } })
                req.session.user = userUpdates.username;
                userSession = req.session.user
                res.redirect('/editprofile')
                console.log("success");

            } else {

                editMsg = "phone already in use"
                res.redirect('/editprofile')
                console.log("phone failed");
            }

        } else {
            editMsg = "username already present"
            console.log("username failed");
            res.redirect('/editprofile')
        }




    } else {
        res.redirect('/login')
    }

    // } catch (error) {
    //   console.log(error.message);
    // }
}

//////////////////////////////////GET USER LOGIN PAGE///////////////////////


let userGetLogin = function (req, res, next) {
    if (userSession) {
        res.redirect('/home')
    } else {
        res.render('user-login', { loginMsg });
        loginMsg = null;
    }

}


//////////////////////////////////GET USER SIGNUP PAGE///////////////////////


let userGetSignup = function (req, res, next) {
    if (userSession) {
        res.redirect('/home')
    } else {
        res.render('user-signup', { SignupMsg });
        SignupMsg = null
    }

}


//////////////////////////////////GET PLEASE ENTER PHONE NUMBER PAGE///////////////////////


let userGetOtpLogin = function (req, res, next) {

    if (userSession) {
        res.redirect('/home')
    } else {
        res.render('user-otp-request');
    }




}

//////////////////////////////////GET USER PRODUCT PARAMS HELPER REQUEST//////////////////////////////////


let userGetProductDetails = async function (req, res, next) {
    try {
        if (userSession) {
            details = req.params.id
            console.log(details + "this is the detailssss");

            res.redirect('/product-details')
        } else {
            res.redirect('/login')
        }

    } catch (error) {
        console.log(error.message);
    }
}

//////////////////////////////////GET A SPECIFIC PRODUCT PAGE///////////////////////


let userGetDetails = async function (req, res, next) {
    try {
        if (userSession) {
            console.log(details + "this is the detailsssssssss");
            let value = await product_details.find({ productIndex: details }).lean()

            let j = value[0].imageReference
            console.log(j);
            let c = value[0].colour
            let s = value[0].size
            console.log(details);

            
            let checkW = await user_details.findOne({username:userSession,wishlist:{$in:details}}).lean()
            let checkWish;
            if(checkW==null){
                checkWish=true
            }else{
                checkWish=false
            }  
            res.render('user-product-details', { value, j, s, c, checkWish });
        } else {
            res.redirect('/login')
        }

    } catch (error) {
        console.log(error.message);
    }
}

//////////////////////////////////GET PLEASE ENTER OTP PAGE///////////////////////


let userGetOtp = function (req, res, next) {
    if (didLogin == true || didSIgnUp == true) {

        res.render('user-otp', { otpMsg });
        otpMsg = null;
    } else {

        res.redirect('/signup')
        didLogin = false;
        didSIgnUp = false

    }
    res.render('user-otp');
}


//////////////////////////////////GET LANDING PAGE///////////////////////


let userGetHome = async function (req, res, next) {
    if (userSession) {
        let products = await product_details.find().lean()
        let banners = await banner_details.find().lean()

        res.render('user-home', { products , banners});
    } else {
        res.redirect('/login')
    }

}


//////////////////////////////////GET PRODUTS PAGE///////////////////////



let userGetProducts = async function (req, res, next) {


    if (userSession) {

        let categories = await category_details.find({ status: true }).lean()

        if (categoryRequested == "All Products" || categoryRequested == null) {

            if (captured == null && capturedFilter == null) {
                let products = await product_details.find({ status: true }).lean()
                res.render('user-products', { products, categories });

                console.log("gate1");

            } else if (capturedFilter == null && captured != null) {
                console.log("gate2");
                let field = captured.filtertype
                let value = parseInt(captured.filter)
                console.log(value);
                if (field == "price") {
                    let products = await product_details.find({ status: true }).sort({ price: value }).lean()
                    res.render('user-products', { products, categories });
                } else if (field == "_id") {
                    let products = await product_details.find({ status: true }).sort({ _id: value }).lean()
                    res.render('user-products', { products, categories });
                }
                field = null
                value = null



            } else if (capturedFilter != null && captured == null) {
                console.log("gate 3");
                let startingprice = parseInt(capturedFilter.pricestarting);
                let endingprice = parseInt(capturedFilter.priceending);
                log(startingprice + " " + endingprice)
                let products = await product_details.find({ status: true, price: { $gt: startingprice, $lt: endingprice } }).lean()
                console.log(products);
                let checkW1 = await user_details.findOne({username:userSession,wishlist:{$in:details}}).lean()
                let wish;
                if(checkW1==null){
                    wish=true
                }else{
                    wish=false
                }  
                res.render('user-products', { products, categories,wish });
                startingprice = null
                endingprice = null
            } else if (capturedFilter != null && captured == null) {
                console.log("gate 4");
                let field1 = captured.filtertype
                let value1 = parseInt(captured.filter)
                if (field1 == "price") {
                    let products = await product_details.find({ status: true, price: { $gt: startingprice, $lt: endingprice } }).sort({ price: value1 }).lean()
                    let checkW1 = await user_details.findOne({username:userSession,wishlist:{$in:details}}).lean()
                    let wish;
                    if(checkW1==null){
                        wish=true
                    }else{
                        wish=false
                    }  
                    res.render('user-products', { products, categories,wish });
                } else if (field1 == "_id") {
                    let products = await product_details.find({ status: true, price: { $gt: startingprice, $lt: endingprice } }).sort({ _id: value1 }).lean()
                    let checkW1 = await user_details.findOne({username:userSession,wishlist:{$in:details}}).lean()
                    let wish;
                    if(checkW1==null){
                        wish=true
                    }else{
                        wish=false
                    }  
                    res.render('user-products', { products, categories,wish });
                }
                field1 = null
                value1 = null
            }else if (capturedFilter != null && captured != null) {
                console.log("gate 9");
                let startingprice = capturedFilter.pricestarting;
                let endingprice = capturedFilter.priceending;

                let field1 = captured.filtertype
                let value1 = parseInt(captured.filter)
                if (field1 == "price") {
                    let products = await product_details.find({ status: true, price: { $gt: startingprice, $lt: endingprice } }).sort({ price: value1 }).lean()
                    let checkW1 = await user_details.findOne({username:userSession,wishlist:{$in:details}}).lean()
                    let wish;
                    if(checkW1==null){
                        wish=true
                    }else{
                        wish=false
                    }  
                    res.render('user-products', { products, categories,wish });
                } else if (field1 == "_id") {
                    let products = await product_details.find({ status: true, price: { $gt: startingprice, $lt: endingprice } }).sort({ _id: value1 }).lean()
                    let checkW1 = await user_details.findOne({username:userSession,wishlist:{$in:details}}).lean()
                    let wish;
                    if(checkW1==null){
                        wish=true
                    }else{
                        wish=false
                    }  
                    res.render('user-products', { products, categories,wish });
                    console.log(wish);
                }

            }
        } else {
            console.log(categoryRequested);

            if (captured == null && capturedFilter == null) {
                console.log("gate 5");
                let products = await product_details.find({ category: categoryRequested, status: true }).lean()
                let checkW1 = await user_details.findOne({username:userSession,wishlist:{$in:details}}).lean()
                let wish;
                if(checkW1==null){
                    wish=true
                }else{
                    wish=false
                }  
                res.render('user-products', { products, categories,wish });
                console.log(products);

            } else if (captured != null && capturedFilter == null) {
                console.log("gate 6");
                let field1 = captured.filtertype
                let value1 = parseInt(captured.filter)
                if (field1 == "price") {
                    let products = await product_details.find({ category: categoryRequested, status: true }).sort({ price: value1 }).lean()
                    let checkW1 = await user_details.findOne({username:userSession,wishlist:{$in:details}}).lean()
                let wish;
                if(checkW1==null){
                    wish=true
                }else{
                    wish=false
                }  
                    res.render('user-products', { products, categories,wish });
                } else if (field1 == "_id") {
                    let products = await product_details.find({ category: categoryRequested, status: true }).sort({ _id: value1 }).lean()
                    let checkW1 = await user_details.findOne({username:userSession,wishlist:{$in:details}}).lean()
                    let wish;
                    if(checkW1==null){
                        wish=true
                    }else{
                        wish=false
                    }  
                    res.render('user-products', { products, categories,wish });
                }
                field1 = null
                value1 = null
                categories = null

            } else if (captured == null && capturedFilter != null) {
                console.log("gate 7");
                let startingprice = capturedFilter.pricestarting;
                let endingprice = capturedFilter.priceending;
                let products = await product_details.find({ status: true, price: { $gt: startingprice, $lt: endingprice } }).lean()
                console.log(products);
                let checkW1 = await user_details.findOne({username:userSession,wishlist:{$in:details}}).lean()
                let wish;
                if(checkW1==null){
                    wish=true
                }else{
                    wish=false
                }  
                res.render('user-products', { products, categories,wish });
            } else if (captured != null && capturedFilter != null) {
                console.log("gate 8");
                let startingprice = capturedFilter.pricestarting;
                let endingprice = capturedFilter.priceending;

                let field1 = captured.filtertype
                let value1 = parseInt(captured.filter)
                if (field1 == "price") {
                    let products = await product_details.find({ category: categoryRequested, status: true, price: { $gt: startingprice, $lt: endingprice } }).sort({ price: value1 }).lean()
                    let checkW1 = await user_details.findOne({username:userSession,wishlist:{$in:details}}).lean()
                    let wish;
                    if(checkW1==null){
                        wish=true
                    }else{
                        wish=false
                    }  
                    res.render('user-products', { products, categories,wish });
                } else if (field1 == "_id") {
                    let products = await product_details.find({ category: categoryRequested, status: true, price: { $gt: startingprice, $lt: endingprice } }).sort({ _id: value1 }).lean()
                    let checkW1 = await user_details.findOne({username:userSession,wishlist:{$in:details}}).lean()
                    let wish;
                    if(checkW1==null){
                        wish=true
                    }else{
                        wish=false
                    }  
                    res.render('user-products', { products, categories,wish });
                    console.log(wish);
                }

            }

        }
    } else {
        res.redirect('/login')
    }




}



//////////////////////////////////GET REQUESTED PRODUCTS PARAMS HELPER REQUEST///////////////////////



let userGetProductsRequested = function (req, res, next) {
    categoryRequested = req.params.id

    res.redirect('/products')
}

let userGetFilter = function (req, res, next) {
    captured = req.query


    console.log(captured);
    res.redirect('/products')
}

let userGetFilterPrice = function (req, res, next) {
    if (userSession) {
        capturedFilter = req.query
        console.log(capturedFilter);
        res.redirect('/products')
    } else {

    }





}

let userPostAddWishlist = async function (req, res, next) {
    if (userSession) {
       let wishlistCheck = await user_details.findOne({username:userSession,wishlist: { $exists: true} } ).lean()

       console.log(wishlistCheck);
       await user_details.updateOne({username:userSession},{$push:{wishlist:req.body.productIndex} } )
        console.log("success");
        
    } else {
       
    }





}

let userGetWishlist = async function (req, res, next) {
    if (userSession) {
       let userwishlist = await user_details.aggregate(


            [
                
                {
                    $unwind: '$wishlist'
                },
                
                {
                    $lookup: {
                        from: 'product_details',
                        localField: 'wishlist',
                        foreignField: 'productIndex',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        product: { $arrayElemAt: ['$product', 0] }
                    }
                }

            ])
            console.log(userwishlist);
            res.render("user-wishlist",{userwishlist})
        
    } else {
       
    }





}

let userPostDeleteWishlist =  async function (req, res, next) {
    if (userSession) {
       let wishlistCheck = await user_details.findOne({username:userSession,wishlist: { $exists: true} } ).lean()

       console.log(wishlistCheck);
        await user_details.updateOne({username:userSession},{$pull:{wishlist:req.body.productIndex} } )
        console.log("remove");
        
    } else {
       
    }





}
//////////////////////////////////POST SIGNUP DETAILS///////////////////////



let userPostSignup = async function (req, res, next) {
    try {
        didSIgnUp = true
        signupData = {
            username: req.body.username,
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            password: req.body.password,
        }

        const phoneValidator = await user_details.findOne({ phone: signupData.phone }).lean()
        const usernameValidator = await user_details.findOne({ username: signupData.username }).lean()

        if (phoneValidator == null) {


            if (usernameValidator == null) {

                otpNumber = signupData.phone;

                didSIgnUp = true;

                console.log("gate1");

                res.redirect(`/otp`)

                otpValue = Math.floor(100000 + Math.random() * 900000)

                otp(otpNumber, otpValue);



            } else {

                SignupMsg = "This username is taken"
                console.log(SignupMsg);
                console.log("hii");
                res.redirect('/signup')

            }


        } else {

            SignupMsg = "This phone is already taken";

            res.redirect('/signup')
        }



    } catch (error) {
        console.log(error.message);
    }
}

//////////////////////////////////POST LOGIN PAGE///////////////////////



let userPostLogin = async function (req, res, next) {
    // try {
        loginData = {
            email: req.body.email,
            password: req.body.password
        }
        const documentValidator = await user_details.findOne({ email: loginData.email }).lean()


        if (documentValidator == null) {

            loginMsg = "invalid username and password"
            res.redirect('/login')


        } else if (documentValidator.status == false) {
            loginMsg = "This account has been blocked"
            res.redirect('/login')
        } else {


            let passwordValidator = await bcrypt.compare(loginData.password, documentValidator.password)
            if (passwordValidator) {
                console.log("login success");
                req.session.user = documentValidator.username;
                req.session.variable="33";
                console.log(req.session);
                userSession = req.session.user;
                console.log(req.session.user);
                res.redirect('/home')
            } else {
                loginMsg = "invalid password"
                res.redirect('/login')
            }
        }


    // } catch (error) {
    //     console.log(error.message);
    // }
}


//////////////////////////////////POST OTP CHECKING REQUEST///////////////////////


let userPostOtp = async function (req, res, next) {
    try {



        if (req.body.otp == otpValue) {

            if (signupData == null) {

                if (checkPhone.status == false) {
                    loginMsg = "This account has been blocked"
                    res.redirect('/login')
                } else {
                    req.session.user = checkPhone.username;
                    userSession = req.session.user
                    console.log(req.session.user);
                    console.log("checkphone.username");
                    res.redirect('/home')
                    console.log("login success");
                }


            } else {
                signupData.status = true;
                console.log(otp)

                signupData.password = await bcrypt.hash(signupData.password, 10)

                const userData = await user_details.insertMany([signupData]);


                req.session.user = signupData.username
                userSession = req.session.user
                console.log(req.session.user);
                console.log("signup success");
                res.redirect('/home')
                signupData = null;
            }


        } else {
            otpMsg = "wrong otp"
            res.redirect('/otp')
        }

    } catch (error) {
        console.log(error.message);
    }

}

/////////////////////////////POST  PRODUCTS PAGE///////////////////////


let userPostOtpLogin = async function (req, res, next) {
    didLogin = true;
    let number = req.body.phone;

    otpValue = Math.floor(100000 + Math.random() * 900000)

    console.log(otpValue);

    checkPhone = await user_details.findOne({ phone: number }).lean()
    if (checkPhone == null) {

        console.log("invalid telephone");
    } else {
        otp(number, otpValue);
    }
    didLogin = true
    res.redirect('/otp')

}



let userGetLogout = function (req, res, next) {

    req.session.user = null;
    req.session.appliedCoupon = null
        //   payReciept
        //   orders;
        //   loginMsg
        //   SignupMsg;
        //   otpMsg
        //   captured
        //   capturedFilter
        //   checkPhone;
        
        //   editMsg
        //   productParams
        //   colour
        //   quantity
        //   size
        //   uss
        //   Id
        //   editPassMsg
        //   req.session.appliedCoupon
        //   otpNumber;
        //   signupData;
        //   loginData;
        //   loginOtpData
        //   otpValue
        //   categoryRequested
        //   details;
        //   userdone
        //   addressParams

    
    userSession = null;
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
    userPostCartOperation,
    userPostCheckoutBilling,
    userGetOrders,
    userGetDeleteCart,
    userPostEditPassword,
    userGetDeleteOne,
    userPostChangeQuantity,
    userPostAddAddress,
    userGetAddress,
    userGetAddressParams,
    userVerifyPayment,
    userPostSearch,
    userGetFilterPrice,
    userPostAddWishlist,
    userGetWishlist,
    userPostDeleteWishlist,
    userGetDeleteAddressParams,
    userGetApplyCoupon,
    userGetOrdersList,
    userGetOrderParam
}



