let otp = require("../helpers/otp");
const Promise = require("promise");
// let ghh;
require('dotenv').config()
let couponErrorMsg;
let defaultAddress;
var mongoose = require("mongoose");
let userOrderParam;
const bcrypt = require("bcrypt");
let user_details = require("../models/userModel");
let product_details = require("../models/productModel");
const category_details = require("../models/categoryModel");
let otpData
const cart_details = require("../models/cartModel");
let walletMsg
const {ObjectId}=require('mongodb')
const order_details = require("../models/orderModel");
const {
  ExecutionContextContextImpl,
} = require("twilio/lib/rest/studio/v1/flow/execution/executionContext");
const { reject } = require("promise");
const address_details = require("../models/addressModel");
const banner_details = require("../models/bannerModel");

const { v4: uuidv4 } = require("uuid");
const Razorpay = require("razorpay");
const { log, Console } = require("console");
const { search } = require("../routes");
const coupon_details = require("../models/couponModel");
const {
  DependentHostedNumberOrderListInstance,
} = require("twilio/lib/rest/preview/hosted_numbers/authorizationDocument/dependentHostedNumberOrder");
const session = require("express-session");
const { triggerAsyncId } = require("async_hooks");
const { unwatchFile } = require("fs");

var instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
});
/////
// 82TDrxxV3gszhAK

let loginMsg;
let SignupMsg;
let otpMsg;

// let userSession;
let editMsg;
let editPMsg

let uss;

let editPassMsg;

let didSIgnUp = false;
let didLogin = false;

// let userOtpname

let otpNumber;
let signupData;
let loginData;
// let loginOtpData
let otpValue;

// let req.session.details;

let userGetEditProfile = async function (req, res, next) {
  try {
    let userProfile = await user_details
      .findOne({ username: req.session.user })
      .lean();
    let selectedAddress = await address_details.aggregate([
      {
        $match: {
          userId: req.session.user,
        },
      },
      {
        $unwind: "$address",
      },
      {
        $match: {
          "address.id": req.session.addressParams,
        },
      },
    ]);
    let allAddress = await address_details
      .findOne({ userId: req.session.user })
      .lean();
    console.log(userProfile);
    console.log("hii");
    console.log(selectedAddress);
    res.render("user-profile1", {
      name: userProfile.name,
      username: userProfile.username,
      phone: userProfile.phone,
      email: userProfile.email,
      wallet:userProfile.wallet,
      editMsg,
      editPMsg,
      selectedAddress,
      allAddress,
      editPassMsg
    });
    editMsg = null;
    editPMsg=null
    editPassMsg=null
  } catch (error) {
    console.log(error.message);
    next()
  }
};
let userGetEditProfilePassword = function (req, res, next) {
    try {
        res.render("user-editpassword", { editPassMsg });
  editPassMsg = null;
    } catch (error) {
      console.log(error.message);
      next()
    }
  
};

let userPostAddDefaultAddress = async (req, res, next) => {
  defaultAddress = req.params.id;
  console.log(defaultAddress);

  await address_details.updateOne(
    { userId: req.session.user },
    { $set: { defaultAddress: defaultAddress } }
  );

  res.redirect("/editprofile");
};

let userGetCheckout = async function (req, res, next) {
  try {
    let userProfile = await user_details
    .findOne({ username: req.session.user })
    .lean();
  console.log(req.session.addressParams);
  let totalAmount = 0;

  let length = req.session.userdone.length;
  const userCheck = await user_details.findOne({username:req.session.user})
  // console.log(userCheck);
  const checkDouble = await cart_details.findOne({userId:userCheck._id})
  // console.log(checkDouble)
  console.log("unicorn");
 const addressCheck = await address_details.aggregate([
  {
    $match: { userId: req.session.user },
  },
  {
    $unwind: "$address",
  },
])
  if(addressCheck.length>0){
    let selectedAddress = await address_details.aggregate([
      {
        $match: { userId: req.session.user },
      },
      {
        $unwind: "$address",
      },
      {
        $match: { "address.id": req.session.addressParams },
      },
    ]);
    console.log(selectedAddress.length);
    if (selectedAddress.length == 0) {
      let add = await address_details.findOne({ userId: req.session.user });
      // console.log(add);
  
      let def = add.defaultAddress;
      let selectedAddress = await address_details.aggregate([
        {
          $match: { userId: req.session.user },
        },
        {
          $unwind: "$address",
        },
        {
          $match: { "address.id": def },
        },
      ]);
      console.log(selectedAddress);
      console.log("gate 2");
      const dbC = await user_details.findOne({username:req.session.user})
      console.log(dbC);
      dbC._id.toString();
      let userdone = await cart_details.aggregate([
        {
          $match: { userId:  dbC._id.toString()},
        },
        {
          $unwind: "$products",
        },
        {
          $project: {
            productId: "$products.productId",
            quantity: "$products.quantity",
            size: "$products.size",
            colour: "$products.colour",
          },
        },
        
         
        {
          $lookup: {
            from: "product_details",
            localField: "productId",
            foreignField: "productIndex",
            as: "product",
          },
        },
        {
          $project: {
            productId: 1,
            quantity: 1,
            size: 1,
            colour: 1,
            product: { $arrayElemAt: ["$product", 0] },
          },
        },
        
       
      ]);
      res.render("user-checkout", {
        name: userProfile.name,
        username: userProfile.username,
        phone: userProfile.phone,
        email: userProfile.email,
        selectedAddress,
        userdone,
        ghh: req.session.ghh,
        walletMsg,
        checkDouble
      });
      console.log(userdone);
      userdone = null;
      walletMsg=null
    } else {
      let selectedAddress = await address_details.aggregate([
        {
          $match: { userId: req.session.user },
        },
        {
          $unwind: "$address",
        },
        {
          $match: { "address.id": req.session.addressParams },
        },
      ]);
      console.log(selectedAddress);
      console.log("gate 3");
      const dbC = await user_details.findOne({username:req.session.user})
      let userdone =  await cart_details.aggregate([
        {
          $match: { userId:  dbC._id.toString()},
        },
        {
          $unwind: "$products",
        },
        {
          $project: {
            productId: "$products.productId",
            quantity: "$products.quantity",
            size: "$products.size",
            colour: "$products.colour",
          },
        },
        
         
        {
          $lookup: {
            from: "product_details",
            localField: "productId",
            foreignField: "productIndex",
            as: "product",
          },
        },
        {
          $project: {
            productId: 1,
            quantity: 1,
            size: 1,
            colour: 1,
            product: { $arrayElemAt: ["$product", 0] },
          },
        },
        
       
      ]);
      res.render("user-checkout", {
        name: userProfile.name,
        username: userProfile.username,
        phone: userProfile.phone,
        email: userProfile.email,
        selectedAddress,
        userdone,
        ghh: req.session.ghh,
        walletMsg,
        checkDouble
      });
      console.log(userdone);
      userdone = null;
      walletMsg=null
    }
  }else{
    let userdone = await cart_details.aggregate([
      {
        $match: { userId:  dbC._id.toString()},
      },
      {
        $unwind: "$products",
      },
      {
        $project: {
          productId: "$products.productId",
          quantity: "$products.quantity",
          size: "$products.size",
          colour: "$products.colour",
        },
      },
      
       
      {
        $lookup: {
          from: "product_details",
          localField: "productId",
          foreignField: "productIndex",
          as: "product",
        },
      },
      {
        $project: {
          productId: 1,
          quantity: 1,
          size: 1,
          colour: 1,
          product: { $arrayElemAt: ["$product", 0] },
        },
      },
      
     
    ]);
    res.render("user-checkout", {
      name: userProfile.name,
      username: userProfile.username,
      phone: userProfile.phone,
      email: userProfile.email,
      // selectedAddress,
      userdone,
      ghh: req.session.ghh,
      walletMsg,
      checkDouble
    });
    console.log(userdone);
    userdone = null;
    walletMsg=null
  }


  } catch (error) {
    console.log(error.message);
    next()
  }
  
  
};

