let products = document.getElementById("products");
let cart_id = document.getElementById("cart");
let close_action = document.getElementById("close-cart");

products.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-outline-danger")) {
    let id = e.target.dataset.id;
    let response = await fetch(
      `/api/carts/${cart_id.dataset.id}/products/${id}`,
      { method: "DELETE" }
    );
    let result = await response.json();
    if (result.status === "success") {
      products.removeChild(e.target.parentElement.parentElement);
      if (products.children.length === 0) {
        document.querySelector("#exist-products").style.display = "none";
        document.querySelector("#no-exist-products").style.display = "block";
      }
      alert(result.payload);
    } else {
      alert(result.payload);
    }
  }
});

close_action.addEventListener("click", async () => {
  let response = await fetch(`/api/carts/${cart_id.dataset.id}/purchase` , { method: "POST" });
  let result = await response.json();
  if (result.status === "success") {
    alert(result.payload.message);
    setTimeout(() => window.location.href = `/purchase/${result.payload.ticket_response.code}`, 500);
  }else{
    alert(result.payload);
  }
});
