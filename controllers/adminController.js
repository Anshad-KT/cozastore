let admin_details = require('../models/adminModel')
let user_details = require('../models/userModel')
let bcrypt = require('bcrypt');
const fileUpload = require('express-fileupload')
const product_details = require('../models/productModel')
const brand_details = require('../models/brandModel')
const category_details = require('../models/categoryModel')
const subcategory_details = require('../models/subcategoryModel')
const order_details = require('../models/orderModel')
var mongoose = require('mongoose')
const {v4 : uuidv4} = require('uuid')

let dbBrand;
let dbSubcategory;
let dbCategory
let adminSession
let adminMsg
let editId
let temp
// let adminGetLogin =

let adminGetAllProducts =async function (req, res, next) {
 try {
  if(adminSession){
    let products = await product_details.find();
    
    res.render('admin-products',{products});
 }else{
   res.redirect('/admin-login')
 }
 } catch (error) {
  console.log(error.message);
 }
 
}
let adminGetDashboard =async function (req, res, next) {
  if(adminSession){
    let dashBoard= await order_details.aggregate([
      {
         $unwind:'$products'
      },
      
      {
         $match:{
             "products.status":"Delivered"
         }
      }
        
     
    ])
    let dashBoard1= await order_details.aggregate([
      {
         $unwind:'$products'
      },
      
      {
         $match:{
             "products.status":"Cancelled"
         }
      }
        
     
    ])
    let dashBoard2= await order_details.aggregate([
      {
         $unwind:'$products'
      },
      
      {
         $match:{
             "products.status":"Pending"
         }
      }
        
     
    ])
    let dashBoard3= await order_details.aggregate([
      {
         $unwind:'$products'
      },
      
      
        
     
    ])
    let profit=0;
    for(var i=0;i<dashBoard.length;i++){
      
      profit=dashBoard[i].products.price+profit
       
  }
  
  const d = new Date();
  let month = d.getMonth();
  
    let totalOrders=dashBoard3.length
    let totalCancelled=dashBoard1.length
    let totalPending=dashBoard2.length
    res.render('admin-home',{profit,month,totalOrders,totalCancelled,totalPending});
 }else{
    res.redirect('/admin-login')
 }
 
}

let adminGetLogin = function (req, res, next) {
  if(adminSession){

    res.redirect('/admin');

 }else{

  res.render('admin-login',{adminMsg});
  adminMsg=null;
 }
 
}

let adminGetDeleteCategory =async function (req, res, next) {
     try {
      if(adminSession){

      let name = req.query
      await category_details.updateOne({name:name.name},{$set:{status:name.status}})
      res.redirect('/admin-addcategory')
    
     }else{
    
      res.redirect('/admin-login')
    
     }

     
     } catch (error) {
      console.log(error.message);
     }
}

let adminGetDeleteSubCategory =async function (req, res, next) {
  try {
    if(adminSession){
      let name = req.query
      await subcategory_details.updateOne({name:name.name},{$set:{status:name.status}})
      
      res.redirect('/admin-addsubcategory')
    }else{
      res.redirect('/admin-login')
    }
   
  } catch (error) {
   console.log(error.message);
  }
}

let adminGetDeleteProduct = async function (req, res, next) {
  try {
    if(adminSession){
    
      let que = req.query
    
  

      await product_details.updateOne({productIndex:que.productIndex},{$set:{status:que.status}})
      
      console.log("delete success");
      
      res.redirect('/adminproducts')
    
    }else{
    
      res.redirect('/admin-login')
    
    }
   
  } catch (error) {
   console.log(error.message);
  }
}

let adminGetOrderStatus = async function (req, res, next) {
  try {
    if(adminSession){
      let orders = await order_details.find()
    //   let adminresp = await order_details.aggregate([

    //     {
    //         $unwind:'$products'
    //     }
    // ])
      for(var i=0;i<orders.length;i++){
        if(orders[i].products.status=="Pending"){
            orders[i].yellow=true;
            orders[i].green=false;
            orders[i].red=false;
        }else if(orders[i].products.status=="Delivered"){
          orders[i].yellow=false;
          orders[i].green=true;
          orders[i].red=false;
          
      }else if(orders[i].products.status=="Cancelled"){
        orders[i].red=true;
        orders[i].yellow=false;
        orders[i].green=false;
    }
          
      }
  //     if(orders.orderStatus=="Pending"){
  //        orders.yellow=true
  //        orders.green=false;
  //        orders.red=false;
  //     }else  if(orders.orderStatus=="Cancelled"){
  //       orders.red=true;
  //       orders.yellow=false
  //        orders.green=false;
        
  //    }else if(orders.orderStatus=="Delivered"){
  //     orders.green=true
  //     orders.red=false;
  //     orders.yellow=false
  //  }
     
      res.render('admin-orderstatus',{orders})
    }else{
      res.redirect('/admin-login')
    }
   
  } catch (error) {
   console.log(error.message);
  }
}

