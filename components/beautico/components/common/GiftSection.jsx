import Link from "next/link";
import React from "react";

function GiftSection() {
  return (
    <div className="gift-section">
      <img
        src="/assets/img/home1/gift-card-img1.png"
        alt=""
        className="gift-img1"
      />
      <img
        src="/assets/img/home1/gift-card-img2.png"
        alt=""
        className="gift-img2"
      />
      <div className="container-lg container-fluid">
        <div className="gift-wrapper">
          <h5>BEAUTICO GIFT CARD</h5>
          <div className="gift-card-content">
            <p>
              Whatever your summer looks like, bring your own heat with up to
              25% off Lumin Brand.Pellentesque ipsum dui.
            </p>
          </div>
          <Link legacyBehavior href="/gift-card">
            <a className="primary-btn1 hover-btn3">*Shop Gift Cards*</a>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default GiftSection;
