var express = require('express');
var router = express.Router();
var nocache = require('nocache')

//requiring get requests

var userGet= require('../controllers/userController')

//requiring post requests

var userPost= require('../controllers/userController')

//getRequests

router.get('/login',nocache(),userGet.userGetLogin);
router.get('/signup',nocache(),userGet.userGetSignup);
router.get('/otp/login',userGet.userGetOtpLogin);
router.get('/otp',nocache(),userGet.userGetOtp);
router.get('/home',nocache(),userGet.userGetHome);
router.get('/products',nocache(),userGet.userGetProducts);
router.get('/productsRequested/:id',userGet.userGetProductsRequested);
router.get('/product-details/:id',userGet.userGetProductDetails);
router.get('/product-details',nocache(),userGet.userGetDetails);
router.get('/filter/:id',userGet.userGetFilter);
router.get('/logout',userGet.userGetLogout);
router.get('/deletecart/:id',userGet.userGetDeleteCart);

router.get('/profile',userGet.userGetProfile);
router.get('/editprofile',userGet.userGetEditProfile);
router.get('/editpassword',userGet.userGetEditProfilePassword);
router.get('/checkout',userGet.userGetCheckout);
router.get('/cart',userGet.userGetCart);
router.get('/orders',userGet.userGetOrders);
// router.get('/cartupload/:id',userGet.userGetCartParams);
router.get('/deleteorder/',userGet.userGetDeleteOne);



//postRequests

router.post('/logincheck',userPost.userPostLogin);
router.post('/signupcheck',userPost.userPostSignup);
router.post('/otplogincheck',userPost.userPostOtpLogin);
router.post('/otpcheck',userPost.userPostOtp);
router.post('/editprofiles',userPost.userPostEditProfile);
router.post('/editpassword',userPost.userPostEditPassword);
router.post('/cartProducts',userPost.userPostCartOperation);
router.post('/checkoutbilling',userGet.userPostCheckoutBilling);
router.post('/change-product-quantity',userGet.userPostChangeQuantity);
router.post('/editaddress',userGet.userPostAddAddress);
router.get('/address',userGet.userGetAddress);
router.get('/addressparams/:id',userGet.userGetAddressParams);



///


module.exports = router;
