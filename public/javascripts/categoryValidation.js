function categoryValidate() {
 
    const category = document.categoryform.category.value;
    const nameRegex =/^\s*([a-zA-Z]+\s*){1,3}$/
 

    const err = document.getElementById("error");

    if (category == "") {
        err.innerHTML = 'category is Empty';
           
        return false;
    }
    if(nameRegex.test(category)==false){
        err.innerHTML = 'Invalid category'
        return false
    }
    if (category.length < 3) {
        err.innerHTML = 'category must be morethan 3';
        return false
    }
   
   
    return true;

} 