let userGetCart = async function (req, res, next) {
  try {
      req.session.Id = await user_details.findOne({ username: req.session.user });

  uss = req.session.Id._id.toString();

  req.session.userdone = await cart_details.aggregate([
    {
      $match: { userId: uss },
    },
    {
      $unwind: "$products",
    },
    {
      $project: {
        productId: "$products.productId",
        quantity: "$products.quantity",
        size: "$products.size",
        colour: "$products.colour",
      },
    },
    {
      $lookup: {
        from: "product_details",
        localField: "productId",
        foreignField: "productIndex",
        as: "product",
      },
    },
    {
      $project: {
        productId: 1,
        quantity: 1,
        size: 1,
        colour: 1,
        product: { $arrayElemAt: ["$product", 0] },
      },
    },
  ]);

  for (var i = 0; i < req.session.userdone.length; i++) {
    req.session.userdone[i].total =
      parseInt(req.session.userdone[i].quantity) *
      parseInt(req.session.userdone[i].product.price);
  }
  let amount = 0;
  for (var i = 0; i < req.session.userdone.length; i++) {
    amount = amount + req.session.userdone[i].total;
  }

  let k = 0;
  let u = 0;

  for (var i = 0; i < req.session.userdone.length; i++) {
    if (req.session.userdone[i].quantity == 0) {
      req.session.userdone[i].product.st = true;
      k++;
    } else {
      req.session.userdone[i].product.st = false;
    }
    if (
      req.session.userdone[i].quantity > req.session.userdone[i].product.stock
    ) {
      u++;
      req.session.userdone[i].product.ot = true;
    } else {
      req.session.userdone[i].product.ot = false;
    }
    if (k == 0 && u == 0) {
      req.session.userdone[i].product.dt = true;
      req.session.userdone.bt = true;
    } else {
      req.session.userdone[i].product.dt = false;
      req.session.userdone.bt = false;
    }
  }

  if (req.session.appliedCoupon) {
    let repeatCheck = await coupon_details.findOne({
      code: req.session.appliedCoupon.code,
      usedUsers: { $eq: req.session.user },
    });
    if (repeatCheck == null) {
      if (req.session.appliedCoupon.discountType == "percentage") {
        if (
          parseInt(amount) < parseInt(req.session.appliedCoupon.minPurchase)
        ) {
          console.log(
            `sorry you need to purchase for minimum ${req.session.appliedCoupon.minPurchase} for this product`
          );
          couponErrorMsg = `sorry you need to purchase for minimum ${req.session.appliedCoupon.minPurchase} for this product`;
          req.session.appliedCoupon.validity = false;
        } else {
          req.session.deducted =
            (parseInt(amount) *
              parseInt(req.session.appliedCoupon.discountAmount)) /
            100;
          if (
            parseInt(req.session.deducted) >
            parseInt(req.session.appliedCoupon.maxDiscountAmount)
          ) {
            console.log(
              `sorry amount greater than ${req.session.appliedCoupon.maxDiscountAmount}`
            );
            couponErrorMsg = `sorry amount greater than ${req.session.appliedCoupon.maxDiscountAmount}`;
            req.session.appliedCoupon.validity = false;
          } else {
            amount = parseInt(amount) - parseInt(req.session.deducted);

            req.session.appliedCoupon.validity = true;
          }
        }
      } else {
        if (
          parseInt(amount) < parseInt(req.session.appliedCoupon.minPurchase)
        ) {
          console.log(
            `sorry you need to purchase for minimum ${req.session.appliedCoupon.minPurchase} for this product`
          );
          couponErrorMsg = `sorry you need to purchase for minimum ${req.session.appliedCoupon.minPurchase} for this product`;
          req.session.appliedCoupon.validity = false;
        } else {
          amount =
            parseInt(amount) -
            parseInt(req.session.appliedCoupon.discountAmount);
          req.session.appliedCoupon.validity = true;
        }
      }
    } else {
      couponErrorMsg = `this coupon is already used`;
    }
  }

  req.session.ghh = parseInt(amount);

  let appliedCoupon = req.session.appliedCoupon;

  let userdone = req.session.userdone;
  const dbWallet = await user_details.findOne({username:req.session.user})
  res.render("user-cart", { userdone, ghh:req.session.ghh, appliedCoupon, couponErrorMsg , dbWallet:dbWallet.wallet });

  appliedCoupon = null;
  userdone = null;
  } catch (error) {
    console.log(error.message);
    next()
  }

};

