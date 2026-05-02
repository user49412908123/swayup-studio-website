/* ============================================================
   SWAYUP STUDIO — hero.js
   Premium hero floating animation
   ============================================================ */

(function () {
  "use strict";

  function initFloatingItems() {
    if (typeof gsap === "undefined") return;

    const items = gsap.utils.toArray("[data-float-item]");
    if (!items.length) return;

    const rotations = [-8, 12, -11];

    items.forEach((item, index) => {
      gsap.set(item, { rotate: rotations[index] });

      gsap.to(item, {
        y: index % 2 === 0 ? -16 : -11,
        x: index === 1 ? 5 : -4,
        rotate: rotations[index] + (index % 2 === 0 ? 3 : -4),
        duration: 2.8 + index * 0.45,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: index * 0.2,
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initFloatingItems();
  });
})();
