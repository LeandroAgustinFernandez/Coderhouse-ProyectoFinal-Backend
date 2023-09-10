const socket = io();
const createForm = document.querySelector(".create_form");

createForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const product = new FormData(e.target);
  let res = await fetch("/api/products", {
    method: "POST",
    body: product,
    headers: {
      type: 'products'
    }
  });
  let result = await res.json();
  if (result.status === 'success') {
    Swal.fire({
      text: `${result.payload.message}`,
      toast: true,
      position: "top-right",
    });
    createForm.reset();
  } else {
    Swal.fire({
      text: `${result.payload}`,
      toast: true,
      position: "top-right",
    });
  }
});
