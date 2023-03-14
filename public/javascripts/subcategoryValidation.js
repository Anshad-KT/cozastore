function subcategoryValidate() {
 
    const subcategory = document.subcategoryform.subcategory.value;
    
    const nameRegex =/^\s*([a-zA-Z]+\s*){1,3}$/

    const err = document.getElementById("error");

    if (subcategory == "") {
        err.innerHTML = 'subcategory is mpty';
           
        return false;
    }
    if(nameRegex.test(subcategory)==false){
        err.innerHTML = 'Invalid subcategory'
        return false
    }
    if (subcategory.length < 3) {
        err.innerHTML = 'subcategory must be morethan 3';
        return false
    }
   
   
    return true;

} 