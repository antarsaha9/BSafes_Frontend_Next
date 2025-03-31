import Link from 'next/link'
import React from 'react'

function OfferBanner() {
  return (
    <div className="offer-banner mb-110">
      <div className="container">
        <div className="row gy-4">
          <div className="col-lg-6">
            <div className="offer-banner-left hover-img">
              <img src="/assets/img/home1/offer-banner-left.png" alt="" />
              <div className="offer-banner-left-content">
                <div className="left-text">
                  <h5>Limited Offer</h5>
                  <h5>Get</h5>
                  <h5><span>30%</span> off</h5>
                </div>
                <Link legacyBehavior href="/shop"><a  className="buy-btn2 hover-btn3">*Buy Now*</a></Link>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="offer-banner-right hover-img">
              <img src="/assets/img/home1/offer-banner-right.png" alt="" />
              <div className="offer-banner-right-content">
                <h5>All Makeup Product</h5>
                <h4>30% <span>off</span></h4>
                <p>Whatever your summer looks like, bring your own.</p>
                <Link legacyBehavior href="/shop"><a  className="buy-btn2 hover-btn3">*Buy Now*</a></Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OfferBanner
