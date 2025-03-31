import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";

const Cart = () => {
  const [showCart, setShowCart] = useState(false);
  const cartButtonRef = useRef(null);
  const cartMenuRef = useRef(null);

  // Handle cart button click
  const handleCartButtonClick = () => {
    setShowCart(!showCart);
  };

  // Close the cart when a click occurs outside of the cart area
  const handleOutsideClick = (event) => {
    if (
      cartMenuRef.current &&
      !cartMenuRef.current.contains(event.target) &&
      cartButtonRef.current !== event.target
    ) {
      setShowCart(false);
    }
  };

  useEffect(() => {
    // Add event listeners when the component mounts
    document.addEventListener("click", handleOutsideClick);
    // Clean up the event listeners when the component unmounts
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  return (
    <>
      <button
        ref={cartButtonRef.current}
        onClick={handleCartButtonClick}
        type="button"
        className="modal-btn header-cart-btn"
      >
        <svg
          width={18}
          height={18}
          viewBox="0 0 18 18"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M14.0139 18H3.98532C1.86389 18 0.128174 16.2643 0.128174 14.1429V14.0143L0.513888 3.72857C0.578174 1.60714 2.31389 0 4.37103 0H13.6282C15.6853 0 17.421 1.60714 17.4853 3.72857L17.871 14.0143C17.9353 15.0429 17.5496 16.0071 16.8425 16.7786C16.1353 17.55 15.171 18 14.1425 18H14.0139ZM4.37103 1.28571C2.95675 1.28571 1.86389 2.37857 1.7996 3.72857L1.41389 14.1429C1.41389 15.5571 2.57103 16.7143 3.98532 16.7143H14.1425C14.8496 16.7143 15.4925 16.3929 15.9425 15.8786C16.3925 15.3643 16.6496 14.7214 16.6496 14.0143L16.2639 3.72857C16.1996 2.31429 15.1067 1.28571 13.6925 1.28571H4.37103Z" />
          <path d="M8.99951 7.71427C6.49237 7.71427 4.49951 5.72141 4.49951 3.21427C4.49951 2.82855 4.75665 2.57141 5.14237 2.57141C5.52808 2.57141 5.78523 2.82855 5.78523 3.21427C5.78523 5.01427 7.19951 6.42855 8.99951 6.42855C10.7995 6.42855 12.2138 5.01427 12.2138 3.21427C12.2138 2.82855 12.4709 2.57141 12.8567 2.57141C13.2424 2.57141 13.4995 2.82855 13.4995 3.21427C13.4995 5.72141 11.5067 7.71427 8.99951 7.71427Z" />
        </svg>
        <span>02</span>
      </button>
      <div
        ref={cartMenuRef.current}
        className={`cart-menu ${showCart ? "active" : ""}`}
      >
        <div className="cart-body">
          <ul>
            <li className="single-item">
              <div className="item-area">
                <div className="item-img">
                  <img src="/assets/img/home1/cart-img-1.png" alt="" />
                </div>
                <div className="content-and-quantity">
                  <div className="content">
                    <div className="price-and-btn d-flex align-items-center justify-content-between">
                      <span>
                        $150 <del>$200</del>
                      </span>
                      <button className="close-btn">
                        <i className="bi bi-x" />
                      </button>
                    </div>
                    <p>
                      <a href="#">Estee Lauder new Nail Polish</a>
                    </p>
                  </div>
                  <div className="quantity-area">
                    <div className="quantity">
                      <a className="quantity__minus">
                        <span>
                          <i className="bi bi-dash" />
                        </span>
                      </a>
                      <input
                        name="quantity"
                        type="text"
                        className="quantity__input"
                        defaultValue={1}
                      />
                      <a className="quantity__plus">
                        <span>
                          <i className="bi bi-plus" />
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </li>
            <li className="single-item">
              <div className="item-area">
                <div className="item-img">
                  <img src="/assets/img/home1/cart-img-2.png" alt="" />
                </div>
                <div className="content-and-quantity">
                  <div className="content">
                    <div className="price-and-btn d-flex align-items-center justify-content-between">
                      <span>
                        $150 <del>$200</del>
                      </span>
                      <button className="close-btn">
                        <i className="bi bi-x" />
                      </button>
                    </div>
                    <p>
                      <a href="#">Argan &amp; Olive Nature organ Oil</a>
                    </p>
                  </div>
                  <div className="quantity-area">
                    <div className="quantity">
                      <a className="quantity__minus">
                        <span>
                          <i className="bi bi-dash" />
                        </span>
                      </a>
                      <input
                        name="quantity"
                        type="text"
                        className="quantity__input"
                        defaultValue={1}
                      />
                      <a className="quantity__plus">
                        <span>
                          <i className="bi bi-plus" />
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div className="cart-footer">
          <div className="pricing-area">
            <ul>
              <li>
                <span>Sub Total</span>
                <span>$468</span>
              </li>
              <li>
                <span>Offer (20%)</span>
                <span>$56</span>
              </li>
            </ul>
            <ul className="total">
              <li>
                <span>Total</span>
                <span>$425</span>
              </li>
            </ul>
          </div>
          <div className="footer-button">
            <ul>
              <li>
                <Link legacyBehavior href="/shop">
                  <a className="primary-btn1 hover-btn4">Continue Shopping</a>
                </Link>
              </li>
              <li>
                <Link legacyBehavior href="/checkout">
                  <a className="primary-btn1 hover-btn3">Product Checkout</a>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;
