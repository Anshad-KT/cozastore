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
router.get('/filter/',userGet.userGetFilter);
router.get('/filterPrice/',userGet.userGetFilterPrice);
router.get('/logout',userGet.userGetLogout);
router.get('/deletecart/',userGet.userGetDeleteCart);
router.get('/profile',userGet.userGetProfile);
router.get('/editprofile',userGet.userGetEditProfile);
router.get('/editpassword',userGet.userGetEditProfilePassword);
router.get('/checkout',userGet.userGetCheckout);
router.get('/cart',userGet.userGetCart);
router.get('/orders',userGet.userGetOrders);
router.get('/address',userGet.userGetAddress);
router.get('/addressparams/:id',userGet.userGetAddressParams);
router.get('/addressparamsdelete/:id',userGet.userGetDeleteAddressParams);
router.get('/deleteorder/',userGet.userGetDeleteOne);
router.get('/wishlist',userGet.userGetWishlist);
router.get('/orders-list',userGet.userGetOrdersList);
router.get('/user-orderparam/:id',userGet.userGetOrderParam);





//postRequests
router.post('/applyhelo',userGet.userGetApplyCoupon);
router.post('/verify-payment',userGet.userVerifyPayment);
router.post('/logincheck',userPost.userPostLogin);
router.post('/search',userPost.userPostSearch);
router.post('/signupcheck',userPost.userPostSignup);
router.post('/otplogincheck',userPost.userPostOtpLogin);
router.post('/otpcheck',userPost.userPostOtp);
router.post('/editprofiles',userPost.userPostEditProfile);
router.post('/editpassword',userPost.userPostEditPassword);
router.post('/cartProducts',userPost.userPostCartOperation);
router.post('/checkoutbilling',userGet.userPostCheckoutBilling);
router.post('/change-product-quantity',userGet.userPostChangeQuantity);
router.post('/editaddress',userGet.userPostAddAddress);
router.post('/addtowishlist',userGet.userPostAddWishlist);
router.post('/deletewishlist',userGet.userPostDeleteWishlist);






module.exports = router;
