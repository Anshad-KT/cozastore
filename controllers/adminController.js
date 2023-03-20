let admin_details = require('../models/adminModel')
let user_details = require('../models/userModel')
let bcrypt = require('bcrypt');
let newImg
const fileUpload = require('express-fileupload')
const product_details = require('../models/productModel')
const brand_details = require('../models/brandModel')
const category_details = require('../models/categoryModel')
const subcategory_details = require('../models/subcategoryModel')
const order_details = require('../models/orderModel')
const banner_details = require('../models/bannerModel')
const coupon_details = require('../models/couponModel')
var mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')
const sharp = require('sharp')

let dbBrand;

let dbSubcategory;
let dbCategory
let adminSession
let adminMsg
let editId
let temp
let couponMsg
let salesParam

let adminGetAllProducts = async function (req, res, next) {
  try {
    if (adminSession) {
      let products = await product_details.find().lean()

      res.render('admin-products', { products });
    } else {
      res.redirect('/admin-login')
    }
  } catch (error) {
    console.log(error.message);
  }

}
let adminGetDashboard = async function (req, res, next) {
  if (adminSession) {
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
  } else {
    res.redirect('/admin-login')
  }

}

let adminGetLogin = function (req, res, next) {
  if (adminSession) {

    res.redirect('/admin');

  } else {

    res.render('admin-login', { adminMsg });
    adminMsg = null;
  }

}

let adminGetDeleteCategory = async function (req, res, next) {
  try {
    if (adminSession) {

      let name = req.query
      await category_details.updateOne({ name: name.name }, { $set: { status: name.status } })
      res.redirect('/admin-addcategory')

    } else {

      res.redirect('/admin-login')

    }


  } catch (error) {
    console.log(error.message);
  }
}

let adminGetDeleteSubCategory = async function (req, res, next) {
  try {
    if (adminSession) {
      let name = req.query
      await subcategory_details.updateOne({ name: name.name }, { $set: { status: name.status } })

      res.redirect('/admin-addsubcategory')
    } else {
      res.redirect('/admin-login')
    }

  } catch (error) {
    console.log(error.message);
  }
}

let adminGetDeleteProduct = async function (req, res, next) {
  try {
    if (adminSession) {

      let que = req.query



      await product_details.updateOne({ productIndex: que.productIndex }, { $set: { status: que.status } })

      console.log("delete success");

      res.redirect('/adminproducts')

    } else {

      res.redirect('/admin-login')

    }

  } catch (error) {
    console.log(error.message);
  }
}

let adminGetOrderStatus = async function (req, res, next) {
  try {
    if (adminSession) {
      let orders = await order_details.find().lean()

      for (var i = 0; i < orders.length; i++) {
        if (orders[i].products.status == "Pending") {
          orders[i].yellow = true;
          orders[i].green = false;
          orders[i].red = false;
        } else if (orders[i].products.status == "Delivered") {
          orders[i].yellow = false;
          orders[i].green = true;
          orders[i].red = false;

        } else if (orders[i].products.status == "Cancelled") {
          orders[i].red = true;
          orders[i].yellow = false;
          orders[i].green = false;
        }

      }


      res.render('admin-orderstatus', { orders })
    } else {
      res.redirect('/admin-login')
    }

  } catch (error) {
    console.log(error.message);
  }
}

let adminGetSetOrderStatus = async function (req, res, next) {
  try {
    if (adminSession) {
      let statusName = req.query

      await order_details.updateOne({ _id: statusName.id, "products.productIndex": statusName.productIndex }, { $set: { "products.$.status": statusName.status } })

      let pId = uuidv4()

      if (statusName.status == "Delivered") {

        let statusChecking = await order_details.findOne({ _id: statusName.id, "products.productIndex": statusName.productIndex }).lean()

        if (statusChecking.paymentType == "cash on delivery") {


          await order_details.updateOne({ _id: statusName.id, "products.productIndex": statusName.productIndex }, { $set: { "products.$.paymentId": pId } })



        }

        const changedDate = new Date().toDateString().slice(4)

        await order_details.updateOne({ _id: statusName.id, "products.productIndex": statusName.productIndex }, { $set: { "deliveryDate": changedDate } })
        const salesDate=new Date()
        await order_details.updateOne({ _id: statusName.id, "products.productIndex": statusName.productIndex }, { $set: { "products.$.salesDate": salesDate } })

        let stockChanges = await order_details.findOne({ _id: statusName.id, "products.productIndex": statusName.productIndex }).lean()

        await product_details.updateOne({ productIndex: statusName.productIndex }, { $inc: { stock: "-" + stockChanges.products[0].quantity } })
      }



      res.redirect('/orderstatus')
    } else {
      res.redirect('/admin-login')
    }



  } catch (error) {
    console.log(error.message);
  }
}

let adminGetGetCartOrders = async function (req, res, next) {
  try {
    if (adminSession) {
      // let statusName = req.query
      temp = mongoose.Types.ObjectId(req.params.id)

      //  await order_details.updateOne({_id:statusName.id},{$set:{orderStatus:statusName.status}})
      //  console.log("success");
      res.redirect('/admincart')

    } else {
      res.redirect('/admin-login')
    }



  } catch (error) {
    console.log(error.message);
  }
}

let adminGetListOrderSpecific = async function (req, res, next) {
  try {
    if (adminSession) {



      let resp = await order_details.aggregate([

        {
          $match: { _id: temp }
        },

        {
          $unwind: '$products'
        }
      ])

      for (var i = 0; i < resp.length; i++) {
        if (resp[i].products.status == "Pending") {
          resp[i].yellow = true;
          resp[i].green = false;
          resp[i].red = false;
        } else if (resp[i].products.status == "Delivered") {
          resp[i].yellow = false;
          resp[i].green = true;
          resp[i].red = false;
        } else if (resp[i].products.status == "Cancelled") {
          resp[i].red = true;
          resp[i].yellow = false;
          resp[i].green = false;
        }

      }
      console.log("This is resp");


      res.render('admin-cartorders', { resp })
    } else {
      res.redirect('/admin-login')
    }



  } catch (error) {
    console.log(error.message);
  }
}


let adminGetDeleteBrand = async function (req, res, next) {
  try {
    if (adminSession) {
      let hi = req.query
      await brand_details.updateOne({ name: hi.name }, { $set: { status: hi.status } })

      res.redirect('/admin-addbrand')
    } else {
      res.redirect('/admin-login')
    }



  } catch (error) {
    console.log(error.message);
  }
}

let adminGetAddCategory = async function (req, res, next) {
  try {
    if (adminSession) {
      dbCategory = await category_details.find().lean()
      console.log("reached");

      res.render('admin-addcategory', { dbCategory });
    } else {
      res.redirect('/admin-login')
    }

  } catch (error) {
    console.log(error.message);
  }

}

let adminGetAddCoupon = async function (req, res, next) {
  try {
    if (adminSession) {
      dbCoupon = await coupon_details.find().lean()
      // console.log("coupons$");

      res.render('admin-addcoupon', { dbCoupon, couponMsg });
    } else {
      res.redirect('/admin-login')
    }

  } catch (error) {
    console.log(error.message);
  }

}


let adminGetAddBrand = async function (req, res, next) {

  try {
    if (adminSession) {
      dbBrand = await brand_details.find().lean()
      console.log(dbBrand);
      res.render('admin-addbrand', { dbBrand });
    } else {
      res.redirect('/admin-login')
    }
  } catch (error) {
    console.log(error.message);
  }

}
let adminGetAddSubCategory = async function (req, res, next) {
  try {
    if (adminSession) {
      dbSubcategory = await subcategory_details.find().lean()

      res.render('admin-addsubcategory', { dbSubcategory });
    } else {
      res.redirect('/admin-login')
    }

  } catch (error) {
    console.log(error.message);
  }

}
let adminGetAddProducts = async function (req, res, next) {
  try {
    if (adminSession) {

      dbBrand = await brand_details.find().lean()
      dbCategory = await category_details.find().lean()
      dbSubcategory = await subcategory_details.find().lean()
      res.render('admin-addproduct', { dbBrand, dbSubcategory, dbCategory });
    } else {
      res.redirect('/admin-login')
    }

  } catch (error) {
    console.log(error.message);
  }

}

let adminGetAllUsers = async function (req, res, next) {
  try {
    if (adminSession) {
      let users = await user_details.find().lean()
      res.render('admin-users', { users });
    } else {
      res.redirect('/admin-login')
    }

  } catch (error) {
    console.log(error.message);
  }

}



let adminGetBlockUsers = async function (req, res, next) {
  try {

    if (adminSession) {
      let id = req.params.id
      let statusCheck = await user_details.findOne({ _id: id }).lean()
      if (statusCheck == null) {
        console.log("invalid id passed");
      } else if (statusCheck.status == true) {
        await user_details.updateOne({ _id: id }, { $set: { status: false } })
        console.log("blcoked");
        res.redirect('/admin-users')
      } else {
        await user_details.updateOne({ _id: id }, { $set: { status: true } })
        console.log("unblocked");
        res.redirect('/admin-users')
      }
    } else {
      res.redirect('/admin-login')
    }


  } catch (error) {
    console.log(error.message);
  }


}
let adminGetDeleteUsers = async function (req, res, next) {
  try {
    if (adminSession) {
      let id = req.params.id;
      console.log(id);
      await user_details.deleteOne({ _id: id })
      console.log("deleted user");
      res.redirect('/admin-users')
    } else {
      res.redirect('/admin-login')
    }

  } catch (error) {
    console.log(error.message);
  }
}

