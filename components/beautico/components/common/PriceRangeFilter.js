import React, { useState } from "react";

const PriceRangeFilter = () => {
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100);
  const [isDraggingMin, setIsDraggingMin] = useState(false);
  const [isDraggingMax, setIsDraggingMax] = useState(false);

  const handleSliderMouseDown = (e, isMin) => {
    e.preventDefault();
    if (isMin) {
      setIsDraggingMin(true);
    } else {
      setIsDraggingMax(true);
    }
  };

  const handleMouseMove = (e) => {
    if (isDraggingMin) {
      const rect = e.currentTarget.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const percentage = (offsetX / rect.width) * 100;
      setMinPrice(percentage);
    } else if (isDraggingMax) {
      const rect = e.currentTarget.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const percentage = (offsetX / rect.width) * 100;
      setMaxPrice(percentage);
    }
  };

  const handleMouseUp = () => {
    setIsDraggingMin(false);
    setIsDraggingMax(false);
  };

  return (
    <div className="shop-widget mb-30">
      <h5 className="shop-widget-title">Price Filter</h5>
      <div className="range-wrap">
        <div
          className="slider-bar"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <div
            className="slider-circle left-circle"
            style={{ left: `${minPrice}%` }}
            onMouseDown={(e) => handleSliderMouseDown(e, true)}
          ></div>
          <div
            className="slider-circle right-circle"
            style={{ left: `${maxPrice}%` }}
            onMouseDown={(e) => handleSliderMouseDown(e, false)}
          ></div>
        </div>
        <div className="slider-labels">
          <span>${minPrice}</span>
          <span>${maxPrice}</span>
        </div>
      </div>
    </div>
  );
};

export default PriceRangeFilter;
