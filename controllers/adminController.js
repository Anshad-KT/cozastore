let admin_details = require('../models/adminModel')
let user_details = require('../models/userModel')
let bcrypt = require('bcrypt');
let newImg

require('dotenv').config()

// const multer  = require('multer')

// const storage = multer.diskStorage({
//   destination:(req,file,cb)=>{

//     cb(null,'./public/product-images/')
//   },
//   filename:(req,file,cb)=>{
//     const newId = uuidv4()
//     cb(null,`${newId}-${file.originalname}`)

// }
// })

// const upload = multer({storage})

const { JSDOM } = require('jsdom');
const XLSX = require('xlsx');
let categoryMsg
let subcategoryMsg
// const fileUpload = require('express-fileupload')
const product_details = require('../models/productModel')
const brand_details = require('../models/brandModel')
let bannerParam
const category_details = require('../models/categoryModel')
const subcategory_details = require('../models/subcategoryModel')
const order_details = require('../models/orderModel')
const banner_details = require('../models/bannerModel')
let brandMsg
let salesParam
const coupon_details = require('../models/couponModel')
var mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')
const sharp = require('sharp')
const printer = require('node-printer')
const {ObjectId}=require('mongodb')

const cheerio = require('cheerio');
const axios = require('axios');



let adminMsg
let editId

let couponMsg



let adminGetAllProducts = async function (req, res, next) {
  try {

    let products = await product_details.find().lean()

    res.render('admin-products', { products });

  } catch (error) {
    console.log(error.message);
    next()
  }

}
let adminGetDashboard = async function (req, res, next) {
try {
   let dashBoard = await order_details.aggregate([
    {
      $unwind: '$products'
    },

    {
      $match: {
        "products.status": "Delivered"
      }
    }


  ])
  let dashBoard1 = await order_details.aggregate([
    {
      $unwind: '$products'
    },

    {
      $match: {
        "products.status": "Cancelled"
      }
    }


  ])
  let dashBoard2 = await order_details.aggregate([
    {
      $unwind: '$products'
    },

    {
      $match: {
        "products.status": "Pending"
      }
    }


  ])
  let dashBoard3 = await order_details.aggregate([
    {
      $unwind: '$products'
    },




  ])
  let profit = 0;
  for (var i = 0; i < dashBoard.length; i++) {

    profit = dashBoard[i].products.price + profit

  }

  const d = new Date();
  let month = d.getMonth();

  let totalOrders = dashBoard3.length
  let totalCancelled = dashBoard1.length
  let totalPending = dashBoard2.length
  res.render('admin-home', { profit, month, totalOrders, totalCancelled, totalPending });


} catch (error) {
  console.log(error.message);
  next()
}
 
}

let adminGetLogin = function (req, res, next) {


try {
   res.render('admin-login', { adminMsg });
  adminMsg = null;
} catch (error) {
  console.log(error.message);
  next()
}

 


}

let adminGetDeleteCategory = async function (req, res, next) {
  try {

    let name = req.query
    await category_details.updateOne({ name: name.name }, { $set: { status: name.status } })
    res.redirect('/admin-addcategory')




  } catch (error) {
    console.log(error.message);
    next()
  }
}

let adminGetDeleteSubCategory = async function (req, res, next) {
  try {

    let name = req.query
    await subcategory_details.updateOne({ name: name.name }, { $set: { status: name.status } })

    res.redirect('/admin-addsubcategory')


  } catch (error) {
    console.log(error.message);
    next()
  }
}

let adminGetDeleteProduct = async function (req, res, next) {
  try {


    let que = req.query



    await product_details.updateOne({ productIndex: que.productIndex }, { $set: { status: que.status } })

    console.log("delete success");

    res.redirect('/adminproducts')



  } catch (error) {
    console.log(error.message);
    next()
  }
}

let adminGetOrderStatus = async function (req, res, next) {
  try {

    req.session.orders = await order_details.find().sort({ _id: -1 }).lean()




    let ord = req.session.orders
    res.render('admin-orderstatus', { ord })
    ord = null


  } catch (error) {
    console.log(error.message);
    next()
  }
}