let adminGetSetOrderStatus = async function (req, res, next) {
  try {
   if(adminSession){
    let statusName = req.query
    
    await order_details.updateOne({_id:statusName.id,"products.productIndex":statusName.productIndex},{$set:{"products.$.status":statusName.status}})
   
    let pId=uuidv4()
   
    if(statusName.status=="Delivered"){
      
      let statusChecking = await order_details.findOne({_id:statusName.id,"products.productIndex":statusName.productIndex})
      console.log("kl10");
      if(statusChecking.paymentType=="cash on delivery"){
        await order_details.updateOne({_id:statusName.id,"products.productIndex":statusName.productIndex},{$set:{"products.$.paymentId":pId}})
      }

      let stockChanges = await order_details.findOne({_id:statusName.id,"products.productIndex":statusName.productIndex})
      
      await product_details.updateOne({productIndex:statusName.productIndex},{$inc:{stock:"-"+stockChanges.products[0].quantity}})
    }
   
    console.log("success");
 
    res.redirect('/orderstatus')
   }else{
      res.redirect('/admin-login')
   }



  } catch (error) {
   console.log(error.message);
  }
}

let adminGetGetCartOrders =async function (req, res, next) {
  try {
   if(adminSession){
    // let statusName = req.query
    temp = mongoose.Types.ObjectId(req.params.id)
    
    //  await order_details.updateOne({_id:statusName.id},{$set:{orderStatus:statusName.status}})
    //  console.log("success");
    res.redirect('/admincart')
    
   }else{
      res.redirect('/admin-login')
   }



  } catch (error) {
   console.log(error.message);
  }
}

let adminGetListOrderSpecific = async function (req, res, next) {
  try {
   if(adminSession){
    
  
 
    let resp = await order_details.aggregate([
     
      {
        $match:{_id:temp}
      },
      
      {
          $unwind:'$products'
      }
  ])
 
    for(var i=0;i<resp.length;i++){
      if(resp[i].products.status=="Pending"){
          resp[i].yellow=true;
          resp[i].green=false;
          resp[i].red=false;
      }else if(resp[i].products.status=="Delivered"){
        resp[i].yellow=false;
        resp[i].green=true;
        resp[i].red=false;
    }else if(resp[i].products.status=="Cancelled"){
      resp[i].red=true;
      resp[i].yellow=false;
      resp[i].green=false;
  }
        
    }
    console.log("This is resp");
   
   
    res.render('admin-cartorders',{resp})
   }else{
      res.redirect('/admin-login')
   }



  } catch (error) {
   console.log(error.message);
  }
}


let adminGetDeleteBrand =async function (req, res, next) {
  try {
   if(adminSession){
    let hi = req.query
    await brand_details.updateOne({name:hi.name},{$set:{status:hi.status}})
 
    res.redirect('/admin-addbrand')
   }else{
      res.redirect('/admin-login')
   }



  } catch (error) {
   console.log(error.message);
  }
}

let adminGetAddCategory = async function (req, res, next) {
  try {
    if(adminSession){
      dbCategory = await category_details.find()
      console.log("reached");
  
      res.render('admin-addcategory',{dbCategory});
    }else{
      res.redirect('/admin-login')
    }
    
  } catch (error) {
    console.log(error.message);
  }
 
}
let adminGetAddBrand =async function (req, res, next) {
  
  try {
    if(adminSession){
      dbBrand = await brand_details.find()
      console.log(dbBrand);
      res.render('admin-addbrand',{dbBrand});
    }else{
       res.redirect('/admin-login')
    }
  } catch (error) {
    console.log(error.message);
  }
  
}
let adminGetAddSubCategory =async function (req, res, next) {
  try {
    if(adminSession){
      dbSubcategory = await subcategory_details.find()
    
      res.render('admin-addsubcategory',{dbSubcategory});
    }else{
         res.redirect('/admin-login')
    }
     
  } catch (error) {
    console.log(error.message);
  }
   
}
let adminGetAddProducts = async function (req, res, next) {
  try {
    if(adminSession){

      dbBrand = await brand_details.find()
      dbCategory = await category_details.find()
      dbSubcategory = await subcategory_details.find()
      res.render('admin-addproduct',{dbBrand,dbSubcategory,dbCategory});
    }else{
       res.redirect('/admin-login')
    }

  } catch (error) {
    console.log(error.message);
  }
  
}