let adminGetEditProduct = async function (req, res, next) {
  try {
    if (adminSession) {
      editId = req.params.id
      console.log(editId);
      res.redirect('/adminedit')
    } else {
      res.redirect('/admin-login')
    }

  } catch (error) {
    console.log(error.message);
  }
}

let adminGetEdit = async function (req, res, next) {
  try {
    if (adminSession) {
      console.log("hi");
      dbBrand = await brand_details.find().lean()
      dbCategory = await category_details.find().lean()
      dbSubcategory = await subcategory_details.find().lean()
      res.render('admin-editproduct', { dbBrand, dbCategory, dbSubcategory, editId })
    } else {
      res.redirect('/admin-login')
    }

  } catch (error) {
    console.log(error.message);
  }
}
let adminGetBanner = async function (req, res, next) {
  try {
    if (adminSession) {


      dbBanner = await banner_details.find().lean()
      res.render('admin-addbanner', { dbBanner })
    } else {
      res.redirect('/admin-login')
    }

  } catch (error) {
    console.log(error.message);
  }
}
//post requests

let adminPostAddBanner = async function (req, res, next) {
  try {
    if (adminSession) {
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

    } else {
      res.redirect('/admin-login')
    }

  } catch (error) {
    console.log(error.message);
  }
}

let adminPostEditBanner = async function (req, res, next) {
  try {
    if (adminSession) {

      let editBanner = {}



      ////////////////////////

      let images = [];
      let img = req.files.image;
      let editHelper = await banner_details.findOne({ _id: req.body.hid })
      console.log(editHelper);
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

    } else {
      res.redirect('/admin-login')
    }

  } catch (error) {
    console.log(error.message);
  }
}

let adminGetParam = async (req, res) => {
  newImg = mongoose.Types.ObjectId(req.query._id)
  console.log(newImg);
  res.redirect('/editbanner')

}

const adminGetEditBanner = async (req, res) => {
  let bannerEdit = await banner_details.find({ _id: newImg }).lean()
  console.log(bannerEdit);
  res.render('admin-editbanner', { bannerEdit })
}

let adminPostEditProduct = async function (req, res, next) {
  try {
    if (adminSession) {

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

      console.log(req.body);
      let productId = editProducts.productIndex;
      console.log(productId);

      let result = await product_details.findOne({ productIndex: productId }).lean()
      console.log(result + "this is the result");
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
      res.redirect('/admin-login')
    }

  } catch (error) {
    console.log(error.message);
  }
}


const adminGetSalesReport = async (req, res) => {
  if (adminSession) {

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
          $match:{
            "products.salesDate":{ $gte: startOfToday, $lte: endOfToday }
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
          $match:{
            "products.salesDate":{ $gte: startOfMonth, $lte: endOfMonth }
          }
        }, 
      ])
      console.log(salesReport);


      
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




  } else {
    res.redirect('/admin-login')
  }

  // console.log(bannerEdit);
  // res.render('admin-editbanner',{bannerEdit})
}

let adminGetSalesReportParams = async (req, res) => {
  if (adminSession) {

    salesParam = req.params.id
    console.log(salesParam);

    res.redirect('/admin-sales')

  } else {
    res.redirect('/admin-login')
  }


}



let adminPostLogin = async function (req, res, next) {
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

        req.session.admin = adminValidator.username;
        adminSession = req.session.admin;
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
  console.log(req.body);






  function file() {
    let images = [];
    let img = req.files.image;
    let count = img.length
    console.log(count);
    if (count) {

      for (var i = 0; i < count; i++) {
        img[i].mv('public/product-images/products/' + products.productIndex + i + '.jpg', (err, done) => {
          console.log(err);
        })

        images[i] = products.productIndex + i;
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
  products.uploadedDate = new Date().toDateString().slice(4);
  products.status = true;
  await product_details.insertMany([products]);
  res.redirect('/admin-addcategory')

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
    error.message
  }
}

let adminPostAddCoupon = async function (req, res, next) {


  if (adminSession) {
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


    res.json({ status: true })
  } else {
    res.redirect('/admin')
  }


  //  res.redirect('/admin-addcategory')

  //  }else{
  //    console.log("category already present");
  //    res.redirect('/admin-addcategory')
  //  }



}

let adminPostDisableCoupon = async function (req, res, next) {


  if (adminSession) {
    let couponParam = req.query;
    console.log(couponParam);

    await coupon_details.updateOne({ code: couponParam.code }, { $set: { status: couponParam.status } })


    res.redirect('/admin-coupon')
  } else {
    res.redirect('/admin')
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
      res.redirect('/admin-addbrand')
    }

  } catch (error) {
    console.log(error.message);
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
      res.redirect('/admin-addsubcategory')
    }

  } catch (error) {
    console.log(error.message);
  }

}


let adminGetLogout = function (req, res, next) {

  req.session.admin = null;
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
  adminGetSalesReportParams

}