let adminGetSetOrderStatus = async function (req, res, next) {
   try {

  let statusName = req.query
  console.log(statusName);
  await order_details.updateOne({ _id: statusName.id, "products.productIndex": statusName.productIndex }, { $set: { "products.$.status": statusName.status } })

  let pId = uuidv4()

  if (statusName.status == "Return Accepted") {
    let returnStatus = await order_details.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(statusName.id)
        }
      },
      {
        $unwind: '$products'
      },
      {
        $match: {
          "products.paymentId": statusName.paymentId
        }
      }
    ])

    console.log(returnStatus[0]);
    //pass _id of order to here 
    //check which is the order
    //set a variable to get total count
    if (returnStatus[0].couponId) {
      console.log(returnStatus[0].products)
      const amount = parseInt(returnStatus[0].products[0].price) * parseInt(returnStatus[0].products[0].quantity) - (parseInt(returnStatus[0].couponDiscount) / parseInt(returnStatus[0].products[0].quantity))
      console.log(amount);
      await user_details.updateOne({ username: returnStatus[0].orderedUser }, { $inc: { wallet: amount } })
    } else {



      // console.log(returnStatus[0].products[0].price);

      const amount = parseInt(returnStatus[0].products.price) * parseInt(returnStatus[0].products.quantity)
      await user_details.updateOne({ username: returnStatus[0].orderedUser }, { $inc: { wallet: amount } })
    }

    const stockChanges = await order_details.findOne({ _id: statusName.id, "products.productIndex": statusName.productIndex }).lean()

    await product_details.updateOne({ productIndex: statusName.productIndex }, { $inc: { stock:  stockChanges.products[0].quantity } })



  }

  if (statusName.status == "Delivered") {

    let statusChecking = await order_details.findOne({ _id: statusName.id, "products.productIndex": statusName.productIndex }).lean()

    if (statusChecking.paymentType == "cash on delivery") {

      console.log("aswin")
      await order_details.updateOne({ _id: statusName.id, "products.productIndex": statusName.productIndex }, { $set: { "products.$.paymentId": pId } })



    }

    const changedDate = new Date().toDateString().slice(4)

    await order_details.updateOne({ _id: statusName.id, "products.productIndex": statusName.productIndex }, { $set: { "deliveryDate": changedDate } })
    const salesDate = new Date()
    await order_details.updateOne({ _id: statusName.id, "products.productIndex": statusName.productIndex }, { $set: { "products.$.salesDate": salesDate } })


  }
  if (statusName.status == "Order Confirmed") {
    const stockChanges = await order_details.findOne({ _id: statusName.id, "products.productIndex": statusName.productIndex }).lean()

    await product_details.updateOne({ productIndex: statusName.productIndex }, { $inc: { stock: "-" + stockChanges.products[0].quantity } })
  }
  console.log(statusName)
  console.log("farhan");
  if (statusName.status == "Cancelled") {
    const stockChanges = await order_details.findOne({ _id: statusName.id, "products.productIndex": statusName.productIndex }).lean()
    if(statusName.paymentType=="wallet" || statusName.paymentType=="Pay using razorpay"){
      const walletInc = await order_details.aggregate([
        {
          $match:{
            _id:new ObjectId(statusName.id)
          },
        },
        {
          $unwind:"$products"
        },
        {
          $match:{
            "products.paymentId":statusName.paymentId
          }
        }
      ])
 
      const amountAdd = walletInc[0].products.price*walletInc[0].products.quantity
      console.log(amountAdd)
      await user_details.updateOne({ username: req.session.user }, { $inc: { wallet: amountAdd } })
    }
    await product_details.updateOne({ productIndex: statusName.productIndex }, { $inc: { stock: stockChanges.products[0].quantity } })
    console.log("lookk");
  }




  res.redirect('/orderstatus')




  } catch (error) {
    console.log(error.message);
    next()
  }
}

let adminGetGetCartOrders = async function (req, res, next) {
  try {

    // let statusName = req.query
    req.session.admin.temp = mongoose.Types.ObjectId(req.params.id)

    // console.log(req.params.id);
    // console.log(req.session.admin);

    //  await order_details.updateOne({_id:statusName.id},{$set:{orderStatus:statusName.status}})
    //  console.log("success");
    res.redirect('/admincart')





  } catch (error) {
    console.log(error.message);
    next()
  }
}

