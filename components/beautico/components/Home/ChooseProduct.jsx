import Link from 'next/link'
import React from 'react'

const ChooseProduct = () => {
  return (
    <div className="choose-product-section mb-110">
      <div className="container">
        <div className="section-title text-center">
          <h3>Choose What You Want</h3>
        </div>
        <div className="row gy-4 justify-content-center">
          <div className="col-lg-4 col-md-6">
            <div className="choose-product-card hover-img style-2">
              <Link legacyBehavior href="/shop">
                  <a>
                      <img src="/assets/img/home1/choose-product-card-img1.png" alt="" />
                  </a>
              </Link>
              <div className="choose-product-card-content">
                <h2 className="first-text">Face</h2>
                <h2 className="second-text">Care</h2>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-md-6">
            <div className="choose-product-card hover-img style-2">
              <Link legacyBehavior href="/shop">
                  <a>
                      <img src="/assets/img/home1/choose-product-card-img2.png" alt="" />
                  </a>
              </Link>
              <div className="choose-product-card-content">
                <h2 className="first-text">Body</h2>
                <h2 className="second-text style-2">Health</h2>
              </div>
            </div>
          </div>
          <div className="col-lg-4 col-md-6">
            <div className="choose-product-card hover-img style-2">
              <Link legacyBehavior href="/shop">
                  <a>
                      <img src="/assets/img/home1/choose-product-card-img3.png" alt="" />
                  </a>
              </Link>
              <div className="choose-product-card-content style-2">
                <h2 className="first-text style-2">Hair</h2>
                <h2 className="second-text style-3">Care</h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChooseProduct
