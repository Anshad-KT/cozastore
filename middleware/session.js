const verifyAdminLogin = (req,res,next)=>{
    if(req.session.admin){
        console.log("poda");
        next();
    }else{
        res.redirect('/admin-login')
    }
}

const verifyAdminNotLogin = (req,res,next)=>{
    if(req.session.admin){
        res.redirect('/admin');
    }else{   
        next();
    }
}


const verifyUserLogin = (req,res,next)=>{
    if(req.session.user){
        next();
    }else{   
        res.redirect('/login')
    }
}


const verifyUserNotLogin = (req,res,next)=>{
    if(req.session.user){
        res.redirect("/home");
    }else{   
        next();
    }
}

module.exports={verifyAdminLogin,verifyAdminNotLogin,verifyUserLogin,verifyUserNotLogin}