let userPostCheckoutBilling = async function (req, res, next) {
   try {
  console.log("test", req.body);

  let billingDetails = req.body;

  let userdone1 = await cart_details.aggregate([
    {
      $match: { userId: uss },
    },
    {
      $unwind: "$products",
    },
    {
      $project: {
        productId: "$products.productId",
        quantity: "$products.quantity",
        size: "$products.size",
        colour: "$products.colour",
      },
    },
    {
      $lookup: {
        from: "product_details",
        localField: "productId",
        foreignField: "productIndex",
        as: "product",
      },
    },
    {
      $project: {
        productId: 1,
        quantity: 1,
        size: 1,
        colour: 1,
        product: { $arrayElemAt: ["$product", 0] },
      },
    },
  ]);
  // console.log(userdone1);

  req.session.orders = { products: [] };
  req.session.orders.orderedUser = req.body.username;
  req.session.orders.deliveryAddress = {
    houseName: billingDetails.housename,
    postalName: billingDetails.postalname,
    pincode: billingDetails.pincode,
    district: billingDetails.district,
    state: billingDetails.state,
    country: billingDetails.country,
  };
  //need to add total amount
  let totalCash = 0;
  for (var i = 0; i < userdone1.length; i++) {
    userdone1[i].total =
      parseInt(userdone1[i].quantity) * parseInt(userdone1[i].product.price);
  }
  for (var i = 0; i < userdone1.length; i++) {
    totalCash = parseInt(totalCash) + parseInt(userdone1[i].total);
    // console.log(userdone1[i].total);
  }

  if (req.session.appliedCoupon) {
    if (req.session.appliedCoupon.discountType == "percentage") {
      req.session.deducted =
        (parseInt(totalCash) *
          parseInt(req.session.appliedCoupon.discountAmount)) /
        100;
      totalCash = parseInt(totalCash);
      req.session.orders.couponDiscount = parseInt(req.session.deducted);
      totalCash = parseInt(totalCash) - parseInt(req.session.deducted);
    } else {
      totalCash =
        parseInt(totalCash) -
        parseInt(req.session.appliedCoupon.discountAmount);
    }
  }
  console.log(totalCash);
  req.session.orders.billAmount = 0;
  req.session.orders.billAmount = parseInt(totalCash);
  console.log(req.session.orders.billAmount);

  req.session.orders.orderDate = new Date().toDateString().slice(4);

  let h = new Date();
  req.session.orders.deliveryDate = new Date(h.setDate(h.getDate() + 7))
    .toDateString()
    .slice(4);

  for (var i = 0; i < userdone1.length; i++) {
    req.session.orders.products[i] = userdone1[i].product;
    req.session.orders.products[i].quantity = userdone1[i].quantity;
    req.session.orders.products[i].price = userdone1[i].total;
    req.session.orders.products[i].status = "Pending";
  }

  req.session.orders.paymentType = req.body.checkout;
  if (req.session.appliedCoupon) {
    req.session.orders.couponId = req.session.appliedCoupon.code;
    req.session.orders.discountAmount = req.session.deducted;
    req.session.appliedCoupon = null;
  }

  console.log(req.body.checkout);

  if (req.session.orders.paymentType == "Pay using razorpay") {
    req.session.payReciept = uuidv4();

    var options = {
      amount: totalCash * 100,
      currency: "INR",
      receipt: req.session.payReciept,
    };
    instance.orders.create(options, function (err, order) {
      console.log(order);

      res.json(order);
    });
  } else if (req.session.orders.paymentType == "wallet") {
    const walletCheck = await user_details.findOne({
      username: req.session.user,
    });
    // console.log(walletCheck);
    console.log("yassar");
    if ((req.session.orders.billAmount < walletCheck.wallet)) {
      const hijack = await user_details.findOne({ username: req.session.user });
      const uss = hijack._id.toString();
      for (var i = 0; i < req.session.userdone.length; i++) {
        req.session.orders.products[i].paymentId =
          uuidv4()
          console.log(req.session.orders.products[i].paymentId)
      }
      
      console.log("yassqar");
      await order_details.insertMany([req.session.orders]);

      await user_details.updateOne({username:req.session.user},{$inc:{wallet:"-"+req.session.orders.billAmount}})

      await coupon_details.updateOne(
        { code: req.session.orders.couponId },
        { $push: { usedUsers: req.session.user } }
      );

      await cart_details.deleteOne({ userId: uss });
    
      res.json({ WALLET: true });
    }else{
      console.log("Sorry you dont have enough money on your wallet")
      walletMsg="Sorry you dont have enough money on your wallet";
      res.redirect('/checkout')

    }
  } else {
    const hijack = await user_details.findOne({ username: req.session.user });
    const uss = hijack._id.toString();
    await order_details.insertMany([req.session.orders]);

    // await product_details.updateOne({ productIndex: statusName.productIndex }, { $inc: { stock: "-" + stockChanges.products[0].quantity } })

    await coupon_details.updateOne(
      { code: req.session.orders.couponId },
      { $push: { usedUsers: req.session.user } }
    );

    await cart_details.deleteOne({ userId: uss });
    res.json({ COD: true });
  }

  

  } catch (error) {
    console.log(error.message);
    next()
  }
};

let userGetOrders = async function (req, res, next) {
  try {
    req.session.orders = await order_details
    .findOne({ orderedUser: req.session.user })
    .lean();

  console.log(userOrderParam);
  let resp = await order_details.aggregate([
    {
      $match: { _id: userOrderParam },
    },

    {
      $unwind: "$products",
    },
  ]);

  const currentDate = new Date();
  currentDate;

  for (var j = 0; j < resp.length; j++) {
    resp[j].products.userId = resp[j]._id;
    if (resp[j].products.status == "Delivered") {
      resp[j].products.crdate = currentDate;
      const newD = resp[j].products.salesDate;
      newD.setDate(currentDate.getDate() + 7);
      resp[j].products.drdate = currentDate;
    }
  }
  console.log("kdinidj");
  console.log(resp);
  res.render("user-orders", { resp, total: req.session.orders.billAmount });
  } catch (error) {
    console.log(error.message);
    next()
  }
  
};

let userGetDeleteCart = async function (req, res, next) {
  try {
     let cartIds = req.query;
  console.log(cartIds);
  console.log("manjadi");

  let qty = parseInt(cartIds.quantity);

  await cart_details.updateOne(
    { userId: uss },
    {
      $pull: {
        products: {
          productId: cartIds.productId,
          colour: cartIds.colour,
          size: cartIds.size,
          quantity: qty,
        },
      },
    }
  );

  console.log("deleted cart");

  res.json({status:true})
  } catch (error) {
    console.log(error.message);
    next()
  }
 
};

let userGetDeleteOne = async function (req, res, next) {
  try {
     let parm = req.query;

  console.log(parm) ;
  console.log("patti");

  await order_details.updateOne(
    { _id: parm.orderId, "products.productIndex": parm.productIndex },
    { $set: { "products.$.status": parm.status } }
  );

  if (parm.status == "Cancelled") {
    const stockChanges = await order_details
      .findOne({
        _id: parm.orderId,
        "products.productIndex": parm.productIndex,
      })
      .lean();
    console.log(stockChanges.products[0].quantity);
    await product_details.updateOne(
      { productIndex: parm.productIndex },
      { $inc: { stock: stockChanges.products[0].quantity } }
    );
    if(parm.paymentType=="wallet" || parm.paymentType=="Pay using razorpay"){
      const walletInc = await order_details.aggregate([
        {
          $match:{
            _id:new ObjectId(parm.orderId)
          },
        },
        {
          $unwind:"$products"
        },
        {
          $match:{
            "products.paymentId":parm.paymentId
          }
        }
      ])
 
      const amountAdd = walletInc[0].products.price*walletInc[0].products.quantity
      console.log(amountAdd)
      await user_details.updateOne({ username: req.session.user }, { $inc: { wallet: amountAdd } })
    }
  }

  res.redirect("/orders");
  } catch (error) {
    console.log(error.message)
    next()
  }
 
};

