function productValidate() {

    const title = document.products.title.value;
    
    const price = document.products.price.value;
    
    const category = document.products.category.value;
    
    const stock = document.products.stock.value;
    
    const brand = document.products.brand.value;    
    const image = document.products.image.value;
    
    const productindex = document.products.productindex.value;
    
   // const date = document.products.date.value;
    
    // const subcategory = document.products.subcategory.value;

    const description = document.products.description.value;
    

    const err = document.getElementById("error-message");
    if (title == "") {
        err.innerHTML = 'title is Empty';
           
        return false;
    }
 
    if (title.length < 3) {
        err.innerHTML = 'title must be morethan 5';
        return false
    }
    if (price == "") {
        err.innerHTML = 'Price is Empty'

        return false;
    }

    if (isNaN(price)) {
        err.innerHTML = 'price must be digits'

        return false;
    }

    if (stock == "") {
        err.innerHTML = 'stock is Empty'

        return false;
    }
    if (isNaN(stock)) {
        err.innerHTML = 'stock must be digits'

        return false;
    }
    if (category == "") {
        err.innerHTML = 'category is Empty';
        return false;
    }



   
    if (brand == "") {
        err.innerHTML = 'brand is Empty'

        return false;
    }
    // if (subcategory == "") {

    //     err.innerHTML = 'subcategory is ddEmpty'

    //     return false;
    // }
    // var count = image.length
    if (image == "") {
        err.innerHTML = 'image is empty'

        return false;
    }
    if (image.count>3) {
        err.innerHTML = 'only 3 images allowed'

        return false;
    }

    if (productindex == "") {
        err.innerHTML = 'productIindex is Empty'

        return false;
    }

    if (description == "") {
        err.innerHTML = 'description is Empty'

        return false;
    }

    if (description.length <10) {
        err.innerHTML = 'description is too low'

        return false;
    }


   
    return true;

} 