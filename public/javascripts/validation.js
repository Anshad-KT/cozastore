function validateform(){
    const nameRegex =/^\s*([a-zA-Z]+\s*){1,3}$/
    const usernameRegex=/^[a-zA-Z0-9.\-_$@*!]{5,30}$/
    const name = document.sub.name.value;
    const email = document.sub.email.value;
    const phone = document.sub.phone.value;
    const username = document.sub.username.value;
    const password = document.sub.password.value;
    const reenterpassword = document.sub.reenterpassword.value;
    const emailRegx = /^(\w){3,16}@([A-Za-z]){5,8}.([A-Za-z]){2,3}$/gm
    const passwordRegx = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,16}$/
    const err = document.getElementById("error-message");

    if (username == "") {
        err.innerHTML = 'username is Empty';
        return false;
    }
    if(usernameRegex.test(username)==false){
        err.innerHTML = 'Invalid username'
        return false
    }
    if (username.length < 5) {
        err.innerHTML = 'username must be morethan 5';
        return false
    }
    if (name == "") {
        err.innerHTML = 'The Name is Empty'

        return false;
    }
    if(nameRegex.test(name)==false){
        err.innerHTML = 'Invalid name'
        return false
    }
    if (name.length < 5) {
        err.innerHTML = 'Name must be Contain five Elements Please Include Fullname';
        return false;
    }

    if (email == "") {
        err.innerHTML = 'Email is Empty';
        return false;
    }

    if (emailRegx.test(email) == false) {
        err.innerHTML = 'Invalid Email'
        return false
    }

    if (phone == "") {
        err.innerHTML = 'The phone is Empty'

        return false;
    }
    if (phone.length < 10 || phone.length > 13) {
        err.innerHTML = 'invalid phone Number';
        return false;
    }

    if (passwordRegx.test(password) == false) {
        err.innerHTML = 'Password must contain - 8 inputs, at least 1 capital and 1 Special Character, at least 1 number'
        return false
    }
    
    if (reenterpassword != password) {
        err.innerHTML = 'Password are not Matching';
        return false
    }
    return true;

}