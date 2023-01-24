const flash = document.querySelector(".flashes");
const close = document.querySelector(".fa-xmark");

close.addEventListener("click", () => {
  flash.style.display = "none";
});