let adminGetAllUsers = async function (req, res, next) {
  try {
    if(adminSession){
      let users = await user_details.find()
      res.render('admin-users',{users});
    }else{
    res.redirect('/admin-login')
    }
   
  } catch (error) {
    console.log(error.message);
  }
  
}



let adminGetBlockUsers = async function (req, res, next) {
  try {

    if(adminSession){
      let id=req.params.id
      let statusCheck = await user_details.findOne({_id:id})
      if(statusCheck==null){
         console.log("invalid id passed");
      }else if(statusCheck.status==true){
          await user_details.updateOne({_id:id},{$set:{status:false}})
          console.log("blcoked");
          res.redirect('/admin-users')
      }else{
        await user_details.updateOne({_id:id},{$set:{status:true}})
        console.log("unblocked");
        res.redirect('/admin-users')
      }
    }else{
     res.redirect('/admin-login')
    }

  
  } catch (error) {
    console.log(error.message);
  }
    
    
}
let adminGetDeleteUsers = async function (req, res, next) {
    try {
      if(adminSession){
        let id=req.params.id;
        console.log(id);
        await user_details.deleteOne({_id:id})
        console.log("deleted user");
        res.redirect('/admin-users')
      }else{
         res.redirect('/admin-login')
      }
      
    } catch (error) {
      console.log(error.message);
    }
}

let adminGetEditProduct = async function (req, res, next) {
  try {
    if(adminSession){
      editId = req.params.id
      console.log(editId);
      res.redirect('/adminedit')
    }else{
      res.redirect('/admin-login')
    }
   
  } catch (error) {
   console.log(error.message);
  }
}

let adminGetEdit = async function (req, res, next) {
  try {
    if(adminSession){
      console.log("hi");
      dbBrand = await brand_details.find()
      dbCategory = await category_details.find()
      dbSubcategory = await subcategory_details.find()
      res.render('admin-editproduct',{dbBrand,dbCategory,dbSubcategory,editId})
    }else{
      res.redirect('/admin-login')
    }
   
  } catch (error) {
   console.log(error.message);
  }
}

//post requests

let adminPostEditProduct =  async function (req, res, next) {
  try {
    if(adminSession){
    
      let editProducts = {
        title: req.body.title,
        price: req.body.price,
        category: req.body.category,
        stock: req.body.stock,
       
        brand: req.body.brand,
        subcategory: req.body.subcategory,
        productIndex: req.body.productindex,
        description:req.body.description
      }

      console.log(req.body);
      let productId = editProducts.productIndex;
      console.log(productId);

      let result = await product_details.findOne({productIndex:productId})
      console.log(result+"this is the result");
      function fileEdit(){

      let images=[];
      let img = req.files.image;
      let count = img.length
      console.log(count);
      if (count) {
      
      for (var i = 0; i < count; i++) {
        
        img[i].mv('public/product-images/products/' + editProducts.productIndex + i + '.jpg', (err, done) => {
          console.log(err);
        })
  
        images[i] = result.productIndex+i;
      }
      editProducts.imageReference = images;
    } else {
      img.mv('./public/product-images/products/' + editProducts.productIndex + '.jpg', (err, done) => {
        console.log(err);
      })
      images[0] = editProducts.productIndex;
      editProducts.imageReference = images;
    }
      }
      fileEdit()
      console.log(editProducts);
       await product_details.updateOne({productIndex:productId},{$set:{title:editProducts.title,price:editProducts.price,category:editProducts.category,subcategory:editProducts.subcategory,brand:editProducts.brand,stock:editProducts.stock,description:editProducts.description,imageReference:editProducts.imageReference}})

      console.log("edit success");
      res.redirect('/adminproducts')
    }else{
      res.redirect('/admin-login')
    }
   
  } catch (error) {
   console.log(error.message);
  }
}



let adminPostLogin = async function (req, res, next) {
  try {
    let data = {
      username: req.body.username,
      password: req.body.password
    }
    var adminValidator = await admin_details.findOne({ username: data.username })
    if (adminValidator == null) {
      res.redirect('/admin-login')
      adminMsg = "invalid username or password"
      console.log("invalid username or password");
    } else {

      let result = await bcrypt.compare(data.password, adminValidator.password)
      console.log(result);
      if (result) {
        
        req.session.admin=adminValidator.username;
        adminSession=req.session.admin;
        res.redirect('/admin')
        console.log("logged to admin");
      } else {
        res.redirect('/admin-login')
        adminMsg = "invalid password"
        console.log("invalid password");
      }
    }


  } catch (error) {
    console.log(error.message);
  }
}



