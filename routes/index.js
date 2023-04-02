var express = require('express');
const nocache = require('nocache');
var router = express.Router();
const { v4: uuidv4 } = require('uuid')
const multer  = require('multer')
const storage = multer.memoryStorage()
const upload = multer({storage})

let admin= require('../controllers/adminController')

/* GET home page. */
router.get('/admin',nocache(),admin.adminGetDashboard);
router.get('/adminproducts',nocache(),admin.adminGetAllProducts);
router.get('/admin-add',nocache(),admin.adminGetAddProducts);
router.get('/admin-login',nocache(),admin.adminGetLogin)
router.get('/admin-users',nocache(),admin.adminGetAllUsers)
router.get('/block/:id',admin.adminGetBlockUsers);
router.get('/delete/:id',admin.adminGetDeleteUsers);
router.get('/admin-addcategory',nocache(),admin.adminGetAddCategory);
router.get('/admin-addbrand',nocache(),admin.adminGetAddBrand);
router.get('/admin-addsubcategory',nocache(),admin.adminGetAddSubCategory);
router.get('/deletecategory/',admin.adminGetDeleteCategory)
router.get('/deletesubcategory/',admin.adminGetDeleteSubCategory)
router.get('/deletebrand/',admin.adminGetDeleteBrand)
router.get('/logout-admin',admin.adminGetLogout)
router.get('/deleteproduct/',admin.adminGetDeleteProduct)
router.get('/orderstatus',admin.adminGetOrderStatus)
router.get('/status/',admin.adminGetSetOrderStatus)
router.get('/admin-cart/:id',admin.adminGetGetCartOrders)
router.get('/admincart',admin.adminGetListOrderSpecific)
router.get('/editproduct/:id',admin.adminGetEditProduct)
router.get('/adminedit',admin.adminGetEdit)
router.get('/admin-banner',admin.adminGetBanner)
router.get('/admin-coupon',admin.adminGetAddCoupon)
router.get('/editbannerparam/',admin.adminGetParam)
router.get('/editbanner',admin.adminGetEditBanner)
router.get('/deletecoupon/',admin.adminPostDisableCoupon)
router.get('/admin-sales',admin.adminGetSalesReport)
router.get('/sales/:id',admin.adminGetSalesReportParams)
router.get('/disablebanner/',admin.adminGetDisableBanner)
router.get('/download-excel',admin.adminDownloadSales);
  

//Post home page

router.post('/adminlogin',admin.adminPostLogin)
router.post('/upload',admin.adminPostUploadProduct)
router.post('/brand',upload.array('image', 12),admin.adminPostAddBrand)
router.post('/category',admin.adminPostAddCategory)
router.post('/coupon',admin.adminPostAddCoupon)
router.post('/subcategory',admin.adminPostAddSubCategory)
router.post('/editProduct',admin.adminPostEditProduct)
router.post('/banner',admin.adminPostAddBanner)
router.post('/editbannerpost',admin.adminPostEditBanner)



module.exports = router;
