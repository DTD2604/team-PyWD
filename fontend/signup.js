const UsernameRegister = document.querySelector(".input-signup-username");
const PasswordRegister = document.querySelector(".input-signup-password");
const EmailRegister = document.querySelector(".input-signup-email");
const btnRegister = document.querySelector(".btn");


btnRegister.addEventListener("click", function (e) {
    e.preventDefault();

    if (EmailRegister.value === "" || PasswordRegister.value === "") {
        alert("Please enter Email or Password")
    }

    else {
        const user = {
            username: EmailRegister.value,
            password: PasswordRegister.value
        }

        let json = JSON.stringify(user);

        localStorage.setItem(EmailRegister.value, json);
        window.location.href = "index.html";
    }
})