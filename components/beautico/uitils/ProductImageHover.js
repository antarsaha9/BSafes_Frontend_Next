import React, { useState } from "react";

const ProductImage = ({ imageUrl, dataScale }) => {
  const [scale, setScale] = useState(1);

  const handleMouseEnter = () => {
    setScale(dataScale); // Use the data-scale attribute
  };

  const handleMouseLeave = () => {
    setScale(1); // Reset the scale on mouse out
  };

  const handleMouseMove = (e) => {
    const image = e.currentTarget.querySelector(".product-img--main__image");
    const rect = image.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    image.style.transformOrigin = `${x}% ${y}%`;
  };

  return (
    <div
      className="shop-details-tab-img product-img--main"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <div
        className="product-img--main__image"
        style={{
          backgroundImage: `url(${imageUrl})`,
          transform: `scale(${scale})`,
        }}
      ></div>
    </div>
  );
};

export default ProductImage;
