import Link from 'next/link'
import React from 'react'

const JustForSection = () => {
  return (
    <div className="just-for-section mb-110">
      <img src="/assets/img/home1/icon/vector-1.svg" alt="" className="vector1" />
      <img src="/assets/img/home1/icon/vector-2.svg" alt="" className="vector2" />
      <div className="container">
        <div className="section-title2 style-2">
          <h3>Just For You</h3>
          <div className="all-product hover-underline">
            <Link legacyBehavior href="/shop">
              <a>
              *View All Product
              <svg width={33} height={13} viewBox="0 0 33 13" xmlns="http://www.w3.org/2000/svg">
                <path d="M25.5083 7.28L0.491206 7.25429C0.36093 7.25429 0.23599 7.18821 0.143871 7.0706C0.0517519 6.95299 0 6.79347 0 6.62714C0 6.46081 0.0517519 6.3013 0.143871 6.18369C0.23599 6.06607 0.36093 6 0.491206 6L25.5088 6.02571C25.6391 6.02571 25.764 6.09179 25.8561 6.2094C25.9482 6.32701 26 6.48653 26 6.65286C26 6.81919 25.9482 6.9787 25.8561 7.09631C25.764 7.21393 25.6386 7.28 25.5083 7.28Z" />
                <path d="M33.0001 6.50854C29.2204 7.9435 24.5298 10.398 21.623 13L23.9157 6.50034L21.6317 0C24.5358 2.60547 29.2224 5.06539 33.0001 6.50854Z" />
              </svg>
              </a>
            </Link>
          </div>
        </div>
        <div className="row gy-4 justify-content-center">
          <div className="col-lg-3">
            <div className="nav flex-column nav-pills" id="v-pills-tab" role="tablist" aria-orientation="vertical">
              <button className="nav-link active" id="v-Korean-tab" data-bs-toggle="pill" data-bs-target="#v-Korean" type="button" role="tab" aria-controls="v-Korean" aria-selected="true">
                Korean Product
                <span>(30)</span>
              </button>
              <button className="nav-link" id="v-makeup-tab" data-bs-toggle="pill" data-bs-target="#v-makeup" type="button" role="tab" aria-controls="v-makeup" aria-selected="false">
                Makeup
                <span>(40)</span>
              </button>
              <button className="nav-link" id="v-skin-care-tab" data-bs-toggle="pill" data-bs-target="#v-skin-care" type="button" role="tab" aria-controls="v-skin-care" aria-selected="false">
                Skin Care
                <span>(32)</span>
              </button>
              <button className="nav-link" id="v-personal-care-tab" data-bs-toggle="pill" data-bs-target="#v-personal-care" type="button" role="tab" aria-controls="v-personal-care" aria-selected="false">
                Personal Care
                <span>(28)</span>
              </button>
              <button className="nav-link" id="v-fragrance-tab" data-bs-toggle="pill" data-bs-target="#v-fragrance" type="button" role="tab" aria-controls="v-fragrance" aria-selected="false">
                Fragrance
                <span>(19)</span>
              </button>
              <button className="nav-link" id="v-health-tab" data-bs-toggle="pill" data-bs-target="#v-health" type="button" role="tab" aria-controls="v-health" aria-selected="false">
                Health &amp; Care
                <span>(21)</span>
              </button>
              <button className="nav-link" id="v-accessories-tab" data-bs-toggle="pill" data-bs-target="#v-accessories" type="button" role="tab" aria-controls="v-accessories" aria-selected="false">
                Accessories
                <span>(36)</span>
              </button>
              <button className="nav-link" id="v-kids-tab" data-bs-toggle="pill" data-bs-target="#v-kids" type="button" role="tab" aria-controls="v-kids" aria-selected="false">
                Kids &amp; Baby
                <span>(55)</span>
              </button>
              <button className="nav-link" id="v-skin-care2-tab" data-bs-toggle="pill" data-bs-target="#v-skin-care2" type="button" role="tab" aria-controls="v-skin-care2" aria-selected="false">
                Skin Care
                <span>(68)</span>
              </button>
            </div>
            <div className="offer-img hover-img">
              <img src="/assets/img/home1/offer-img.png" alt="" />
              <div className="discount-buy">
                <div className="discount">
                  <svg width={65} height={65} viewBox="0 0 65 65" xmlns="http://www.w3.org/2000/svg">
                    <path d="M30.4435 1.58116C31.4962 0.259924 33.5038 0.259924 34.5565 1.58116V1.58116C35.4448 2.69608 37.0597 2.90009 38.1973 2.0411V2.0411C39.5455 1.02317 41.4901 1.52244 42.1811 3.06395V3.06395C42.7642 4.36476 44.2776 4.96398 45.5932 4.4149V4.4149C47.1521 3.76422 48.9114 4.7314 49.1974 6.39632V6.39632C49.4387 7.80127 50.7556 8.75805 52.1663 8.55338V8.55338C53.8381 8.31084 55.3016 9.68515 55.1645 11.3689V11.3689C55.0488 12.7897 56.0864 14.0439 57.5037 14.1965V14.1965C59.1833 14.3774 60.2591 16.0724 59.7076 17.6692V17.6692C59.2422 19.0166 59.9352 20.4895 61.2701 20.9897V20.9897C62.8519 21.5826 63.4723 23.492 62.5411 24.9014V24.9014C61.7552 26.0907 62.0602 27.6897 63.2287 28.5062V28.5062C64.6134 29.4738 64.7395 31.4775 63.487 32.611V32.611C62.43 33.5675 62.3278 35.1921 63.2565 36.2736V36.2736C64.3571 37.5552 63.9809 39.5272 62.4858 40.3137V40.3137C61.2242 40.9773 60.7212 42.5254 61.3518 43.8039V43.8039C62.0991 45.3189 61.2443 47.1354 59.6006 47.5254V47.5254C58.2136 47.8544 57.3414 49.2288 57.6342 50.6239V50.6239C57.9813 52.2771 56.7016 53.8241 55.0125 53.793V53.793C53.5873 53.7667 52.4007 54.881 52.3374 56.3051V56.3051C52.2623 57.9927 50.6381 59.1728 49.0099 58.7226V58.7226C47.6359 58.3428 46.2095 59.1269 45.794 60.4906V60.4906C45.3017 62.1065 43.435 62.8456 41.9699 62.0047V62.0047C40.7336 61.295 39.157 61.6998 38.4154 62.9173V62.9173C37.5366 64.36 35.5449 64.6117 34.3349 63.4328V63.4328C33.3139 62.438 31.6861 62.438 30.6651 63.4328V63.4328C29.4551 64.6117 27.4634 64.36 26.5846 62.9173V62.9173C25.843 61.6998 24.2664 61.295 23.0301 62.0047V62.0047C21.565 62.8456 19.6983 62.1065 19.206 60.4906V60.4906C18.7905 59.1269 17.3641 58.3428 15.9901 58.7226V58.7226C14.3619 59.1728 12.7377 57.9927 12.6626 56.3051V56.3051C12.5993 54.881 11.4127 53.7667 9.98747 53.793V53.793C8.29845 53.8241 7.01874 52.2771 7.36578 50.6239V50.6239C7.65863 49.2288 6.78642 47.8544 5.3994 47.5254V47.5254C3.75571 47.1354 2.9009 45.3189 3.64819 43.8039V43.8039C4.27879 42.5254 3.77578 40.9773 2.51416 40.3137V40.3137C1.01908 39.5272 0.642888 37.5552 1.74347 36.2736V36.2736C2.67219 35.1921 2.56999 33.5675 1.51304 32.611V32.611C0.260513 31.4775 0.386573 29.4738 1.77129 28.5062V28.5062C2.93979 27.6897 3.24481 26.0907 2.45895 24.9014V24.9014C1.52767 23.492 2.14806 21.5826 3.72992 20.9897V20.9897C5.06477 20.4895 5.75784 19.0166 5.29244 17.6692V17.6692C4.74093 16.0725 5.81667 14.3774 7.49627 14.1965V14.1965C8.9136 14.0439 9.95118 12.7897 9.83549 11.3689V11.3689C9.6984 9.68515 11.1619 8.31084 12.8337 8.55338V8.55338C14.2444 8.75805 15.5613 7.80127 15.8026 6.39632V6.39632C16.0886 4.7314 17.8479 3.76422 19.4068 4.4149V4.4149C20.7224 4.96398 22.2358 4.36475 22.8189 3.06395V3.06395C23.5099 1.52244 25.4545 1.02317 26.8027 2.0411V2.0411C27.9403 2.90009 29.5552 2.69608 30.4435 1.58116V1.58116Z" />
                  </svg>
                  <h6>30% <br /><span>off</span></h6>
                </div>
                <Link legacyBehavior href="/shop"><a  className="buy-btn hover-btn4">*Buy Now*</a></Link>
              </div>
            </div>
          </div>
          <div className="col-lg-9">
            <div className="tab-content" id="v-pills-tabContent">
              <div className="tab-pane fade show active" id="v-Korean" role="tabpanel" aria-labelledby="v-Korean-tab">
                <div className="row gy-4">
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img double-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-7.png" alt="" className="img1" />
                          <img src="/assets/img/home1/product-img-22.png" alt="" className="img2" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Youthful Renewal Formula</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Crystal Gleam</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-8.png" alt="" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="out-of-stock">
                          <span>Out Of Stock</span>
                        </div>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/out-of-stock"><a  className="hover-btn3 add-cart-btn ">Request Stock</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Vivid Eye Pencil</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>REVLON</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img double-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-9.png" alt="" className="img1" />
                          <img src="/assets/img/home1/product-img-21.png" alt="" className="img2" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Firming Night Cream</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Crystal</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-10.png" alt="" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Brightening Cream Complex</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Radiant</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img double-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-11.png" alt="" className="img1" />
                          <img src="/assets/img/home1/product-img-14.png" alt="" className="img2" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Age-Defying Miracle</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Radiance</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-12.png" alt="" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Oil-Control Pressed</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Whispering</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="tab-pane fade" id="v-makeup" role="tabpanel" aria-labelledby="v-makeup-tab">
                <div className="row gy-4">
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img double-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-7.png" alt="" className="img1" />
                          <img src="/assets/img/home1/product-img-22.png" alt="" className="img2" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Youthful Renewal Formula</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Crystal Gleam</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-8.png" alt="" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Vivid Eye Pencil</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>REVLON</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img double-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-9.png" alt="" className="img1" />
                          <img src="/assets/img/home1/product-img-21.png" alt="" className="img2" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Firming Night Cream</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Crystal</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-10.png" alt="" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Brightening Cream Complex</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Radiant</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img double-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-11.png" alt="" className="img1" />
                          <img src="/assets/img/home1/product-img-14.png" alt="" className="img2" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Age-Defying Miracle</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Radiance</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-12.png" alt="" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Oil-Control Pressed</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Whispering</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="tab-pane fade" id="v-skin-care" role="tabpanel" aria-labelledby="v-skin-care-tab">
                <div className="row gy-4">
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img double-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-7.png" alt="" className="img1" />
                          <img src="/assets/img/home1/product-img-22.png" alt="" className="img2" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Youthful Renewal Formula</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Crystal Gleam</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-8.png" alt="" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Vivid Eye Pencil</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>REVLON</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img double-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-9.png" alt="" className="img1" />
                          <img src="/assets/img/home1/product-img-21.png" alt="" className="img2" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Firming Night Cream</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Crystal</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-10.png" alt="" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Brightening Cream Complex</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Radiant</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img double-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-11.png" alt="" className="img1" />
                          <img src="/assets/img/home1/product-img-14.png" alt="" className="img2" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Age-Defying Miracle</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Radiance</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-12.png" alt="" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Oil-Control Pressed</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Whispering</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="tab-pane fade" id="v-personal-care" role="tabpanel" aria-labelledby="v-personal-care-tab">
                <div className="row gy-4">
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img double-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-7.png" alt="" className="img1" />
                          <img src="/assets/img/home1/product-img-22.png" alt="" className="img2" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Youthful Renewal Formula</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Crystal Gleam</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-8.png" alt="" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Vivid Eye Pencil</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>REVLON</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img double-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-9.png" alt="" className="img1" />
                          <img src="/assets/img/home1/product-img-21.png" alt="" className="img2" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Firming Night Cream</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Crystal</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-10.png" alt="" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Brightening Cream Complex</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Radiant</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img double-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-11.png" alt="" className="img1" />
                          <img src="/assets/img/home1/product-img-14.png" alt="" className="img2" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Age-Defying Miracle</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Radiance</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-12.png" alt="" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Oil-Control Pressed</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Whispering</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="tab-pane fade" id="v-fragrance" role="tabpanel" aria-labelledby="v-fragrance-tab">
                <div className="row gy-4">
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img double-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-7.png" alt="" className="img1" />
                          <img src="/assets/img/home1/product-img-22.png" alt="" className="img2" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Youthful Renewal Formula</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Crystal Gleam</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-8.png" alt="" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Vivid Eye Pencil</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>REVLON</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img double-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-9.png" alt="" className="img1" />
                          <img src="/assets/img/home1/product-img-21.png" alt="" className="img2" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Firming Night Cream</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Crystal</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-10.png" alt="" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Brightening Cream Complex</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Radiant</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img double-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-11.png" alt="" className="img1" />
                          <img src="/assets/img/home1/product-img-14.png" alt="" className="img2" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Age-Defying Miracle</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Radiance</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-12.png" alt="" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Oil-Control Pressed</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Whispering</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="tab-pane fade" id="v-health" role="tabpanel" aria-labelledby="v-health-tab">
                <div className="row gy-4">
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img double-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-7.png" alt="" className="img1" />
                          <img src="/assets/img/home1/product-img-22.png" alt="" className="img2" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Youthful Renewal Formula</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Crystal Gleam</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-8.png" alt="" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Vivid Eye Pencil</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>REVLON</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img double-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-9.png" alt="" className="img1" />
                          <img src="/assets/img/home1/product-img-21.png" alt="" className="img2" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Firming Night Cream</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Crystal</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-10.png" alt="" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Brightening Cream Complex</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Radiant</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img double-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-11.png" alt="" className="img1" />
                          <img src="/assets/img/home1/product-img-14.png" alt="" className="img2" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Age-Defying Miracle</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Radiance</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-12.png" alt="" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Oil-Control Pressed</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Whispering</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="tab-pane fade" id="v-accessories" role="tabpanel" aria-labelledby="v-accessories-tab">
                <div className="row gy-4">
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img double-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-7.png" alt="" className="img1" />
                          <img src="/assets/img/home1/product-img-22.png" alt="" className="img2" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Youthful Renewal Formula</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Crystal Gleam</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-8.png" alt="" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Vivid Eye Pencil</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>REVLON</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img double-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-9.png" alt="" className="img1" />
                          <img src="/assets/img/home1/product-img-21.png" alt="" className="img2" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Firming Night Cream</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Crystal</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-10.png" alt="" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Brightening Cream Complex</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Radiant</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img double-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-11.png" alt="" className="img1" />
                          <img src="/assets/img/home1/product-img-14.png" alt="" className="img2" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Age-Defying Miracle</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Radiance</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-12.png" alt="" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Oil-Control Pressed</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Whispering</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="tab-pane fade" id="v-kids" role="tabpanel" aria-labelledby="v-kids-tab">
                <div className="row gy-4">
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img double-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-7.png" alt="" className="img1" />
                          <img src="/assets/img/home1/product-img-22.png" alt="" className="img2" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Youthful Renewal Formula</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Crystal Gleam</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-8.png" alt="" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Vivid Eye Pencil</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>REVLON</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img double-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-9.png" alt="" className="img1" />
                          <img src="/assets/img/home1/product-img-21.png" alt="" className="img2" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Firming Night Cream</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Crystal</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-10.png" alt="" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Brightening Cream Complex</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Radiant</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img double-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-11.png" alt="" className="img1" />
                          <img src="/assets/img/home1/product-img-14.png" alt="" className="img2" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Age-Defying Miracle</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Radiance</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-12.png" alt="" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Oil-Control Pressed</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Whispering</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="tab-pane fade" id="v-skin-care2" role="tabpanel" aria-labelledby="v-skin-care2-tab">
                <div className="row gy-4">
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img double-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-7.png" alt="" className="img1" />
                          <img src="/assets/img/home1/product-img-22.png" alt="" className="img2" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Youthful Renewal Formula</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Crystal Gleam</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-8.png" alt="" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Vivid Eye Pencil</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>REVLON</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img double-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-9.png" alt="" className="img1" />
                          <img src="/assets/img/home1/product-img-21.png" alt="" className="img2" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Firming Night Cream</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Crystal</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-10.png" alt="" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Brightening Cream Complex</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Radiant</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img double-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-11.png" alt="" className="img1" />
                          <img src="/assets/img/home1/product-img-14.png" alt="" className="img2" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Age-Defying Miracle</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Radiance</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                  <div className="col-xl-4 col-md-6">
                    <div className="product-card style-2 hover-btn">
                      <div className="product-card-img">
                        <Link legacyBehavior href="/shop/product-default">
                          <a>
                          <img src="/assets/img/home1/product-img-12.png" alt="" />
                          <div className="batch">
                            <span>-15%</span>
                          </div>
                          </a>
                        </Link>
                        <div className="overlay">
                          <div className="cart-area">
                            <Link legacyBehavior href="/shop/cart"><a  className="hover-btn3 add-cart-btn"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                          </div>
                        </div>
                      </div>
                      <div className="product-card-content">
                        <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Oil-Control Pressed</a></Link></h6>
                        <p><Link legacyBehavior href="/shop"><a>Whispering</a></Link></p>
                        <p className="price">$150.00 <del>$200.00</del></p>
                        <div className="rating">
                          <ul>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                            <li><i className="bi bi-star-fill" /></li>
                          </ul>
                          <span>(50)</span>
                        </div>
                      </div>
                      <span className="for-border" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  
  )
}

export default JustForSection