let adminGetListOrderSpecific = async function (req, res, next) {
  try {

    const Ltemp = mongoose.Types.ObjectId(req.session.admin.temp)
    console.log(req.session.admin);

    let resp = await order_details.aggregate([

      {
        $match: { _id: Ltemp }
      },

      {
        $unwind: '$products'
      }
    ])
    // console.log(req.session.temp);

    // console.log(resp);


    res.render('admin-cartorders', { resp })
    // console.log(resp);



  } catch (error) {
    console.log(error.message);
    next()
  }
}


let adminGetDeleteBrand = async function (req, res, next) {
  try {

    let hi = req.query
    await brand_details.updateOne({ name: hi.name }, { $set: { status: hi.status } })

    res.redirect('/admin-addbrand')




  } catch (error) {
    console.log(error.message);
    next()
  }
}

let adminGetAddCategory = async function (req, res, next) {

  try {
      req.session.dbCategory = await category_details.find().lean()
  console.log("reached");

  res.render('admin-addcategory', { dbCategory: req.session.dbCategory });


  } catch (error) {
    console.log(error.message);
    next()
  }



}

let adminGetAddCoupon = async function (req, res, next) {

try {
   dbCoupon = await coupon_details.find().lean()
  // console.log("coupons$");

  res.render('admin-addcoupon', { dbCoupon, couponMsg });


} catch (error) {
  console.log(error.message);
  next()
}
 


}


let adminGetAddBrand = async function (req, res, next) {

  try {

    req.session.dbBrand = await brand_details.find().lean()
    // console.log(req.session.dbBrand);
    res.render('admin-addbrand', { dbBrand: req.session.dbBrand });

  } catch (error) {
    console.log(error.message);
  }

}
let adminGetAddSubCategory = async function (req, res, next) {
  try {

    req.session.dbSubcategory = await subcategory_details.find().lean()

    res.render('admin-addsubcategory', { dbSubcategory: req.session.dbSubcategory });


  } catch (error) {
    console.log(error.message);
  }

}
let adminGetAddProducts = async function (req, res, next) {
  try {


    req.session.dbBrand = await brand_details.find().lean()
    req.session.dbCategory = await category_details.find().lean()
    req.session.dbSubcategory = await subcategory_details.find().lean()
    res.render('admin-addproduct', { dbBrand: req.session.dbBrand, dbSubcategory: req.session.dbSubcategory, dbCategory: req.session.dbCategory });


  } catch (error) {
    console.log(error.message);
    next()
  }

}

let adminGetAllUsers = async function (req, res, next) {
  try {

    let users = await user_details.find().lean()
    res.render('admin-users', { users });


  } catch (error) {
    console.log(error.message);
    next()
  }

}



let adminGetBlockUsers = async function (req, res, next) {
  try {


    let id = req.params.id
    let statusCheck = await user_details.findOne({ _id: id }).lean()
    if (statusCheck == null) {
      console.log("invalid id passed");
    } else if (statusCheck.status == true) {
      const blockChecker = await user_details.updateOne({ _id: id }, { $set: { status: false } })
      console.log("blcoked");
      req.session.user=null
      res.redirect('/admin-users')
    } else {
      await user_details.updateOne({ _id: id }, { $set: { status: true } })
      console.log("unblocked");
      res.redirect('/admin-users')
    }



  } catch (error) {
    console.log(error.message);
    next()
  }


}
let adminGetDeleteUsers = async function (req, res, next) {
  try {

    let id = req.params.id;
    // console.log(id);
    await user_details.deleteOne({ _id: id })
    console.log("deleted user");
    res.redirect('/admin-users')


  } catch (error) {
    console.log(error.message);
    next()
  }
}

let adminGetEditProduct = async function (req, res, next) {
  try {

    editId = req.params.id
    // console.log(editId);
    res.redirect('/adminedit')


  } catch (error) {
    console.log(error.message);
    next()
  }
}

let adminGetEdit = async function (req, res, next) {
  try {

    console.log("good evening");
    const editValue = await product_details.findOne({ productIndex: editId })
    console.log(editValue)
    req.session.dbBrand = await brand_details.find().lean()
    req.session.dbCategory = await category_details.find().lean()
    req.session.dbSubcategory = await subcategory_details.find().lean()
    res.render('admin-editproduct', { dbBrand: req.session.dbBrand, dbCategory: req.session.dbCategory, dbSubcategory: req.session.dbSubcategory, editId, editValue, title: editValue.title, price: editValue.price, stock: editValue.stock, description: editValue.description, imageReference: editValue.imageReference })


  } catch (error) {
    console.log(error.message);
    next()
  }
}
let adminGetBanner = async function (req, res, next) {
  try {


    dbBanner = await banner_details.find().lean()
    res.render('admin-addbanner', { dbBanner })


  } catch (error) {
    console.log(error.message);
    next()
  }
}
//post requests

