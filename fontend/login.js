const UsernameLogin = document.querySelector(".input-login-username");
const PasswordLogin = document.querySelector(".input-login-password");
const EmailLogin = document.querySelector(".input-login-email");
const btnLogin = document.querySelector(".btn");

btnLogin.addEventListener("click", function (e) {
    e.preventDefault();

    if (EmailLogin.value === "" || PasswordLogin.value === "") {
        alert("Please enter Email and Password");
    } else {
        const user = JSON.parse(localStorage.getItem(EmailLogin.value));
        if (user && user.password === PasswordLogin.value) {
            window.open("Main.html");
        } else {
            alert("Invalid email or password!");
        }
    }
});