let adminPostUploadProduct = async function (req, res, next) {
  let size1=[]
  size1=req.body.size
  let colour1=[]
  colour1=req.body.colour
 
  let products = {
    title: req.body.title,
    price: req.body.price,
    category: req.body.category,
    stock: req.body.stock,
    size:size1,
    colour:colour1,
    brand: req.body.brand,
    subcategory: req.body.subcategory,
    productIndex: req.body.productindex,
    description:req.body.description
  }
  console.log("hii");
  console.log(req.body);
 
 

 
  
  function file(){
    let images=[];
    let img = req.files.image;
    let count = img.length
    console.log(count);
    if (count) {
      
      for (var i = 0; i < count; i++) {
        img[i].mv('public/product-images/products/' + products.productIndex + i + '.jpg', (err, done) => {
          console.log(err);
        })
  
        images[i] = products.productIndex+i;
      }
      products.imageReference = images;
    } else {
      img.mv('./public/product-images/products/' + products.productIndex + '.jpg', (err, done) => {
        console.log(err);
      })
      images[0] = products.productIndex;
      products.imageReference = images;
    }

  }
  file()
  products.uploadedDate = new Date().toDateString()
  products.status=true; 
  await product_details.insertMany([products]);
  res.redirect('/admin-addcategory')

}


let adminPostAddCategory =async function (req, res, next) {
   try {
    let checkCategory = await category_details.findOne({name:req.body.category})
    console.log(req.body.category);
    console.log(checkCategory);
    if(checkCategory==null){
      let category = {
        name:req.body.category,
       }
    category.date = new Date().toDateString()
    console.log("category");
    category.status=true
    await category_details.insertMany([category])
    res.redirect('/admin-addcategory')

    }else{
      console.log("category already present");
      res.redirect('/admin-addcategory')
    }
      
       
   } catch (error) {
       error.message
   }
}
let adminPostAddBrand =async function (req, res, next) {
  try {

    let checkBrand = await brand_details.findOne({name:req.body.brand})
    console.log(req.body.brand);
    console.log(checkBrand);
    if(checkBrand==null){
      let brand = {
        name:req.body.brand,
        
     }
     brand.date = new Date().toDateString()
     brand.status = true;
     if(req.files==null){
      await brand_details.insertMany([brand])
      res.redirect('/admin-addbrand')
     }else{
      let image = req.files.image;
      image.mv('./public/product-images/brand/'+brand.name+'.jpg',(err,done)=>{
        console.log(err);
      })
      brand.imageReference = brand.name+'.jpg'
      console.log("brand");
     
      await brand_details.insertMany([brand])
      res.redirect('/admin-addbrand')
     }
     
    }else{
      console.log("brand already present");
      res.redirect('/admin-addbrand')
    }
   
  } catch (error) {
    console.log(error.message);
  }
  
 
}
let adminPostAddSubCategory =async function (req, res, next) {
  try {
    let checkSubCategory = await subcategory_details.findOne({name:req.body.subcategory})
    if(checkSubCategory==null){

      let subcategory = {
        name:req.body.subcategory,
    }
    
    subcategory.date = new Date().toDateString()
    subcategory.status=true
    console.log("subcategory");
    res.redirect('/admin-addsubcategory')
    await subcategory_details.insertMany([subcategory])
    }else{
      console.log("subcategory already present");
      res.redirect('/admin-addsubcategory')
    }
   
  } catch (error) {
    console.log(error.message);
  }
  
}


let adminGetLogout = function (req, res, next) {
  
  req.session.admin=null;
  res.redirect('/admin-login')
 
}



module.exports = {
  adminGetDashboard,
  adminGetAddProducts,
  adminGetAllProducts,
  adminGetLogin,
  adminPostLogin,
  adminPostUploadProduct,
  adminGetAllUsers,
  adminGetBlockUsers,
  adminGetDeleteUsers,
  adminGetAddCategory,
  adminGetAddSubCategory,
  adminGetAddBrand,
  adminGetDeleteCategory,
  adminPostAddCategory,
  adminPostAddSubCategory,
  adminPostAddBrand,
  adminGetDeleteSubCategory,
  adminGetDeleteBrand,
  adminGetLogout,
  adminGetDeleteProduct,
  // adminGetEditProduct
  adminGetOrderStatus,
  adminGetSetOrderStatus,
  adminGetGetCartOrders,
  adminGetListOrderSpecific,
  adminGetEditProduct,
  adminGetEdit,
  adminPostEditProduct

}