let adminPostAddBanner = async function (req, res, next) {
  try {

    let editBanner = {}

    editBanner.status = true

    ////////////////////////
    let ImmiId = uuidv4()
    let images = [];
    let img = req.files.image;
    let count = img.length
    console.log(count);
    if (count) {

      for (var i = 0; i < count; i++) {

        img[i].mv('public/product-images/banner/' + ImmiId + i + '.jpg', (err, done) => {
          console.log(err);
        })

        images[i] = ImmiId + i;
      }
      editBanner.imageReference = images;
    } else {
      img.mv('./public/product-images/banner/' + ImmiId + '.jpg', (err, done) => {
        console.log(err);
      })
      images[0] = ImmiId + '.jpg';
      editBanner.imageReference = images;
    }
    editBanner.category = req.body.category
    editBanner.product = req.body.product

    await banner_details.insertMany([editBanner])

    res.redirect('admin-banner')
    /////////////////////////



  } catch (error) {
    console.log(error.message);
    next()
  }
}

let adminPostEditBanner = async function (req, res, next) {
  try {

    let editBanner = {}



    ////////////////////////

    let images = [];
    let img = req.files.image;
    let editHelper = await banner_details.findOne({ _id: req.body.hid })
    // console.log(editHelper);
    img.mv('./public/product-images/banner/' + editHelper.imageReference[0], (err, done) => {
      console.log(err);
    })
    images[0] = editHelper.imageReference[0];
    editBanner.imageReference = images;

    editBanner.category = req.body.category
    editBanner.product = req.body.product

    await banner_details.updateOne({ _id: req.body.hid }, { $set: { product: req.body.product, category: req.body.category } })
    res.redirect('/admin-banner')
    /////////////////////////



  } catch (error) {
    console.log(error.message);
    next()
  }
}

let adminGetParam = async (req, res) => {
  try {
      newImg = mongoose.Types.ObjectId(req.query._id)
  console.log(newImg);
  res.redirect('/editbanner')
  } catch (error) {
    console.log(error.message);
    next()
  }


}

const adminGetEditBanner = async (req, res) => {
  try {
      let bannerEdit = await banner_details.find({ _id: newImg }).lean()
  console.log(bannerEdit);
  res.render('admin-editbanner', { bannerEdit })
  } catch (error) {
    console.log(error.message);
    next()
  }

}