let userGetAddress = async function (req, res, next) {
  try {
     let allAddress = await address_details.aggregate([
    {
      $match: { userId: req.session.user },
    },
    {
      $unwind: "$address",
    },
  ]);
  console.log("all address");
  console.log(allAddress);

  res.render("user-addresslist", { allAddress });
  } catch (error) {
    console.log(error.message)
    next()
  }
 
};

let userGetAddressParams = async function (req, res, next) {
  try {
    req.session.addressParams = req.params.id;
  console.log(req.session.addressParams);
  res.redirect("/checkout");
  } catch (error) {
    console.log(error.message)
    next()
  }
  
};
let userGetDeleteAddressParams = async function (req, res, next) {
  try {
     let addressdltParams = req.params.id;
  await address_details.updateOne(
    { userId: req.session.user },
    { $pull: { address: { id: addressdltParams } } }
  );

  res.redirect("/editprofile");
  } catch (error) {
    console.log(error.message)
    next()
  }
 
};

let userGetApplyCoupon = async function (req, res, next) {
  try {
     let appliCoupon = req.body;
  console.log(req.body);
  const checkDate = await coupon_details
    .findOne({ code: appliCoupon.coupon })
    .lean();
  // console.log(checkDate);

  if (checkDate == null) {
    console.log("invalid coupon");
    res.redirect("/cart");
  } else {
    let checkValidCoupon = () => {
      const date = new Date();
      const formattedDate = date.toISOString().slice(0, 10);
      if (formattedDate > checkDate.expiryDate) {
        console.log("coupon expired");
        couponErrorMsg="coupon expired"
        res.redirect("/cart");
      } else {
        req.session.appliedCoupon = checkDate;

        res.redirect("/cart");
      }
    };
    checkValidCoupon();
  }
  } catch (error) {
    console.log(error.message)
    next()
  }
 
};

let userGetOrdersList = async function (req, res, next) {
  try {
     console.log("hi");

  const checkOrder = await order_details
    .find({ orderedUser: req.session.user })
    .sort({ _id: -1 })
    .lean();

  res.render("user-orderlist", { checkOrder });
  } catch (error) {
    console.log(error.message)
    next()
  }
 
};

let userGetOrderParam = async function (req, res, next) {
  try {
      userOrderParam = mongoose.Types.ObjectId(req.params.id);
  console.log(userOrderParam);
  res.redirect("/orders");
  } catch (error) {
    console.log(error.message)
    next()
  }

};

const userGetOrderConfirm = async (req, res, next) => {
  try {
    console.log(req.session.user);
    const invoiceDetails = await order_details.aggregate([
      {
        $match: {
          orderedUser: req.session.user,
        },
      },

      {
        $sort: {
          _id: -1,
        },
      },
      {
        $limit: 1,
      },
    ]);

    console.log("gate8");
    console.log(invoiceDetails);
    console.log(invoiceDetails[0].products);

    res.render("order-confirm", { invoiceDetails });
  } catch (error) {
    console.log(error.message)
    next()
  }
};

const userGetResendOtp = async(req,res,next)=>{
  try {
    const number = req.params.id
    otpValue = Math.floor(100000 + Math.random() * 900000);
    otp(number, otpValue);
    didLogin = true;
    res.redirect(`/otp/${number}`);
  } catch (error) {
    console.log(error.message)
    next()
  }
}

const userGetForgotPassword = async(req,res,next)=>{
  try {
    console.log("htnll")
    res.render('user-forgot-password')
  } catch (error) {
    console.log(error.message)
    next()
  }
}

const userGetResetPassword = async(req,res,next)=>{
  try {
    console.log("aswinachuz")
    const resetParam=req.params.id
    res.render('user-reset-password',{resetParam})
  } catch (error) {
    console.log(error.message)
    next()
  }
}

const userPostEmailCheck = async(req,res,next)=>{
  try {
    console.log("famms")
    const email = req.body.email
    res.redirect(`/otp/${email}`)
    
  } catch (error) {
    console.log(error.message)
    next()
  }
}

const userPostUpdatePassword = async(req,res,next)=>{
  try {
    console.log("famms")
    let passWd = req.body.password
    const email = req.body.email


    passWd = await bcrypt.hash(
      passWd,
      10
    );
    await user_details.updateOne(
      { email:email },
      { $set: { password:passWd } }
    );
   

   
    res.redirect('/login')
    loginMsg="pasword updated successfully"
     console.log("pasword updated successfully");
    
  } catch (error) {
    console.log(error.message)
    next()
  }
}

let userPostChangeQuantity = async function (req, res, next) {
  try {
    const cart = req.body.cart;
    console.log(cart);
  const productid = req.body.product;
  console.log(productid);
  let k = req.body.count;
  let count = parseInt(k);
  await cart_details.updateOne(
    { 
      _id: new ObjectId(req.body.cart),
      "products": {
        $elemMatch: {
          "productId": req.body.product,
          "size": req.body.size
        }
      }
    },
    { $inc: { "products.$.quantity": count } }
  );
  


  console.log("quantity changed");

  let cartQuantity = await cart_details.findOne({
    _id: req.body.cart,
    "products.productId": req.body.product,
  });
  //  console.log(cartQuantity.products[0].quantity);

  
  const frontSize = cartQuantity.products[0].size;
  const price = await cart_details.aggregate([
    {
      $match: { _id: new ObjectId(req.body.cart) },
    },
    {
      $unwind: "$products",
    },
    {
      $project: {
        productId: "$products.productId",
        quantity: "$products.quantity",
        size: "$products.size",
        colour: "$products.colour",
      },
    },
    
     
    {
      $lookup: {
        from: "product_details",
        localField: "productId",
        foreignField: "productIndex",
        as: "product",
      },
    },
    {
      $project: {
        productId: 1,
        quantity: 1,
        size: 1,
        colour: 1,
        product: { $arrayElemAt: ["$product", 0] },
      },
    },
    
   
  ]);
  const price1 = await cart_details.aggregate([
    {
      $match: { _id: new ObjectId(req.body.cart) },
    },
    {
      $unwind: "$products",
    },
    {
      $project: {
        productId: "$products.productId",
        quantity: "$products.quantity",
        size: "$products.size",
        colour: "$products.colour",
      },
    },
    
     
    {
      $lookup: {
        from: "product_details",
        localField: "productId",
        foreignField: "productIndex",
        as: "product",
      },
    },
    {
      $match:{productId:productid}
    },
    {
      $project: {
        productId: 1,
        quantity: 1,
        size: 1,
        colour: 1,
        product: { $arrayElemAt: ["$product", 0] },
      },
    },
    
   
  ]);
  let subT=0
 
  const frontQuantity=price1[0].quantity
  for(var i=0;i<price.length;i++){
    subT=subT+parseInt(price[i].quantity)*parseInt(price[i].product.price)
    console.log(price[i].quantity+"  hh   "+price[i].product.price);
  }
  console.log(subT);
  req.session.ghh=subT
  console.log("kij");
const total = price[0].product.price
console.log(productid);
req.session.userdone=price
  res.json({ quantity: frontQuantity, cart: cart, size:frontSize,productId: productid,total:total,subtotal:subT });
  } catch (error) {
    console.log(error.message)
    next()
  }
  
};

