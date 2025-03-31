import Link from 'next/link'
import React from 'react'

const BrandSection = () => {
  return (
    <div className="brand-section mb-110">
      <div className="container-fluid">
        <div className="row">
          <div className="col-xl-2 d-flex align-items-center">
            <div className="section-title3">
              <h3>Our <span>Brand</span></h3>
            </div>
          </div>
          <div className="col-xl-10">
            <div className="row g-md-0 g-4 justify-content-center row-cols-xl-5 row-cols-lg-5 row-cols-md-5 row-cols-sm-4 row-cols-2 brand-border-bottom">
              <div className="col d-flex justify-content-center brand-divider">
                <div className="brand-img pb-35">
                  <Link legacyBehavior href="/shop">
                    <a>
                    <img src="/assets/img/home2/brand-img1.png" alt="" />
                    </a>
                  </Link>
                </div>
              </div>
              <div className="col d-flex justify-content-center brand-divider">
                <div className="brand-img pb-35">
                  <Link legacyBehavior href="/shop">
                    <a>
                    <img src="/assets/img/home2/brand-img2.png" alt="" />
                    </a>
                  </Link>
                </div>
              </div>
              <div className="col d-flex justify-content-center brand-divider">
                <div className="brand-img pb-35">
                  <Link legacyBehavior href="/shop">
                    <a>
                    <img src="/assets/img/home2/brand-img3.png" alt="" />
                    </a>
                  </Link>
                </div>
              </div>
              <div className="col d-flex justify-content-center brand-divider">
                <div className="brand-img pb-35">
                  <Link legacyBehavior href="/shop">
                    <a>
                    <img src="/assets/img/home2/brand-img4.png" alt="" />
                    </a>
                  </Link>
                </div>
              </div>
              <div className="col d-flex justify-content-center">
                <div className="brand-img pb-35">
                  <Link legacyBehavior href="/shop">
                    <a>
                    <img src="/assets/img/home2/brand-img5.png" alt="" />
                    </a>
                  </Link>
                </div>
              </div>
              <div className="col d-flex justify-content-center brand-divider">
                <div className="brand-img pt-35">
                  <Link legacyBehavior href="/shop">
                    <a>
                    <img src="/assets/img/home2/brand-img6.png" alt="" />
                    </a>
                  </Link>
                </div>
              </div>
              <div className="col d-flex justify-content-center brand-divider">
                <div className="brand-img pt-35">
                  <Link legacyBehavior href="/shop">
                    <a>
                    <img src="/assets/img/home2/brand-img7.png" alt="" />
                    </a>
                  </Link>
                </div>
              </div>
              <div className="col d-flex justify-content-center brand-divider">
                <div className="brand-img pt-35">
                  <Link legacyBehavior href="/shop">
                    <a>
                    <img src="/assets/img/home2/brand-img8.png" alt="" />
                    </a>
                  </Link>
                </div>
              </div>
              <div className="col d-flex justify-content-center brand-divider">
                <div className="brand-img pt-35">
                  <Link legacyBehavior href="/shop">
                    <a>
                    <img src="/assets/img/home2/brand-img9.png" alt="" />
                    </a>
                  </Link>
                </div>
              </div>
              <div className="col d-flex justify-content-center">
                <div className="brand-img pt-35">
                  <Link legacyBehavior href="/shop">
                    <a>
                    <img src="/assets/img/home2/brand-img10.png" alt="" />
                    </a>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  )
}

export default BrandSection
