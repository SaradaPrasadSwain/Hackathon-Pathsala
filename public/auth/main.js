const nameInputSign = document.querySelector("#nameId1")
const emailInputSign = document.querySelector("#nameId2")
const passwordInputSign = document.querySelector("#nameId3")
const signUpButton = document.querySelector(".signup-button");

signUpButton.addEventListener("click", () => {
    const nameValue = nameInputSign.value;
    const emailValue = emailInputSign.value;
    const passwordValue = passwordInputSign.value;

    console.log("Name:", nameValue);
    console.log("Email:", emailValue);
    console.log("Password:", passwordValue);
})


