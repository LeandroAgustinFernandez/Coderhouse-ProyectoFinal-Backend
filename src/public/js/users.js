let users = document.getElementById("users");
let delete_action = document.getElementById("delete-innactive");

users.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-outline-primary")) {
    let id = e.target.dataset.id;
    let response = await fetch(`api/session/premium/${id}`);
    let result = await response.json();
    if (result.status === "success") {
      alert(result.payload.message);
      setTimeout(() => window.location.href = `/users`, 500);
    } else {
      alert(result.payload);
    }
  }
});

delete_action.addEventListener("click", async () => {
  let response = await fetch(`/api/session/` , { method: "DELETE" });
  let result = await response.json();
  if (result.status === "success") {
    alert(result.payload);
    setTimeout(() => window.location.href = `/users`, 500);
  }else{
    alert(result.payload);
  }
});
