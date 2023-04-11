// const express = require('express')
// const app = express()
const multer = require('multer')
const path =require('path')
// app.use(express.static(path.join(__dirname,'public')))
const bodyParser =require('body-parser')

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./public/product-images/products/')
    },
    filename:function(req,file,cb){
        const name =Date.now()+"-"+file.originalname
        cb(null,name)
    }
})
const upload =multer({storage:storage})

const storage1 = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./public/product-images/banner/')
    },
    filename:function(req,file,cb){
        const name =Date.now()+"-"+file.originalname
        cb(null,name)
    }
})

const bannerConfiguration =multer({storage:storage1})

const storage2 = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./public/product-images/brand/')
    },
    filename:function(req,file,cb){
        const name =Date.now()+"-"+file.originalname
        cb(null,name)
    }
})
const brandConfiguration =multer({storage:storage2})
module.exports={upload,brandConfiguration,bannerConfiguration}