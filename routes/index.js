var express = require('express');
const nocache = require('nocache');
var router = express.Router();
const { v4: uuidv4 } = require('uuid')
const multer  = require('multer')


let admin = require('../controllers/adminController')
const middleware = require('../middleware/auth')
const multerConfig = require('../middleware/muterConfigurations')

/* GET home page. */
router.get('/admin',nocache(),middleware.verifyAdminLogin,admin.adminGetDashboard);
router.get('/adminproducts',nocache(),middleware.verifyAdminLogin,admin.adminGetAllProducts);
router.get('/admin-add',nocache(),middleware.verifyAdminLogin,admin.adminGetAddProducts);
router.get('/admin-login',nocache(),middleware.verifyAdminNotLogin,admin.adminGetLogin)
router.get('/admin-users',nocache(),middleware.verifyAdminLogin,admin.adminGetAllUsers)
router.get('/block/:id',middleware.verifyAdminLogin,admin.adminGetBlockUsers);
router.get('/delete/:id',middleware.verifyAdminLogin,admin.adminGetDeleteUsers);
router.get('/admin-addcategory/',nocache(),middleware.verifyAdminLogin,admin.adminGetAddCategory);
router.get('/admin-addbrand/',nocache(),middleware.verifyAdminLogin,admin.adminGetAddBrand);
router.get('/admin-addsubcategory/',nocache(),middleware.verifyAdminLogin,admin.adminGetAddSubCategory);
router.get('/deletecategory/',middleware.verifyAdminLogin,admin.adminGetDeleteCategory)
router.get('/deletesubcategory/',middleware.verifyAdminLogin,admin.adminGetDeleteSubCategory)
router.get('/deletebrand/',middleware.verifyAdminLogin,admin.adminGetDeleteBrand)
router.get('/logout-admin',admin.adminGetLogout)
router.get('/deleteproduct/',middleware.verifyAdminLogin,admin.adminGetDeleteProduct)
router.get('/orderstatus',middleware.verifyAdminLogin,admin.adminGetOrderStatus)
router.get('/status/',middleware.verifyAdminLogin,admin.adminGetSetOrderStatus)
router.get('/admin-cart/:id',admin.adminGetGetCartOrders)
router.get('/admincart',middleware.verifyAdminLogin,admin.adminGetListOrderSpecific)
router.get('/editproduct/:id',middleware.verifyAdminLogin,admin.adminGetEditProduct)
router.get('/adminedit/',middleware.verifyAdminLogin,admin.adminGetEdit)
router.get('/admin-banner',middleware.verifyAdminLogin,admin.adminGetBanner)
router.get('/admin-coupon/',middleware.verifyAdminLogin,admin.adminGetAddCoupon)
router.get('/editbannerparam/',middleware.verifyAdminLogin,admin.adminGetParam)
router.get('/editbanner',middleware.verifyAdminLogin,admin.adminGetEditBanner)
router.get('/deletecoupon/',middleware.verifyAdminLogin,admin.adminPostDisableCoupon)
router.get('/admin-sales',middleware.verifyAdminLogin,admin.adminGetSalesReport)
router.get('/sales/:id',middleware.verifyAdminLogin,admin.adminGetSalesReportParams)
router.get('/disablebanner/',middleware.verifyAdminLogin,admin.adminGetDisableBanner)
router.get('/download-excel',middleware.verifyAdminLogin,admin.adminDownloadSales);
  

//Post home page

router.post('/adminlogin',admin.adminPostLogin)
router.post('/upload',middleware.verifyAdminLogin,multerConfig.upload.array('image'),admin.adminPostUploadProduct)
router.post('/brand',middleware.verifyAdminLogin,multerConfig.brandConfiguration.array('image'),admin.adminPostAddBrand)
router.post('/category',middleware.verifyAdminLogin,admin.adminPostAddCategory)
router.post('/coupon',middleware.verifyAdminLogin,admin.adminPostAddCoupon)
router.post('/subcategory',middleware.verifyAdminLogin,admin.adminPostAddSubCategory)
router.post('/editProduct',middleware.verifyAdminLogin,admin.adminPostEditProduct)
router.post('/editImage',middleware.verifyAdminLogin,multerConfig.upload.array('image'),admin.adminPostEditImage)
router.post('/banner',middleware.verifyAdminLogin,multerConfig.bannerConfiguration.array('image'),admin.adminPostAddBanner)
router.post('/editbannerpost',middleware.verifyAdminLogin,admin.adminPostEditBanner)
router.get('/deleteimage/',middleware.verifyAdminLogin,admin.adminDeleteImage)



module.exports = router;