let adminPostEditProduct = async function (req, res, next) {
  try {


    let editProducts = {
      title: req.body.title,
      price: req.body.price,
      category: req.body.category,
      stock: req.body.stock,

      brand: req.body.brand,
      subcategory: req.body.subcategory,
      productIndex: req.body.productindex,
      description: req.body.description
    }

    // console.log(req.body);
    let productId = editProducts.productIndex;
    // console.log(productId);

    let result = await product_details.findOne({ productIndex: productId }).lean()
    console.log(result + "this is the result");
    if (req.files) {
      function fileEdit() {

        let images = [];
        let img = req.files.image;
        let count = img.length
        console.log(count);
        if (count) {

          for (var i = 0; i < count; i++) {

            img[i].mv('public/product-images/products/' + editProducts.productIndex + i + '.jpg', (err, done) => {
              console.log(err);
            })

            images[i] = result.productIndex + i;
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
      await product_details.updateOne({ productIndex: productId }, { $set: { title: editProducts.title, price: editProducts.price, category: editProducts.category, subcategory: editProducts.subcategory, brand: editProducts.brand, stock: editProducts.stock, description: editProducts.description, imageReference: editProducts.imageReference } })

      console.log("edit success");
      res.redirect('/adminproducts')
    } else {

      await product_details.updateOne({ productIndex: productId }, { $set: { title: editProducts.title, price: editProducts.price, category: editProducts.category, subcategory: editProducts.subcategory, brand: editProducts.brand, stock: editProducts.stock, description: editProducts.description } })
      console.log("edit success");
      res.redirect('/adminproducts')
    }

  } catch (error) {
    console.log(error.message);
    next()
  }
}


const adminGetSalesReport = async (req, res) => {

try {
  if (salesParam == "day") {

    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const salesReport = await order_details.aggregate([

      {
        $unwind: "$products"
      },
      {
        $match: { "products.status": "Delivered" }
      },
      {
        $match: {
          "products.salesDate": { $gte: startOfToday, $lte: endOfToday }
        }
      }
    ])



    res.render("admin-sales", { salesReport })

  } else if (salesParam == "month") {

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);



    const salesReport = await order_details.aggregate([
      {
        $unwind: "$products"
      },
      {
        $match: { "products.status": "Delivered" }
      },
      {
        $match: {
          "products.salesDate": { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
    ])
    // console.log(salesReport);



    res.render("admin-sales", { salesReport })
  } else {
    const salesReport = await order_details.aggregate([
      {
        $unwind: "$products"
      },
      {
        $match: { "products.status": "Delivered" }
      }
    ])
    res.render("admin-sales", { salesReport })
  }
} catch (error) {
  console.log(error.message);
  next()
}
  






  // console.log(bannerEdit);
  // res.render('admin-editbanner',{bannerEdit})
}

let adminGetSalesReportParams = async (req, res) => {
  try {
      salesParam = req.params.id
  // console.log(salesParam);

  res.redirect('/admin-sales')
  } catch (error) {
    console.log(error.message);
    next()
  }






}

let adminGetDisableBanner = async (req, res) => {
try {
    // console.log(req.query);
  bannerParam = mongoose.Types.ObjectId(req.query._id)

  await banner_details.updateOne({ _id: bannerParam }, { $set: { status: req.query.status } })

  console.log("lokkkk");

  res.redirect('/admin-banner')
} catch (error) {
  console.log(error.message);
  next()
}




}

const adminDownloadSales = (req, res) => {

try {
   const url = 'http://localhost:3000/admin-sales';
  const tableId = 'my-table';

  JSDOM.fromURL(url).then(dom => {

    const table = dom.window.document.querySelector(`#${tableId}`);

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.table_to_sheet(table);

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.set('Content-Disposition', 'attachment; filename=my-table.xlsx');
    res.send(buffer);


  });

} catch (error) {
  console.log(error.message);
  next()
}

 


}






const adminPostLogin = async function (req, res, next) {
  try {
    let data = {
      username: req.body.username,
      password: req.body.password
    }
    var adminValidator = await admin_details.findOne({ username: data.username }).lean()
    if (adminValidator == null) {
      res.redirect('/admin-login')
      adminMsg = "invalid username or password"
      console.log("invalid username or password");
    } else {

      let result = await bcrypt.compare(data.password, adminValidator.password)
      console.log(result);
      if (result) {

        req.session.admin = adminValidator;

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
    next()
  }
}



let adminPostUploadProduct = async function (req, res, next) {
  try {
     let size1 = []
  size1 = req.body.size
  let colour1 = []
  colour1 = req.body.colour



  let products = {
    title: req.body.title,
    price: req.body.price,
    category: req.body.category,
    stock: req.body.stock,
    size: size1,
    colour: colour1,
    brand: req.body.brand,
    subcategory: req.body.subcategory,
    productIndex: req.body.productindex,
    description: req.body.description
  }
  console.log("hii");
  // console.log(req.body);

  async function file() {
    let images = [];
    images = req.files.image;
    let count = images.length
    console.log(count);
    if (count) {

      for (var i = 0; i < count; i++) {
       
        let path = "" + images[i].tempFilePath
        console.log(path);
        await sharp(path)
          .rotate()
          .resize(1000, 1500)
          .jpeg({ mozjpeg: true })
          .toFile('public/product-images/products/' + products.productIndex + i + '.jpg')

        images[i] = products.productIndex + i;
      }
      products.imageReference = images;
      console.log(products);
      products.uploadedDate = new Date().toDateString().slice(4);
      products.status = true;
      await product_details.insertMany([products]);
      res.redirect('/admin-products')
    } else {
      let path = "" + images.tempFilePath
      console.log(path);
      await sharp(path)
        .rotate()
        .resize(1000, 1500)
        .jpeg({ mozjpeg: true })
        .toFile('public/product-images/products/' + products.productIndex + i + '.jpg')
      images[0] = products.productIndex;
      products.imageReference = images;
      console.log(products)
      console.log("samaina");
      products.uploadedDate = new Date().toDateString().slice(4);
      products.status = true;
      await product_details.insertMany([products]);
      res.redirect('/admin-products')
    }

  }
  file()
 

  } catch (error) {
    console.log(error.message);
    next()
  }
 
}


let adminPostAddCategory = async function (req, res, next) {
  try {
    let checkCategory = await category_details.findOne({ name: req.body.category }).lean()
    console.log(req.body.category);
    console.log(checkCategory);
    if (checkCategory == null) {
      let category = {
        name: req.body.category,
      }
      category.date = new Date().toDateString().slice(4);
      console.log("category");
      category.status = true
      await category_details.insertMany([category])
      res.redirect('/admin-addcategory')

    } else {
      console.log("category already present");
      res.redirect('/admin-addcategory')
    }


  } catch (error) {
    console.log(error.message);
    next()
  }
}

let adminPostAddCoupon = async function (req, res, next) {

try {
    let coupon = req.body
  coupon.status = true
  console.log(coupon);
  let checkCoupon = await coupon_details.findOne({ code: coupon.code }).lean()
  console.log(checkCoupon);
  if (checkCoupon == null) {
    await coupon_details.insertMany([coupon])
  } else {
    couponMsg = "coupon already present"
  }


  res.redirect('/admin-coupon')



  //  res.redirect('/admin-addcategory')

  //  }else{
  //    console.log("category already present");
  //    res.redirect('/admin-addcategory')
  //  }

} catch (error) {
  console.log(error.message);
  next()
}




}

let adminPostDisableCoupon = async function (req, res, next) {

try {
   let couponParam = req.query;
  console.log(couponParam);

  await coupon_details.updateOne({ code: couponParam.code }, { $set: { status: couponParam.status } })


  res.redirect('/admin-coupon')
} catch (error) {
  console.log(error.message);
  next()
}

 
}

let adminPostAddBrand = async function (req, res, next) {
  try {

    let checkBrand = await brand_details.findOne({ name: req.body.brand }).lean()
    console.log(req.body.brand);
    console.log(checkBrand);
    if (checkBrand == null) {
      let brand = {
        name: req.body.brand,

      }
      //
      await sharp(req.file.buffer).resize({ width: 229, height: 306 }).toFile(`./public/product-images/${brand.name}-${req.file.originalname}`)
      //
      brand.date = new Date().toDateString().slice(4);
      brand.status = true;
      if (req.files == null) {
        await brand_details.insertMany([brand])
        res.redirect('/admin-addbrand')
      } else {
        let image = req.files.image;
        image.mv('./public/product-images/brand/' + brand.name + '.jpg', (err, done) => {
          console.log(err);
        })
        brand.imageReference = brand.name + '.jpg'
        console.log("brand");

        await brand_details.insertMany([brand])
        res.redirect('/admin-addbrand')
      }

    } else {
      console.log("brand already present");
      brandMsg = "brand already present"
      res.redirect('/admin-addbrand')
    }

  } catch (error) {
    console.log(error.message);
    next()
  }


}
let adminPostAddSubCategory = async function (req, res, next) {
  try {
    let checkSubCategory = await subcategory_details.findOne({ name: req.body.subcategory }).lean()
    if (checkSubCategory == null) {

      let subcategory = {
        name: req.body.subcategory,
      }

      subcategory.date = new Date().toDateString().slice(4);
      subcategory.status = true
      console.log("subcategory");
      res.redirect('/admin-addsubcategory')
      await subcategory_details.insertMany([subcategory])
    } else {
      console.log("subcategory already present");
      subcategoryMsg = "subcategory already present"
      res.redirect('/admin-addsubcategory')
    }

  } catch (error) {
    console.log(error.message);
    next()
  }

}


let adminGetLogout = function (req, res, next) {

  req.session.admin = null;
  req.session.dbBrand = null
  req.session.dbCategory = null
  req.session.dbSubcategory = null;
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
  adminPostEditProduct,
  adminGetAddCoupon,
  adminPostAddCoupon,
  adminPostDisableCoupon,
  adminGetBanner,
  adminPostAddBanner,
  adminPostEditBanner,
  adminGetParam,
  adminGetEditBanner,
  adminGetSalesReport,
  adminGetSalesReportParams,
  adminGetDisableBanner,
  adminDownloadSales,

}

