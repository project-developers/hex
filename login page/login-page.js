const loginForm = document.getElementById("login-form");
const loginButton = document.getElementById("login-form-submit");
const loginErrorMsg = document.getElementById("login-error-msg");

loginButton.addEventListener("click", (e) => {
    e.preventDefault();
    const username = loginForm.username.value;
    const password = loginForm.password.value;

    if (username.toLowerCase() === "Reporter".toLowerCase() && password === "reportEntry") {
        //alert("You have successfully logged in.");
        location.href = "report.html";
    } else {
			//loginForm.username.value="";
			loginForm.password.value="";
        loginErrorMsg.style.opacity = 1;
    }
})