let userPostAddAddress = async function (req, res, next) {
  // console.log(req.body);
  // await cart_details.updateOne({userId:userSession,},
  //     {
  //         $set:{}
  //     }
  //     )

   try {
     let newAddress = {};
  newAddress.userId = req.session.user;
  newAddress.address = req.body;

  newAddress.address.id = uuidv4();

  console.log(newAddress.address.id);

  let checkAddress = await address_details
    .findOne({ userId: req.session.user })
    .lean();
  if (checkAddress == null) {
    newAddress.defaultAddress = "none";
    await address_details.insertMany([newAddress]);
    console.log("address inserted");
  } else {
    let conv = mongoose.Types.ObjectId(checkAddress._id);
    await address_details.updateOne(
      { userId: req.session.user },
      {
        $push: {
          address: {
            housename: newAddress.address.housename,
            postalname: newAddress.address.postalname,
            pincode: newAddress.address.pincode,
            district: newAddress.address.district,
            state: newAddress.address.state,
            country: newAddress.address.country,
            id: newAddress.address.id,
          },
        },
      }
    );
    console.log("addres pushed");
  }

  res.redirect("/editprofile");
   } catch (error) {
     console.log(error.message)
     next()
   }

 
};

let userPostCartOperation = async function (req, res, next) {
  try {
     console.log(req.body);
  req.session.quantity = parseInt(req.body.quantity);
  (req.session.size = req.body.size), (req.session.colour = req.body.colour);

  //store the user id to cart database
  let userCart = {};
  req.session.Id = await user_details
    .findOne({ username: req.session.user })
    .lean();
  console.log(req.session.Id);
  uss = req.session.Id._id.toString();

  let checkDb = await cart_details
    .findOne({ userId: req.session.Id._id })
    .lean();

  if (checkDb == null) {
    userCart.userId = req.session.Id._id;

    userCart.products = [
      {
        productId: req.session.details,
        quantity: req.session.quantity,
        colour: req.session.colour,
        size: req.session.size,
      },
    ];

    cart_details.insertMany([userCart]);
    console.log("cart inserted");
  } else {
    userCart.productId = [{ productId: req.session.details }];
    let eval = await cart_details
      .findOne({ userId: req.session.Id._id })
      .lean();
    console.log("hi");
    let cj = 0;
    if (eval.products.length == 0) {
      await cart_details.updateOne(
        { userId: req.session.Id._id },
        {
          $push: {
            products: {
              productId: req.session.details,
              quantity: req.session.quantity,
              colour: req.session.colour,
              size: req.session.size,
            },
          },
        }
      );
      console.log("cart pushed");
    } else {
      for (var i = 0; i < eval.products.length; i++) {
        if (
          userCart.productId[0].productId == eval.products[i].productId &&
          req.session.size == eval.products[i].size &&
          req.session.colour == eval.products[i].colour
        ) {
          console.log(userCart);
          await cart_details.updateOne(
            {
              userId: req.session.Id._id,
              "products.productId": userCart.productId[0].productId,
            },
            {
              $inc: { "products.$.quantity": req.session.quantity },
            }
          );
          cj++;
        }
      }
      if (cj == 0) {
        await cart_details.updateOne(
          { userId: req.session.Id._id },
          {
            $push: {
              products: {
                productId: req.session.details,
                quantity: req.session.quantity,
                colour: req.session.colour,
                size: req.session.size,
              },
            },
          }
        );
        console.log("cart pushed");
      }
    }
  }
  console.log(req.session.Id._id);

  res.redirect("/cart");
  } catch (error) {
    console.log(error.message)
    next()
  }
 
};

let userPostEditPassword = async function (req, res, next) {
  try {
     let passwordUpdation = req.body;
  let pass = await user_details.findOne({ username: req.session.user }).lean();
  let result = await bcrypt.compare(
    passwordUpdation.previouspassword,
    pass.password
  );
  if (result) {
    passwordUpdation.newpassword = await bcrypt.hash(
      passwordUpdation.newpassword,
      10
    );
    await user_details.updateOne(
      { username: req.session.user },
      { $set: { password: passwordUpdation.newpassword } }
    );
    editPassMsg = "password updated successfully";
  } else {
    editPassMsg = "password doesnt match";
  }
  console.log("hi");

  res.redirect("/editprofile");
  } catch (error) {
    console.log(error.message)
    next()
  }
 
};

let userVerifyPayment = async function (req, res, next) {
  try {
     console.log(req.body);

  const crypto = require("crypto");
  let hmac = crypto.createHmac("sha256", "EAY2f074OyETGQarM9TbZdtW");
  hmac.update(
    req.body["payment[razorpay_order_id]"] +
      "|" +
      req.body["payment[razorpay_payment_id]"]
  );
  hmac = hmac.digest("hex");
  if (hmac == req.body["payment[razorpay_signature]"]) {
    for (var i = 0; i < req.session.userdone.length; i++) {
      req.session.orders.products[i].paymentId =
        req.body["payment[razorpay_payment_id]"];
    }
    console.log("done");

    await order_details.insertMany([req.session.orders]);
    await cart_details.deleteOne({ userId: uss });

    res.json({ status: true });
  } else {
    console.log("failed transaction");
  }

  console.log("hi");
  } catch (error) {
    console.log(error.message)
    next()
  }
 
};

let userPostSearch = async function (req, res, next) {
  try {
      let payload = req.body.payload.trim();

  let searchResults = await product_details
    .find({ title: { $regex: new RegExp("^" + payload + ".*", "i") } })
    .exec();
  searchResults = searchResults.slice(0, 10);
  res.send({ payload: searchResults });
  } catch (error) {
    console.log(error.message)
    next()
  }

};

