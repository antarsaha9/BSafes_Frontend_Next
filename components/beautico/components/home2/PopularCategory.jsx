import Link from 'next/link'
import React from 'react'

const PopularCategory = () => {
  return (
    <div className="popular-category-section mb-110">
      <div className="container">
        <div className="section-title3">
          <h3>Popular <span>Category</span> </h3>
          <div className="view-all">
            <Link legacyBehavior href="/category">
            <a>
            View All Category
              <svg width={33} height={13} viewBox="0 0 33 13" xmlns="http://www.w3.org/2000/svg">
                <path d="M25.5083 7.28L0.491206 7.25429C0.36093 7.25429 0.23599 7.18821 0.143871 7.0706C0.0517519 6.95299 0 6.79347 0 6.62714C0 6.46081 0.0517519 6.3013 0.143871 6.18369C0.23599 6.06607 0.36093 6 0.491206 6L25.5088 6.02571C25.6391 6.02571 25.764 6.09179 25.8561 6.2094C25.9482 6.32701 26 6.48653 26 6.65286C26 6.81919 25.9482 6.9787 25.8561 7.09631C25.764 7.21393 25.6386 7.28 25.5083 7.28Z" />
                <path d="M33.0001 6.50854C29.2204 7.9435 24.5298 10.398 21.623 13L23.9157 6.50034L21.6317 0C24.5358 2.60547 29.2224 5.06539 33.0001 6.50854Z" />
              </svg>
            </a>
            </Link>  
          </div>
        </div>
        <div className="row g-4">
          <div className="col-lg-2 col-md-3 col-sm-4">
            <div className="category-card style-2">
              <div className="category-card-img">
                <Link legacyBehavior href="/shop">
                  <a>
                  <img src="/assets/img/home2/home2-category-img1.png" alt="" />
                  </a>
                </Link>
              </div>
              <div className="category-card-content">
                <Link legacyBehavior href="/shop">
                  <a>Bath &amp; Body
                    </a></Link>
              </div>
            </div>
          </div>
          <div className="col-lg-2 col-md-3 col-sm-4">
            <div className="category-card style-2">
              <div className="category-card-img">
                <Link legacyBehavior href="/shop">
                  <a>
                  <img src="/assets/img/home2/home2-category-img2.png" alt="" />
                  </a>
                </Link>
              </div>
              <div className="category-card-content">
                <Link legacyBehavior href="/shop">
                  <a>
                  Skin Care
                    </a></Link>
              </div>
            </div>
          </div>
          <div className="col-lg-2 col-md-3 col-sm-4">
            <div className="category-card style-2">
              <div className="category-card-img">
                <Link legacyBehavior href="/shop">
                  <a>
                  <img src="/assets/img/home2/home2-category-img3.png" alt="" />
                  </a>
                </Link>
              </div>
              <div className="category-card-content">
                <Link legacyBehavior href="/shop">
                  <a>Hair Care
                    </a></Link>
              </div>
            </div>
          </div>
          <div className="col-lg-2 col-md-3 col-sm-4">
            <div className="category-card style-2">
              <div className="category-card-img">
                <Link legacyBehavior href="/shop">
                  <a>
                  <img src="/assets/img/home2/home2-category-img4.png" alt="" />
                  </a>
                </Link>
              </div>
              <div className="category-card-content">
                <Link legacyBehavior href="/shop">
                  <a>Kids &amp; Baby
                    </a></Link>
              </div>
            </div>
          </div>
          <div className="col-lg-2 col-md-3 col-sm-4">
            <div className="category-card style-2">
              <div className="category-card-img">
                <Link legacyBehavior href="/shop">
                  <a>
                  <img src="/assets/img/home2/home2-category-img5.png" alt="" />
                  </a>
                </Link>
              </div>
              <div className="category-card-content">
                <Link legacyBehavior href="/shop">
                  <a>Makeup
                    </a></Link>
              </div>
            </div>
          </div>
          <div className="col-lg-2 col-md-3 col-sm-4">
            <div className="category-card style-2">
              <div className="category-card-img">
                <Link legacyBehavior href="/shop">
                  <a>
                  <img src="/assets/img/home2/home2-category-img6.png" alt="" />
                  </a>
                </Link>
              </div>
              <div className="category-card-content">
                <Link legacyBehavior href="/shop">
                  <a>
                  Accessories
                    </a></Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PopularCategory
