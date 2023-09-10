let userform = document.querySelector(".user_form");

const sendForm = async (e) => {
  e.preventDefault();
  let userinfo = Object.fromEntries(new FormData(userform));
  let response = await fetch(`/api/session/${e.target.id}`, {
    method: "POST",
    body: JSON.stringify(userinfo),
    headers: { "Content-type": "application/json; charset=UTF-8" },
  });
  let result = await response.json();
  console.log(result);
  if (result.status === "success") {
    userform.reset();
    alert(result.payload.message);
    setTimeout(() => window.location.href = "/login", 500);
  } else {
    alert(result.payload);
  }
};

userform.addEventListener("submit", sendForm);