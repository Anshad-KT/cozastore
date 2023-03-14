function checkoutValidate(){
    // const name = document.sub.name.value;
    // const email = document.sub.email.value;
    // const phone = document.sub.phone.value;
    // const username = document.sub.username.value;
    const housename = document.sub.housename.value;
    const postalname = document.sub.postalname.value;
    const pincode = document.sub.pincode.value;
    const district = document.sub.district.value;
    const state = document.sub.state.value;
    const country = document.sub.country.value;
    const nameRegex =/^\s*([a-zA-Z]+\s*){1,3}$/
    const emailRegx = /^(\w){3,16}@([A-Za-z]){5,8}.([A-Za-z]){2,3}$/gm
    const passwordRegx = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/
    const err = document.getElementById("error-message");

    // if (username == "") {
    //     err.innerHTML = 'username is Empty';
    //     return false;
    // }
    // if (username.length < 5) {
    //     err.innerHTML = 'username must be morethan 5';
    //     return false
    // }
    // if (name == "") {
    //     err.innerHTML = 'The Name is Empty'

    //     return false;
    // }
    // if(nameRegex.test(name)==false){
    //     err.innerHTML = 'Invalid name'
    //     return false
    // }
    // if (name.length < 3) {
    //     err.innerHTML = 'Name must be Contain 3 Elements Please Include Fullname';
    //     return false;
    // }

    // if (email == "") {
    //     err.innerHTML = 'Email is Empty';
    //     return false;
    // }

    // if (emailRegx.test(email) == false) {
    //     err.innerHTML = 'Invalid Email'
    //     return false
    // }

    // if (phone == "") {
    //     err.innerHTML = 'The phone is Empty'

    //     return false;
    // }
    // if (phone.length < 10 || phone.length > 13) {
    //     err.innerHTML = 'invalid phone Number';
    //     return false;
    // }
    
    if (housename == "") {
        err.innerHTML = 'Housename is Empty'

        return false;
    }
    if (housename.length < 3) {
        err.innerHTML = 'houseame must be Contain 3 Elements ';
        return false;
    }
    if (postalname == "") {
        err.innerHTML = 'Postalname is Empty'

        return false;
    }
    if (postalname.length < 3) {
        err.innerHTML = 'Postalname must be Contain 3 Elements';
        return false;
    }
    if (pincode == "") {
        err.innerHTML = 'pincode is Empty'

        return false;
    }
    if (pincode.length < 3) {
        err.innerHTML = 'pincode must be Contain 3 Elements ';
        return false;
    }
    // d
    if (district == "") {
        err.innerHTML = 'District is Empty'

        return false;
    }
    if (district.length < 3) {
        err.innerHTML = 'District must be Contain 3 Elements';
        return false;
    }
    if (state == "") {
        err.innerHTML = 'State is Empty'

        return false;
    }
    if (state.length < 3) {
        err.innerHTML = 'state must be Contain 3 Elements ';
        return false;
    }
    if (country == "") {
        err.innerHTML = 'Country is Empty'

        return false;
    }
    if (country.length < 3) {
        err.innerHTML = 'Country must be Contain 3 Elements ';
        return false;
    }
   
    return true;

}