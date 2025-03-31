import Link from 'next/link'
import React from 'react'

const OfferBanner = () => {
  return (
    <div className="offer-banner two mb-110">
      <div className="container">
        <div className="row gy-4">
          <div className="col-lg-6">
            <div className="offer-banner-left hover-img">
              <img src="/assets/img/home2/offer-banner-left-img1.png" alt="" />
              <div className="offer-banner-left-content">
                <h3>Up to <span>40%</span> Off All Accessory.</h3>
                <Link legacyBehavior href="/shop"><a>Shop Now</a></Link>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="offer-banner-right hover-img">
              <img src="/assets/img/home2/offer-banner-right-img1.png" alt="" />
              <div className="offer-banner-right-content">
                <h3>Organic <span>product</span> for your face.</h3>
                <Link legacyBehavior href="/shop"><a  className="primary-btn3 hover-btn5">Shop Now</a></Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  )
}

export default OfferBanner