let userPostEditProfile = async function (req, res, next) {
  try {
    let userUpdates = req.body;


   
      req.session.checkEmail = await user_details
        .findOne({ email: userUpdates.email })
        .lean();
      if (req.session.checkEmail == null) {
        console.log(req.session.user);

        await user_details.updateOne(
          { username: req.session.user },
          {
            $set: {
              name: userUpdates.name,
             
              phone: userUpdates.phone,
              email: userUpdates.email,
            },
          }
        );
        req.session.user = userUpdates.username;
        // userSession = req.session.user;
        res.redirect("/editprofile");
        editPMsg = "Profile updated";
        console.log("success");
      } else {
        editPMsg = "Email already in use";
        res.redirect("/editprofile");
        console.log("phone failed");
      }
    
  } catch (error) {
    console.log(error.message);
    next()
  }
};

//////////////////////////////////GET USER LOGIN PAGE///////////////////////

let userGetLogin = function (req, res, next) {
  try {
      res.render("user-login", { loginMsg });
  loginMsg = null;
  } catch (error) {
    console.log(error.message);
    next()
  }

};

//////////////////////////////////GET USER SIGNUP PAGE///////////////////////

let userGetSignup = function (req, res, next) {
  res.render("user-signup", { SignupMsg });
  SignupMsg = null;
};

//////////////////////////////////GET PLEASE ENTER PHONE NUMBER PAGE///////////////////////

let userGetOtpLogin = function (req, res, next) {
  res.render("user-otp-request");
};

//////////////////////////////////GET USER PRODUCT PARAMS HELPER REQUEST//////////////////////////////////

let userGetProductDetails = async function (req, res, next) {
  try {
    req.session.details = req.params.id;
    console.log(req.session.details + "this is the detailssss");

    res.redirect("/product-details");
  } catch (error) {
    console.log(error.message);
    next()
  }
};

//////////////////////////////////GET A SPECIFIC PRODUCT PAGE///////////////////////

let userGetDetails = async function (req, res, next) {
  try {
    req.session.details = req.params.id;
    console.log(req.session.details + "this is the detailsssssssss");
    let value = await product_details
      .find({ productIndex: req.session.details })
      .lean();

    let j = value[0].imageReference;
    console.log(j);
    let c = value[0].colour;
    let s = value[0].size;
    console.log(req.session.details);

    let checkW = await user_details
      .findOne({
        username: req.session.user,
        wishlist: { $in: req.session.details },
      })
      .lean();
    let checkWish;
    if (checkW == null) {
      checkWish = true;
    } else {
      checkWish = false;
    }
    res.render("user-product-details", { value, j, s, c, checkWish });
  } catch (error) {
    console.log(error.message);
    next()
  }
};

//////////////////////////////////GET PLEASE ENTER OTP PAGE////////////////////////////////////

let userGetOtp = function (req, res, next) {
  if (didLogin == true || didSIgnUp == true) {
    const number = req.params.id
    console.log(number)
    res.render("user-otp", { otpMsg,number });
    otpMsg = null;
  } else {
    res.redirect("/signup");
    didLogin = false;
    didSIgnUp = false;
  }
  console.log("poda");
  
};

//////////////////////////////////GET LANDING PAGE///////////////////////

let userGetHome = async function (req, res, next) {
  try {
      let products = await product_details.find().lean();
  let banners = await banner_details.find({ status: true }).lean();

  res.render("user-home", { products, banners });
  } catch (error) {
    console.log(error.message);
    next()
  }

};

//////////////////////////////////GET PRODUTS PAGE///////////////////////

