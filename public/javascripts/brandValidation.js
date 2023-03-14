function brandValidate() {
 
    const brand = document.brandform.brand.value;
    const brandImage = document.brandform.image.value;
    const nameRegex =/^\s*([a-zA-Z]+\s*){1,3}$/
    const err = document.getElementById("error");

    if(brand == ""){
        err.innerHTML = 'brand is empty';
        return false
    }

    if(nameRegex.test(brand)==false){
        err.innerHTML = 'Invalid brand'
        return false
    }

    if (brand.length < 3) {
        err.innerHTML = 'brand must be morethan 3';
        return false
    }
   
    
  
 
 
   
    return true;

} 