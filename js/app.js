// Mobil menü aç/kapa
(function () {
  const menuBtn = document.querySelector(".menu-btn");
  if (!menuBtn) return;

  menuBtn.addEventListener("click", () => {
    menuBtn.classList.toggle("menu-btn--open");
    document.body.classList.toggle("menu-open");
  });
})();
