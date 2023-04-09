const user_details = require("../models/userModel");

const verifyAdminLogin = (req,res,next)=>{
    if(req.session.admin){
       
        next();
    }else{
        
        res.redirect('/admin-login')
    }
}

const verifyAdminNotLogin = (req,res,next)=>{
    if(req.session.admin){
       
        res.redirect('/admin');
    }else{   
        console.log(req.session.admin)
        next();
    }
}


const verifyUserLogin = async(req,res,next)=>{
    if(req.session.user){
        const checkBlock = await user_details.findOne({username:req.session.user})
        console.log(checkBlock.status);
        if(checkBlock.status==false){
            res.redirect('/login')
            req.session.user=null
        }else{
            next();
    }
    }else{   
        res.redirect('/login')
    }
}


const verifyUserNotLogin = (req,res,next)=>{
    if(req.session.user){
       
              res.redirect("/");
     
      
    }else{   
        next();
    }
}

module.exports={verifyAdminLogin,verifyAdminNotLogin,verifyUserLogin,verifyUserNotLogin}