let userGetProducts = async function (req, res, next) {
  try {
      console.log(req.session.categoryRequested);
  console.log("huythuyt");
  let categories = await category_details.find({ status: true }).lean();

  if (
    req.session.categoryRequested == "All Products" ||
    req.session.categoryRequested == null
  ) {
    if (req.session.captured == null && req.session.capturedFilter == null) {
      let products = await product_details.find({ status: true }).lean();
      res.render("user-products", { products, categories });

      console.log("gate1");
    } else if (
      req.session.capturedFilter == null &&
      req.session.captured != null
    ) {
      console.log("gate2");
      let field = req.session.captured.filtertype;
      let value = parseInt(req.session.captured.filter);
      console.log(value);
      if (field == "price") {
        let products = await product_details
          .find({ status: true })
          .sort({ price: value })
          .lean();
        res.render("user-products", { products, categories });
      } else if (field == "_id") {
        let products = await product_details
          .find({ status: true })
          .sort({ _id: value })
          .lean();
        res.render("user-products", { products, categories });
      }
      field = null;
      value = null;
    } else if (
      req.session.capturedFilter != null &&
      req.session.captured == null
    ) {
      console.log("gate 3");
      let startingprice = parseInt(req.session.capturedFilter.pricestarting);
      let endingprice = parseInt(req.session.capturedFilter.priceending);
      log(startingprice + " " + endingprice);
      let products = await product_details
        .find({
          status: true,
          price: { $gt: startingprice, $lt: endingprice },
        })
        .lean();
      // console.log(products);
      let checkW1 = await user_details
        .findOne({
          username: req.session.user,
          wishlist: { $in: req.session.details },
        })
        .lean();
      let wish;
      if (checkW1 == null) {
        wish = true;
      } else {
        wish = false;
      }
      res.render("user-products", { products, categories, wish });
      startingprice = null;
      endingprice = null;
    } else if (
      req.session.capturedFilter != null &&
      req.session.captured == null
    ) {
      console.log("gate 4");
      let field1 = req.session.captured.filtertype;
      let value1 = parseInt(req.session.captured.filter);
      if (field1 == "price") {
        let products = await product_details
          .find({
            status: true,
            price: { $gt: startingprice, $lt: endingprice },
          })
          .sort({ price: value1 })
          .lean();
        let checkW1 = await user_details
          .findOne({
            username: req.session.user,
            wishlist: { $in: req.session.details },
          })
          .lean();
        let wish;
        if (checkW1 == null) {
          wish = true;
        } else {
          wish = false;
        }
        res.render("user-products", { products, categories, wish });
      } else if (field1 == "_id") {
        let products = await product_details
          .find({
            status: true,
            price: { $gt: startingprice, $lt: endingprice },
          })
          .sort({ _id: value1 })
          .lean();
        let checkW1 = await user_details
          .findOne({
            username: req.session.user,
            wishlist: { $in: req.session.details },
          })
          .lean();
        let wish;
        if (checkW1 == null) {
          wish = true;
        } else {
          wish = false;
        }
        res.render("user-products", { products, categories, wish });
      }
      field1 = null;
      value1 = null;
    } else if (
      req.session.capturedFilter != null &&
      req.session.captured != null
    ) {
      console.log("gate 9");
      let startingprice = req.session.capturedFilter.pricestarting;
      let endingprice = req.session.capturedFilter.priceending;

      let field1 = req.session.captured.filtertype;
      let value1 = parseInt(req.session.captured.filter);
      if (field1 == "price") {
        let products = await product_details
          .find({
            status: true,
            price: { $gt: startingprice, $lt: endingprice },
          })
          .sort({ price: value1 })
          .lean();
        let checkW1 = await user_details
          .findOne({
            username: req.session.user,
            wishlist: { $in: req.session.details },
          })
          .lean();
        let wish;
        if (checkW1 == null) {
          wish = true;
        } else {
          wish = false;
        }
        res.render("user-products", { products, categories, wish });
      } else if (field1 == "_id") {
        let products = await product_details
          .find({
            status: true,
            price: { $gt: startingprice, $lt: endingprice },
          })
          .sort({ _id: value1 })
          .lean();
        let checkW1 = await user_details
          .findOne({
            username: req.session.user,
            wishlist: { $in: req.session.details },
          })
          .lean();
        let wish;
        if (checkW1 == null) {
          wish = true;
        } else {
          wish = false;
        }
        res.render("user-products", { products, categories, wish });
        // console.log(wish);
      }
    }
  } else {
    console.log(req.session.categoryRequested);
    console.log("hihihiihihih");

    if (req.session.captured == null && req.session.capturedFilter == null) {
      console.log("gate 5");
      let products = await product_details
        .find({ category: req.session.categoryRequested, status: true })
        .lean();
      let checkW1 = await user_details
        .findOne({
          username: req.session.user,
          wishlist: { $in: req.session.details },
        })
        .lean();
      let wish;
      if (checkW1 == null) {
        wish = true;
      } else {
        wish = false;
      }
      res.render("user-products", { products, categories, wish });
      console.log(products);
    } else if (
      req.session.captured != null &&
      req.session.capturedFilter == null
    ) {
      console.log("gate 6");
      let field1 = req.session.captured.filtertype;
      let value1 = parseInt(req.session.captured.filter);
      if (field1 == "price") {
        let products = await product_details
          .find({ category: req.session.categoryRequested, status: true })
          .sort({ price: value1 })
          .lean();
        let checkW1 = await user_details
          .findOne({
            username: req.session.user,
            wishlist: { $in: req.session.details },
          })
          .lean();
        let wish;
        if (checkW1 == null) {
          wish = true;
        } else {
          wish = false;
        }
        res.render("user-products", { products, categories, wish });
      } else if (field1 == "_id") {
        let products = await product_details
          .find({ category: req.session.categoryRequested, status: true })
          .sort({ _id: value1 })
          .lean();
        let checkW1 = await user_details
          .findOne({
            username: req.session.user,
            wishlist: { $in: req.session.details },
          })
          .lean();
        let wish;
        if (checkW1 == null) {
          wish = true;
        } else {
          wish = false;
        }
        res.render("user-products", { products, categories, wish });
      }
      field1 = null;
      value1 = null;
      categories = null;
    } else if (
      req.session.captured == null &&
      req.session.capturedFilter != null
    ) {
      console.log("gate 7");
      let startingprice = req.session.capturedFilter.pricestarting;
      let endingprice = req.session.capturedFilter.priceending;
      let products = await product_details
        .find({
          category: req.session.categoryRequested,
          status: true,
          price: { $gt: startingprice, $lt: endingprice },
        })
        .lean();
      console.log(products);
      let checkW1 = await user_details
        .findOne({
          username: req.session.user,
          wishlist: { $in: req.session.details },
        })
        .lean();
      let wish;
      if (checkW1 == null) {
        wish = true;
      } else {
        wish = false;
      }
      res.render("user-products", { products, categories, wish });
    } else if (
      req.session.captured != null &&
      req.session.capturedFilter != null
    ) {
      console.log("gate 8");
      let startingprice = req.session.capturedFilter.pricestarting;
      let endingprice = req.session.capturedFilter.priceending;

      let field1 = req.session.captured.filtertype;
      let value1 = parseInt(req.session.captured.filter);
      if (field1 == "price") {
        let products = await product_details
          .find({
            category: req.session.categoryRequested,
            status: true,
            price: { $gt: startingprice, $lt: endingprice },
          })
          .sort({ price: value1 })
          .lean();
        let checkW1 = await user_details
          .findOne({
            username: req.session.user,
            wishlist: { $in: req.session.details },
          })
          .lean();
        let wish;
        if (checkW1 == null) {
          wish = true;
        } else {
          wish = false;
        }
        res.render("user-products", { products, categories, wish });
      } else if (field1 == "_id") {
        let products = await product_details
          .find({
            category: req.session.categoryRequested,
            status: true,
            price: { $gt: startingprice, $lt: endingprice },
          })
          .sort({ _id: value1 })
          .lean();
        let checkW1 = await user_details
          .findOne({
            username: req.session.user,
            wishlist: { $in: req.session.details },
          })
          .lean();
        let wish;
        if (checkW1 == null) {
          wish = true;
        } else {
          wish = false;
        }
        res.render("user-products", { products, categories, wish });
        console.log(wish);
      }
    }
  }
  } catch (error) {
    console.log(error.message);
    next()
  }

};

//////////////////////////////////GET REQUESTED PRODUCTS PARAMS HELPER REQUEST///////////////////////

let userGetProductsRequested = function (req, res, next) {
  try {
     req.session.categoryRequested = req.params.id;
  console.log(req.session.categoryRequested);

  res.redirect("/products");
  } catch (error) {
    console.log(error.message);
    next()
  }
 
};

let userGetFilter = function (req, res, next) {
  try {
     req.session.captured = req.query;

  console.log(req.session.captured);
  res.redirect("/products");
  } catch (error) {
    console.log(error.message);
    next()
  }
 
};

let userGetFilterPrice = function (req, res, next) {
  try {
     req.session.capturedFilter = req.query;
  console.log(req.session.capturedFilter);
  res.redirect("/products");
  } catch (error) {
    console.log(error.message);
    next()
  }
 
};

let userPostAddWishlist = async function (req, res, next) {
  try {
     let wishlistCheck = await user_details
    .findOne({ username: req.session.user, wishlist: { $exists: true } })
    .lean();

  console.log(wishlistCheck);
  await user_details.updateOne(
    { username: req.session.user },
    { $push: { wishlist: req.body.productIndex } }
  );
  console.log("success");
  res.json({status:true,productIndex:req.body.productIndex})
  } catch (error) {
    console.log(error.message);
    next()
  }
 
};

let userGetWishlist = async function (req, res, next) {
  try {
      let userwishlist = await user_details.aggregate([
    {
      $match: {
        username: req.session.user,
      },
    },
    {
      $unwind: "$wishlist",
    },

    {
      $lookup: {
        from: "product_details",
        localField: "wishlist",
        foreignField: "productIndex",
        as: "product",
      },
    },
    {
      $project: {
        product: { $arrayElemAt: ["$product", 0] },
      },
    },
  ]);
  console.log(userwishlist);
  res.render("user-wishlist", { userwishlist });
  } catch (error) {
    console.log(error.message);
    next()
  }

};

