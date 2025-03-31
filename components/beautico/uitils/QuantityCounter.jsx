import React from "react";
import useQuantityCounter from "../hooks/useQuantityCounter";

function QuantityCounter() {
  const { quantity, increment, decrement, handleInputChange } =
    useQuantityCounter(1);

  return (
    <div className="quantity-counter">
      <div
        className="quantity__minus"
        style={{ cursor: "pointer" }}
        onClick={decrement}
      >
        <i className="bx bx-minus" />
      </div>
      <input
        name="quantity"
        type="text"
        className="quantity__input"
        value={quantity}
        onChange={handleInputChange}
      />
      <div
        className="quantity__plus"
        style={{ cursor: "pointer" }}
        onClick={increment}
      >
        <i className="bx bx-plus" />
      </div>
    </div>
  );
}

export default QuantityCounter;
