import { useEffect } from "react";

const useMagneticHover = () => {
  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!event.target || !(event.target instanceof HTMLElement)) return;

      const magneticItem = event.target.closest(".product-img--main img");

      if (!magneticItem) return;

      const rect = magneticItem.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const offsetX = event.clientX - x;
      const offsetY = event.clientY - y;

      if (
        Math.abs(offsetX) <= rect.width / 3 &&
        Math.abs(offsetY) <= rect.height / 3
      ) {
        magneticItem.style.transform = `translate3d(${offsetX * 0.09}px, ${
          offsetY * 0.09
        }px, 0) scale(1.4)`;
        magneticItem.style.transition = "transform 0.1s ease";
      } else {
        magneticItem.style.transform = "translate3d(0, 0, 0) scale(1)";
        magneticItem.style.transition = "transform 0.3s ease";
      }
    };

    const handleMouseLeave = (event) => {
      if (!event.target || !(event.target instanceof HTMLElement)) return;

      const magneticItem = event.target.closest(".product-img--main img");

      if (!magneticItem) return;

      magneticItem.style.transform = "translate3d(0, 0, 0) scale(1)";
      magneticItem.style.transition = "transform 0.3s ease";
    };

    document.addEventListener("mousemove", handleMouseMove);
    // document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);
};

export default useMagneticHover;