let userPostDeleteWishlist = async function (req, res, next) {
  try {
      let wishlistCheck = await user_details
    .findOne({ username: req.session.user, wishlist: { $exists: true } })
    .lean();

  console.log(wishlistCheck);
  await user_details.updateOne(
    { username: req.session.user },
    { $pull: { wishlist: req.body.productIndex } }
  );
  console.log("remove");
  } catch (error) {
    console.log(error.message);
    next()
  }

};


//////////////////////////////////POST SIGNUP req.session.details///////////////////////

let userPostSignup = async function (req, res, next) {
  try {
    didSIgnUp = true;
    signupData = {
      username: req.body.username,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
    };
    signupData.wallet=0

    const phoneValidator = await user_details
      .findOne({ email: signupData.email })
      .lean();
    const usernameValidator = await user_details
      .findOne({ username: signupData.username })
      .lean();

    if (phoneValidator == null) {
      if (usernameValidator == null) {
        otpNumber = signupData.email;

        didSIgnUp = true;

        console.log("gate1");

        otpValue = Math.floor(100000 + Math.random() * 900000);

        otp(otpNumber, otpValue);
        console.log(otpNumber)
        console.log(otpValue)
        
        res.redirect(`/otp/${otpNumber}`);

        
      } else {
        SignupMsg = "This username is taken";
        console.log(SignupMsg);
        console.log("hii");
        res.redirect("/signup");
      }
    } else {
      SignupMsg = "This phone is already taken";

      res.redirect("/signup");
    }
  } catch (error) {
    console.log(error.message);
    next()
  }
};

//////////////////////////////////POST LOGIN PAGE///////////////////////

let userPostLogin = async function (req, res, next) {
  try {
    loginData = {
      email: req.body.email,
      password: req.body.password,
    };
    const documentValidator = await user_details
      .findOne({ email: loginData.email })
      .lean();

    if (documentValidator == null) {
      loginMsg = "invalid username and password";
      res.redirect("/login");
    } else if (documentValidator.status == false) {
      loginMsg = "This account has been blocked";
      res.redirect("/login");
    } else {
      let passwordValidator = await bcrypt.compare(
        loginData.password,
        documentValidator.password
      );
      if (passwordValidator) {
        console.log("login success");
        req.session.user = documentValidator.username;

        console.log(req.session);
        // userSession = req.session.user;
        console.log(req.session.user);
        res.redirect("/");
        loginData=null
      } else {
        loginMsg = "invalid password";
        res.redirect("/login");
      }
    }
  } catch (error) {
    console.log(error.message);
    next()
  }
};

//////////////////////////////////POST OTP CHECKING REQUEST///////////////////////

let userPostOtp = async function (req, res, next) {
  try {
    console.log(req.body.otp);
    console.log("poocha");
    console.log(signupData);
    console.log(loginData);
    if (req.body.otp == otpValue) {
      if (otpData) {
        console.log("both are null");
        res.redirect('/reset-passeord/'+req.body.email)
        otpData=null
        
      }else if(signupData ==null){
        if (req.session.checkEmail.status == false) {
          loginMsg = "This account has been blocked";
          res.redirect("/login");
        } else {
          req.session.user = req.session.checkEmail.username;
          // userSession = req.session.user;
          console.log(req.session.user);
          // console.log("req.session.checkEmail.username");
          res.redirect("/");
          loginData=null
          console.log("login success");
        }
      } else {
        signupData.status = true;
        console.log(otp);

        signupData.password = await bcrypt.hash(signupData.password, 10);

        const userData = await user_details.insertMany([signupData]);

        req.session.user = signupData.username;
        // userSession = req.session.user;
        console.log(req.session.user);
        console.log("signup success");
        res.redirect("/");
        signupData = null;
      }
    } else {
      otpMsg = "wrong otp";
      res.redirect(`/otp/${otpNumber}`);
    }
  } catch (error) {
    console.log(error.message);
    next()
  }
};

/////////////////////////////POST  PRODUCTS PAGE///////////////////////

let userPostOtpLogin = async function (req, res, next) {
  try {
    didLogin = true;
  let email = req.body.email;
  console.log(req.body)

  otpValue = Math.floor(100000 + Math.random() * 900000);

  console.log(otpValue);

  req.session.checkEmail = await user_details.findOne({ email: email }).lean();
  if (req.session.checkEmail == null) {
    console.log("invalid Email");
  } else {
    otp(email, otpValue);
  }
  didLogin = true;
  res.redirect("/otp/"+email);
  } catch (error) {
    console.log(error.message);
    next()
  }
  
};

const userPostforgotCheck =  async function (req, res, next) {
  try {
    didLogin = true;
  let email = req.body.email;
  console.log(req.body)
   otpData = true

  otpValue = Math.floor(100000 + Math.random() * 900000);

  console.log(otpValue);

  req.session.checkEmail = await user_details.findOne({ email: email }).lean();
  if (req.session.checkEmail == null) {
    console.log("invalid Email");
  } else {
    otp(email, otpValue);
  }
  didLogin = true;
  res.redirect("/otp/"+email);
  } catch (error) {
    console.log(error.message);
    next()
  }
  
};


let userGetLogout = function (req, res, next) {
  req.session.user = null;
  req.session.appliedCoupon = null;
  defaultAddress = null;
  req.session.deducted = null;
  req.session.payReciept = null;
  req.session.orders = null;
  req.session.checkEmail = null;
  //   loginMsg
  //   SignupMsg;
  //   otpMsg
  req.session.captured = null;
  req.session.capturedFilter = null;
  req.session.checkEmail = null;
  req.session.userdone = null;

  //   editMsg
  //   productParams
  //   colour
  //   quantityd
  //   fdfdd;

  //   size
  //   uss
  req.session.Id = null;
  //   editPassMsg
  req.session.appliedCoupon = null;
  //   otpNumber;
  //   signupData;
  //   loginData;
  //   loginOtpData
  //   otpValue
  req.session.colour = null;
  req.session.quantity = null;
  req.session.size = null;
  req.session.categoryRequested = null;
  req.session.ghh = null;
  //   req.session.req.session.details=null;
  req.session.userdone = null;
  req.session.addressParams = null;
  req.session.orders = null;

  res.redirect("/login");
};

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
  userGetOrderParam,
  userPostAddDefaultAddress,
  userGetOrderConfirm,
  userGetResendOtp,
  userGetForgotPassword,
  userGetResetPassword,
  userPostUpdatePassword,
  userPostforgotCheck
};
