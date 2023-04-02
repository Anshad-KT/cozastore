var express = require('express');
var router = express.Router();
var nocache = require('nocache')
const middleware = require('../middleware/session')
//requiring get requests

var userGet= require('../controllers/userController')

//requiring post requests

var userPost= require('../controllers/userController')

//getRequests

router.get('/login',nocache(),middleware.verifyUserNotLogin,userGet.userGetLogin);
router.get('/signup',nocache(),middleware.verifyUserNotLogin,userGet.userGetSignup);
router.get('/otp/login',middleware.verifyUserNotLogin,userGet.userGetOtpLogin);
router.get('/otp',nocache(),middleware.verifyUserNotLogin,userGet.userGetOtp);
router.get('/home',nocache(),userGet.userGetHome);
router.get('/products',nocache(),userGet.userGetProducts);
router.get('/productsRequested/:id',userGet.userGetProductsRequested);
// router.get('/product-details/:id',userGet.userGetProductDetails);
router.get('/product-details/:id',nocache(),userGet.userGetDetails);
router.get('/filter/',userGet.userGetFilter);
router.get('/filterPrice/',userGet.userGetFilterPrice);
router.get('/logout',userGet.userGetLogout);
router.get('/deletecart/',middleware.verifyUserLogin,userGet.userGetDeleteCart);
// router.get('/profile',middleware.verifyUserLogin,userGet.userGetProfile);
router.get('/editprofile',middleware.verifyUserLogin,userGet.userGetEditProfile);
router.get('/editpassword',middleware.verifyUserLogin,userGet.userGetEditProfilePassword);
router.get('/checkout',middleware.verifyUserLogin,userGet.userGetCheckout);
router.get('/cart',middleware.verifyUserLogin,userGet.userGetCart);
router.get('/orders',middleware.verifyUserLogin,userGet.userGetOrders);
router.get('/address',middleware.verifyUserLogin,userGet.userGetAddress);
router.get('/addressparams/:id',middleware.verifyUserLogin,userGet.userGetAddressParams);
router.get('/addressparamsdelete/:id',middleware.verifyUserLogin,userGet.userGetDeleteAddressParams);
router.get('/deleteorder/',middleware.verifyUserLogin,userGet.userGetDeleteOne);
router.get('/wishlist',middleware.verifyUserLogin,userGet.userGetWishlist);
router.get('/orders-list',middleware.verifyUserLogin,userGet.userGetOrdersList);
router.get('/user-orderparam/:id',middleware.verifyUserLogin,userGet.userGetOrderParam);
router.get('/confirm',middleware.verifyUserLogin,userGet.userGetOrderConfirm)





//postRequests
router.post('/applyhelo',middleware.verifyUserLogin,userGet.userGetApplyCoupon);
router.post('/verify-payment',middleware.verifyUserLogin,userGet.userVerifyPayment);
router.post('/logincheck',userPost.userPostLogin);
router.post('/search',userPost.userPostSearch);
router.post('/signupcheck',userPost.userPostSignup);
router.post('/otplogincheck',userPost.userPostOtpLogin);
router.post('/otpcheck',userPost.userPostOtp);
router.post('/editprofiles',middleware.verifyUserLogin,userPost.userPostEditProfile);
router.post('/editpassword',middleware.verifyUserLogin,userPost.userPostEditPassword);
router.post('/cartProducts',middleware.verifyUserLogin,userPost.userPostCartOperation);
router.post('/checkoutbilling',middleware.verifyUserLogin,userGet.userPostCheckoutBilling);
router.post('/change-product-quantity',middleware.verifyUserLogin,userGet.userPostChangeQuantity);
router.post('/editaddress',middleware.verifyUserLogin,userGet.userPostAddAddress);
router.post('/addtowishlist',middleware.verifyUserLogin,userGet.userPostAddWishlist);
router.post('/deletewishlist',middleware.verifyUserLogin,userGet.userPostDeleteWishlist);
router.get('/defaultaddress/:id',middleware.verifyUserLogin,userGet.userPostAddDefaultAddress);






module.exports = router;
