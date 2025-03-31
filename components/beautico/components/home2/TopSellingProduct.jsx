import React, { useMemo } from "react";
import Link from "next/link";
import SwiperCore, {
  Autoplay,
  EffectFade,
  Navigation,
  Pagination,
} from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
SwiperCore.use([Pagination, Autoplay, EffectFade, Navigation]);

const TopSellingProduct = () => {
  
  const slideSettings = useMemo(()=>{
    return {
      slidesPerView: "auto",
        spaceBetween: 30,
        loop: true,
        navigation: {
          nextEl: ".top-sell-next-btn",
          prevEl: ".top-sell-prev-btn",
        },
        breakpoints: {
          280: {
            slidesPerView: 1,
            spaceBetween: 15,
          },
          386: {
            slidesPerView: 1,
            spaceBetween: 15,
          },
          576: {
            slidesPerView: 2,
          },
          768: {
            slidesPerView: 2,
          },
          992: {
            slidesPerView: 4,
          },
          1200: {
            slidesPerView: 4,
          },
          1400: {
            slidesPerView: 4,
          },
        },
        }
      },[])


  return (
    <div className="top-selling-section mb-110">
      <div className="container">
        <div className="section-title3">
          <h3>Top Selling <span>Product</span></h3>
          <div className="slider-btn2">
            <div className="top-sell-prev-btn">
              <i className="bx bxs-chevron-left" />
            </div>
            <div className="top-sell-next-btn">
              <i className="bx bxs-chevron-right" />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <Swiper {...slideSettings} className="swiper top-selling-slider">
              <div className="swiper-wrapper">
                <SwiperSlide className="swiper-slide">
                  <div className="product-card2">
                    <div className="batch">
                      <span>NEW</span>
                    </div>
                    <div className="product-card-img double-img">
                      <Link legacyBehavior href="/shop">
                        <a>
                        <img src="/assets/img/home2/product-img-13.png" alt="" className="img1" />
                        <img src="/assets/img/home2/product-img-10.png" alt="" className="img2" />
                        </a>
                      </Link>
                      <div className="cart-btn-area">
                        <div className="cart-btn">
                          <Link legacyBehavior href="/shop/cart"><a  className="add-cart-btn2 round hover-btn5"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                        </div>
                      </div>
                      <div className="view-and-favorite-area">
                        <ul>
                          <li>
                            <Link legacyBehavior href="/shop/whistlist">
                              <a>
                              <svg xmlns="http://www.w3.org/2000/svg" width={13} height={13} viewBox="0 0 13 13">
                                <g clipPath="url(#clip0_1106_270)">
                                  <path d="M11.1281 2.35735C10.8248 2.03132 10.4577 1.77117 10.0496 1.59305C9.64144 1.41493 9.20104 1.32266 8.75574 1.32197C8.31008 1.32248 7.86929 1.41462 7.46073 1.59266C7.05218 1.7707 6.6846 2.03084 6.38081 2.35692L6.17153 2.57807L5.96225 2.35692C4.74378 1.04552 2.69289 0.970207 1.38151 2.18868C1.32339 2.24269 1.26727 2.29881 1.21326 2.35692C-0.0793057 3.75111 -0.0793057 5.90577 1.21326 7.29996L5.86398 12.2044C6.02488 12.3743 6.29301 12.3816 6.46288 12.2207C6.46844 12.2154 6.47385 12.21 6.47911 12.2044L11.1281 7.29996C12.4206 5.90592 12.4206 3.75139 11.1281 2.35735ZM10.5151 6.7166H10.5147L6.17153 11.2974L1.82797 6.7166C0.840522 5.65131 0.840522 4.00515 1.82797 2.93986C2.72468 1.96795 4.23954 1.90701 5.21144 2.80373C5.25862 2.84726 5.30404 2.89268 5.34757 2.93986L5.86398 3.48467C6.03416 3.65376 6.30893 3.65376 6.47911 3.48467L6.99552 2.94028C7.89224 1.96838 9.40709 1.90744 10.379 2.80415C10.4262 2.84769 10.4716 2.8931 10.5151 2.94028C11.5112 4.00726 11.5185 5.65642 10.5151 6.7166Z" />
                                </g>
                              </svg>
                              </a>
                            </Link>
                          </li>
                          <li>
                            <a data-bs-toggle="modal" data-bs-target="#product-view">
                              <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 16 16">
                                <g clipPath="url(#clip0_1106_264)">
                                  <path d="M15.3226 7.54747C15.1932 7.37042 12.1093 3.21228 8.17072 3.21228C4.23211 3.21228 1.14813 7.37042 1.01884 7.5473C0.959103 7.62915 0.92691 7.72785 0.92691 7.82918C0.92691 7.9305 0.959103 8.02921 1.01884 8.11105C1.14813 8.28811 4.23211 12.4462 8.17072 12.4462C12.1093 12.4462 15.1932 8.28808 15.3226 8.1112C15.3824 8.02939 15.4147 7.93068 15.4147 7.82933C15.4147 7.72799 15.3824 7.62928 15.3226 7.54747ZM8.17072 11.491C5.26951 11.491 2.75676 8.73117 2.01293 7.82894C2.75579 6.92591 5.26329 4.16751 8.17072 4.16751C11.0718 4.16751 13.5844 6.92687 14.3285 7.82959C13.5857 8.73259 11.0782 11.491 8.17072 11.491Z" />
                                  <path d="M8.17073 4.9635C6.5906 4.9635 5.30501 6.2491 5.30501 7.82923C5.30501 9.40936 6.5906 10.695 8.17073 10.695C9.75087 10.695 11.0365 9.40936 11.0365 7.82923C11.0365 6.2491 9.75087 4.9635 8.17073 4.9635ZM8.17073 9.73969C7.11726 9.73969 6.26027 8.88268 6.26027 7.82923C6.26027 6.77578 7.11728 5.91876 8.17073 5.91876C9.22418 5.91876 10.0812 6.77578 10.0812 7.82923C10.0812 8.88268 9.22421 9.73969 8.17073 9.73969Z" />
                                </g>
                              </svg>
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="product-card-content">
                      <p><Link legacyBehavior href="/shop"><a>Radiant Glow</a></Link></p>
                      <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Brightening Vitamin</a></Link></h6>
                      <span>$145.00 <del>$200.00</del></span>
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
                  </div>
                </SwiperSlide>
                <SwiperSlide className="swiper-slide">
                  <div className="product-card2">
                    <div className="batch">
                      <span>-15%</span>
                    </div>
                    <div className="product-card-img">
                      <Link legacyBehavior href="/shop">
                        <a>
                        <img src="/assets/img/home2/product-img-14.png" alt="" />
                        </a>
                      </Link>
                      <div className="cart-btn-area">
                        <div className="cart-btn">
                          <Link legacyBehavior href="/shop/cart"><a  className="add-cart-btn2 round hover-btn5"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                        </div>
                      </div>
                      <div className="view-and-favorite-area">
                        <ul>
                          <li>
                            <Link legacyBehavior href="/shop/whistlist">
                              <a>
                              <svg xmlns="http://www.w3.org/2000/svg" width={13} height={13} viewBox="0 0 13 13">
                                <g clipPath="url(#clip0_1106_270)">
                                  <path d="M11.1281 2.35735C10.8248 2.03132 10.4577 1.77117 10.0496 1.59305C9.64144 1.41493 9.20104 1.32266 8.75574 1.32197C8.31008 1.32248 7.86929 1.41462 7.46073 1.59266C7.05218 1.7707 6.6846 2.03084 6.38081 2.35692L6.17153 2.57807L5.96225 2.35692C4.74378 1.04552 2.69289 0.970207 1.38151 2.18868C1.32339 2.24269 1.26727 2.29881 1.21326 2.35692C-0.0793057 3.75111 -0.0793057 5.90577 1.21326 7.29996L5.86398 12.2044C6.02488 12.3743 6.29301 12.3816 6.46288 12.2207C6.46844 12.2154 6.47385 12.21 6.47911 12.2044L11.1281 7.29996C12.4206 5.90592 12.4206 3.75139 11.1281 2.35735ZM10.5151 6.7166H10.5147L6.17153 11.2974L1.82797 6.7166C0.840522 5.65131 0.840522 4.00515 1.82797 2.93986C2.72468 1.96795 4.23954 1.90701 5.21144 2.80373C5.25862 2.84726 5.30404 2.89268 5.34757 2.93986L5.86398 3.48467C6.03416 3.65376 6.30893 3.65376 6.47911 3.48467L6.99552 2.94028C7.89224 1.96838 9.40709 1.90744 10.379 2.80415C10.4262 2.84769 10.4716 2.8931 10.5151 2.94028C11.5112 4.00726 11.5185 5.65642 10.5151 6.7166Z" />
                                </g>
                              </svg>
                              </a>
                            </Link>
                          </li>
                          <li>
                            <a data-bs-toggle="modal" data-bs-target="#product-view">
                              <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 16 16">
                                <g clipPath="url(#clip0_1106_264)">
                                  <path d="M15.3226 7.54747C15.1932 7.37042 12.1093 3.21228 8.17072 3.21228C4.23211 3.21228 1.14813 7.37042 1.01884 7.5473C0.959103 7.62915 0.92691 7.72785 0.92691 7.82918C0.92691 7.9305 0.959103 8.02921 1.01884 8.11105C1.14813 8.28811 4.23211 12.4462 8.17072 12.4462C12.1093 12.4462 15.1932 8.28808 15.3226 8.1112C15.3824 8.02939 15.4147 7.93068 15.4147 7.82933C15.4147 7.72799 15.3824 7.62928 15.3226 7.54747ZM8.17072 11.491C5.26951 11.491 2.75676 8.73117 2.01293 7.82894C2.75579 6.92591 5.26329 4.16751 8.17072 4.16751C11.0718 4.16751 13.5844 6.92687 14.3285 7.82959C13.5857 8.73259 11.0782 11.491 8.17072 11.491Z" />
                                  <path d="M8.17073 4.9635C6.5906 4.9635 5.30501 6.2491 5.30501 7.82923C5.30501 9.40936 6.5906 10.695 8.17073 10.695C9.75087 10.695 11.0365 9.40936 11.0365 7.82923C11.0365 6.2491 9.75087 4.9635 8.17073 4.9635ZM8.17073 9.73969C7.11726 9.73969 6.26027 8.88268 6.26027 7.82923C6.26027 6.77578 7.11728 5.91876 8.17073 5.91876C9.22418 5.91876 10.0812 6.77578 10.0812 7.82923C10.0812 8.88268 9.22421 9.73969 8.17073 9.73969Z" />
                                </g>
                              </svg>
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="product-card-content">
                      <p><Link legacyBehavior href="/shop"><a>Silk Glow</a></Link></p>
                      <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Shimmering Eyeshadow</a></Link></h6>
                      <span>$148.00 <del>$200.00</del></span>
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
                  </div>
                </SwiperSlide>
                <SwiperSlide className="swiper-slide">
                  <div className="product-card2">
                    <div className="batch">
                      <span>-10%</span>
                    </div>
                    <div className="product-card-img">
                      <Link legacyBehavior href="/shop">
                        <a>
                        <img src="/assets/img/home2/product-img-15.png" alt="" />
                        </a>
                      </Link>
                      <div className="cart-btn-area">
                        <div className="cart-btn">
                          <Link legacyBehavior href="/shop/cart"><a  className="add-cart-btn2 round hover-btn5"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                        </div>
                      </div>
                      <div className="view-and-favorite-area">
                        <ul>
                          <li>
                            <Link legacyBehavior href="/shop/whistlist">
                              <a>
                              <svg xmlns="http://www.w3.org/2000/svg" width={13} height={13} viewBox="0 0 13 13">
                                <g clipPath="url(#clip0_1106_270)">
                                  <path d="M11.1281 2.35735C10.8248 2.03132 10.4577 1.77117 10.0496 1.59305C9.64144 1.41493 9.20104 1.32266 8.75574 1.32197C8.31008 1.32248 7.86929 1.41462 7.46073 1.59266C7.05218 1.7707 6.6846 2.03084 6.38081 2.35692L6.17153 2.57807L5.96225 2.35692C4.74378 1.04552 2.69289 0.970207 1.38151 2.18868C1.32339 2.24269 1.26727 2.29881 1.21326 2.35692C-0.0793057 3.75111 -0.0793057 5.90577 1.21326 7.29996L5.86398 12.2044C6.02488 12.3743 6.29301 12.3816 6.46288 12.2207C6.46844 12.2154 6.47385 12.21 6.47911 12.2044L11.1281 7.29996C12.4206 5.90592 12.4206 3.75139 11.1281 2.35735ZM10.5151 6.7166H10.5147L6.17153 11.2974L1.82797 6.7166C0.840522 5.65131 0.840522 4.00515 1.82797 2.93986C2.72468 1.96795 4.23954 1.90701 5.21144 2.80373C5.25862 2.84726 5.30404 2.89268 5.34757 2.93986L5.86398 3.48467C6.03416 3.65376 6.30893 3.65376 6.47911 3.48467L6.99552 2.94028C7.89224 1.96838 9.40709 1.90744 10.379 2.80415C10.4262 2.84769 10.4716 2.8931 10.5151 2.94028C11.5112 4.00726 11.5185 5.65642 10.5151 6.7166Z" />
                                </g>
                              </svg>
                              </a>
                            </Link>
                          </li>
                          <li>
                            <a data-bs-toggle="modal" data-bs-target="#product-view">
                              <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 16 16">
                                <g clipPath="url(#clip0_1106_264)">
                                  <path d="M15.3226 7.54747C15.1932 7.37042 12.1093 3.21228 8.17072 3.21228C4.23211 3.21228 1.14813 7.37042 1.01884 7.5473C0.959103 7.62915 0.92691 7.72785 0.92691 7.82918C0.92691 7.9305 0.959103 8.02921 1.01884 8.11105C1.14813 8.28811 4.23211 12.4462 8.17072 12.4462C12.1093 12.4462 15.1932 8.28808 15.3226 8.1112C15.3824 8.02939 15.4147 7.93068 15.4147 7.82933C15.4147 7.72799 15.3824 7.62928 15.3226 7.54747ZM8.17072 11.491C5.26951 11.491 2.75676 8.73117 2.01293 7.82894C2.75579 6.92591 5.26329 4.16751 8.17072 4.16751C11.0718 4.16751 13.5844 6.92687 14.3285 7.82959C13.5857 8.73259 11.0782 11.491 8.17072 11.491Z" />
                                  <path d="M8.17073 4.9635C6.5906 4.9635 5.30501 6.2491 5.30501 7.82923C5.30501 9.40936 6.5906 10.695 8.17073 10.695C9.75087 10.695 11.0365 9.40936 11.0365 7.82923C11.0365 6.2491 9.75087 4.9635 8.17073 4.9635ZM8.17073 9.73969C7.11726 9.73969 6.26027 8.88268 6.26027 7.82923C6.26027 6.77578 7.11728 5.91876 8.17073 5.91876C9.22418 5.91876 10.0812 6.77578 10.0812 7.82923C10.0812 8.88268 9.22421 9.73969 8.17073 9.73969Z" />
                                </g>
                              </svg>
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="product-card-content">
                      <p><Link legacyBehavior href="/shop"><a>Crystal Clear</a></Link></p>
                      <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Skin Clarifying Cleanser</a></Link></h6>
                      <span>$129.00 <del>$200.00</del></span>
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
                  </div>
                </SwiperSlide>
                <SwiperSlide className="swiper-slide">
                  <div className="product-card2">
                    <div className="batch">
                      <span>NEW</span>
                    </div>
                    <div className="product-card-img">
                      <Link legacyBehavior href="/shop">
                      <a>
                        <img src="/assets/img/home2/product-img-16.png" alt="" />
                      </a>
                      </Link>
                      <div className="out-of-stock">
                        <span>Out Of Stock</span>
                      </div>
                      <div className="cart-btn-area">
                        <div className="cart-btn two">
                          <Link legacyBehavior href="/shop/out-of-stock"><a  className="add-cart-btn2 round hover-btn5">Request Stock</a></Link>
                        </div>
                      </div>
                      <div className="view-and-favorite-area">
                        <ul>
                          <li>
                            <Link legacyBehavior href="/shop/whistlist">
                              <a>
                              <svg xmlns="http://www.w3.org/2000/svg" width={13} height={13} viewBox="0 0 13 13">
                                <g clipPath="url(#clip0_1106_270)">
                                  <path d="M11.1281 2.35735C10.8248 2.03132 10.4577 1.77117 10.0496 1.59305C9.64144 1.41493 9.20104 1.32266 8.75574 1.32197C8.31008 1.32248 7.86929 1.41462 7.46073 1.59266C7.05218 1.7707 6.6846 2.03084 6.38081 2.35692L6.17153 2.57807L5.96225 2.35692C4.74378 1.04552 2.69289 0.970207 1.38151 2.18868C1.32339 2.24269 1.26727 2.29881 1.21326 2.35692C-0.0793057 3.75111 -0.0793057 5.90577 1.21326 7.29996L5.86398 12.2044C6.02488 12.3743 6.29301 12.3816 6.46288 12.2207C6.46844 12.2154 6.47385 12.21 6.47911 12.2044L11.1281 7.29996C12.4206 5.90592 12.4206 3.75139 11.1281 2.35735ZM10.5151 6.7166H10.5147L6.17153 11.2974L1.82797 6.7166C0.840522 5.65131 0.840522 4.00515 1.82797 2.93986C2.72468 1.96795 4.23954 1.90701 5.21144 2.80373C5.25862 2.84726 5.30404 2.89268 5.34757 2.93986L5.86398 3.48467C6.03416 3.65376 6.30893 3.65376 6.47911 3.48467L6.99552 2.94028C7.89224 1.96838 9.40709 1.90744 10.379 2.80415C10.4262 2.84769 10.4716 2.8931 10.5151 2.94028C11.5112 4.00726 11.5185 5.65642 10.5151 6.7166Z" />
                                </g>
                              </svg>
                              </a>
                            </Link>
                          </li>
                          <li>
                            <a data-bs-toggle="modal" data-bs-target="#product-view">
                              <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 16 16">
                                <g clipPath="url(#clip0_1106_264)">
                                  <path d="M15.3226 7.54747C15.1932 7.37042 12.1093 3.21228 8.17072 3.21228C4.23211 3.21228 1.14813 7.37042 1.01884 7.5473C0.959103 7.62915 0.92691 7.72785 0.92691 7.82918C0.92691 7.9305 0.959103 8.02921 1.01884 8.11105C1.14813 8.28811 4.23211 12.4462 8.17072 12.4462C12.1093 12.4462 15.1932 8.28808 15.3226 8.1112C15.3824 8.02939 15.4147 7.93068 15.4147 7.82933C15.4147 7.72799 15.3824 7.62928 15.3226 7.54747ZM8.17072 11.491C5.26951 11.491 2.75676 8.73117 2.01293 7.82894C2.75579 6.92591 5.26329 4.16751 8.17072 4.16751C11.0718 4.16751 13.5844 6.92687 14.3285 7.82959C13.5857 8.73259 11.0782 11.491 8.17072 11.491Z" />
                                  <path d="M8.17073 4.9635C6.5906 4.9635 5.30501 6.2491 5.30501 7.82923C5.30501 9.40936 6.5906 10.695 8.17073 10.695C9.75087 10.695 11.0365 9.40936 11.0365 7.82923C11.0365 6.2491 9.75087 4.9635 8.17073 4.9635ZM8.17073 9.73969C7.11726 9.73969 6.26027 8.88268 6.26027 7.82923C6.26027 6.77578 7.11728 5.91876 8.17073 5.91876C9.22418 5.91876 10.0812 6.77578 10.0812 7.82923C10.0812 8.88268 9.22421 9.73969 8.17073 9.73969Z" />
                                </g>
                              </svg>
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="product-card-content">
                      <p><Link legacyBehavior href="/shop"><a>Lash Luxe</a></Link></p>
                      <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Volume Boosting Mascara</a></Link></h6>
                      <span>$117.00 <del>$200.00</del></span>
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
                  </div>
                </SwiperSlide>
                <SwiperSlide className="swiper-slide">
                  <div className="product-card2">
                    <div className="batch">
                      <span>NEW</span>
                    </div>
                    <div className="product-card-img">
                      <Link legacyBehavior href="/shop">
                      <a>
                        <img src="/assets/img/home2/product-img-1.png" alt="" />
                      </a>
                      </Link>
                      <div className="cart-btn-area">
                        <div className="cart-btn">
                          <Link legacyBehavior href="/shop/cart"><a  className="add-cart-btn2 round hover-btn5"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                        </div>
                      </div>
                      <div className="view-and-favorite-area">
                        <ul>
                          <li>
                            <Link legacyBehavior href="/shop/whistlist">
                              <a>
                              <svg xmlns="http://www.w3.org/2000/svg" width={13} height={13} viewBox="0 0 13 13">
                                <g clipPath="url(#clip0_1106_270)">
                                  <path d="M11.1281 2.35735C10.8248 2.03132 10.4577 1.77117 10.0496 1.59305C9.64144 1.41493 9.20104 1.32266 8.75574 1.32197C8.31008 1.32248 7.86929 1.41462 7.46073 1.59266C7.05218 1.7707 6.6846 2.03084 6.38081 2.35692L6.17153 2.57807L5.96225 2.35692C4.74378 1.04552 2.69289 0.970207 1.38151 2.18868C1.32339 2.24269 1.26727 2.29881 1.21326 2.35692C-0.0793057 3.75111 -0.0793057 5.90577 1.21326 7.29996L5.86398 12.2044C6.02488 12.3743 6.29301 12.3816 6.46288 12.2207C6.46844 12.2154 6.47385 12.21 6.47911 12.2044L11.1281 7.29996C12.4206 5.90592 12.4206 3.75139 11.1281 2.35735ZM10.5151 6.7166H10.5147L6.17153 11.2974L1.82797 6.7166C0.840522 5.65131 0.840522 4.00515 1.82797 2.93986C2.72468 1.96795 4.23954 1.90701 5.21144 2.80373C5.25862 2.84726 5.30404 2.89268 5.34757 2.93986L5.86398 3.48467C6.03416 3.65376 6.30893 3.65376 6.47911 3.48467L6.99552 2.94028C7.89224 1.96838 9.40709 1.90744 10.379 2.80415C10.4262 2.84769 10.4716 2.8931 10.5151 2.94028C11.5112 4.00726 11.5185 5.65642 10.5151 6.7166Z" />
                                </g>
                              </svg>
                              </a>
                            </Link>
                          </li>
                          <li>
                            <a data-bs-toggle="modal" data-bs-target="#product-view">
                              <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 16 16">
                                <g clipPath="url(#clip0_1106_264)">
                                  <path d="M15.3226 7.54747C15.1932 7.37042 12.1093 3.21228 8.17072 3.21228C4.23211 3.21228 1.14813 7.37042 1.01884 7.5473C0.959103 7.62915 0.92691 7.72785 0.92691 7.82918C0.92691 7.9305 0.959103 8.02921 1.01884 8.11105C1.14813 8.28811 4.23211 12.4462 8.17072 12.4462C12.1093 12.4462 15.1932 8.28808 15.3226 8.1112C15.3824 8.02939 15.4147 7.93068 15.4147 7.82933C15.4147 7.72799 15.3824 7.62928 15.3226 7.54747ZM8.17072 11.491C5.26951 11.491 2.75676 8.73117 2.01293 7.82894C2.75579 6.92591 5.26329 4.16751 8.17072 4.16751C11.0718 4.16751 13.5844 6.92687 14.3285 7.82959C13.5857 8.73259 11.0782 11.491 8.17072 11.491Z" />
                                  <path d="M8.17073 4.9635C6.5906 4.9635 5.30501 6.2491 5.30501 7.82923C5.30501 9.40936 6.5906 10.695 8.17073 10.695C9.75087 10.695 11.0365 9.40936 11.0365 7.82923C11.0365 6.2491 9.75087 4.9635 8.17073 4.9635ZM8.17073 9.73969C7.11726 9.73969 6.26027 8.88268 6.26027 7.82923C6.26027 6.77578 7.11728 5.91876 8.17073 5.91876C9.22418 5.91876 10.0812 6.77578 10.0812 7.82923C10.0812 8.88268 9.22421 9.73969 8.17073 9.73969Z" />
                                </g>
                              </svg>
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="product-card-content">
                      <p><Link legacyBehavior href="/shop"><a>Crystal Gleam</a></Link></p>
                      <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Crystal-Infused Highli ghter</a></Link>
                      </h6>
                      <span>$150.00 <del>$200.00</del></span>
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
                  </div>
                </SwiperSlide>
                <SwiperSlide className="swiper-slide">
                  <div className="product-card2">
                    <div className="batch">
                      <span>-15%</span>
                    </div>
                    <div className="product-card-img">
                      <Link legacyBehavior href="/shop">
                      <a>
                        <img src="/assets/img/home2/product-img-2.png" alt="" />
                      </a>
                      </Link>
                      <div className="cart-btn-area">
                        <div className="cart-btn">
                          <Link legacyBehavior href="/shop/cart"><a  className="add-cart-btn2 round hover-btn5"><i className="bi bi-bag-check" /> Add To Cart</a></Link>
                        </div>
                      </div>
                      <div className="view-and-favorite-area">
                        <ul>
                          <li>
                            <Link legacyBehavior href="/shop/whistlist">
                              <a>
                              <svg xmlns="http://www.w3.org/2000/svg" width={13} height={13} viewBox="0 0 13 13">
                                <g clipPath="url(#clip0_1106_270)">
                                  <path d="M11.1281 2.35735C10.8248 2.03132 10.4577 1.77117 10.0496 1.59305C9.64144 1.41493 9.20104 1.32266 8.75574 1.32197C8.31008 1.32248 7.86929 1.41462 7.46073 1.59266C7.05218 1.7707 6.6846 2.03084 6.38081 2.35692L6.17153 2.57807L5.96225 2.35692C4.74378 1.04552 2.69289 0.970207 1.38151 2.18868C1.32339 2.24269 1.26727 2.29881 1.21326 2.35692C-0.0793057 3.75111 -0.0793057 5.90577 1.21326 7.29996L5.86398 12.2044C6.02488 12.3743 6.29301 12.3816 6.46288 12.2207C6.46844 12.2154 6.47385 12.21 6.47911 12.2044L11.1281 7.29996C12.4206 5.90592 12.4206 3.75139 11.1281 2.35735ZM10.5151 6.7166H10.5147L6.17153 11.2974L1.82797 6.7166C0.840522 5.65131 0.840522 4.00515 1.82797 2.93986C2.72468 1.96795 4.23954 1.90701 5.21144 2.80373C5.25862 2.84726 5.30404 2.89268 5.34757 2.93986L5.86398 3.48467C6.03416 3.65376 6.30893 3.65376 6.47911 3.48467L6.99552 2.94028C7.89224 1.96838 9.40709 1.90744 10.379 2.80415C10.4262 2.84769 10.4716 2.8931 10.5151 2.94028C11.5112 4.00726 11.5185 5.65642 10.5151 6.7166Z" />
                                </g>
                              </svg>
                              </a>
                            </Link>
                          </li>
                          <li>
                            <a data-bs-toggle="modal" data-bs-target="#product-view">
                              <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 16 16">
                                <g clipPath="url(#clip0_1106_264)">
                                  <path d="M15.3226 7.54747C15.1932 7.37042 12.1093 3.21228 8.17072 3.21228C4.23211 3.21228 1.14813 7.37042 1.01884 7.5473C0.959103 7.62915 0.92691 7.72785 0.92691 7.82918C0.92691 7.9305 0.959103 8.02921 1.01884 8.11105C1.14813 8.28811 4.23211 12.4462 8.17072 12.4462C12.1093 12.4462 15.1932 8.28808 15.3226 8.1112C15.3824 8.02939 15.4147 7.93068 15.4147 7.82933C15.4147 7.72799 15.3824 7.62928 15.3226 7.54747ZM8.17072 11.491C5.26951 11.491 2.75676 8.73117 2.01293 7.82894C2.75579 6.92591 5.26329 4.16751 8.17072 4.16751C11.0718 4.16751 13.5844 6.92687 14.3285 7.82959C13.5857 8.73259 11.0782 11.491 8.17072 11.491Z" />
                                  <path d="M8.17073 4.9635C6.5906 4.9635 5.30501 6.2491 5.30501 7.82923C5.30501 9.40936 6.5906 10.695 8.17073 10.695C9.75087 10.695 11.0365 9.40936 11.0365 7.82923C11.0365 6.2491 9.75087 4.9635 8.17073 4.9635ZM8.17073 9.73969C7.11726 9.73969 6.26027 8.88268 6.26027 7.82923C6.26027 6.77578 7.11728 5.91876 8.17073 5.91876C9.22418 5.91876 10.0812 6.77578 10.0812 7.82923C10.0812 8.88268 9.22421 9.73969 8.17073 9.73969Z" />
                                </g>
                              </svg>
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="product-card-content">
                      <p><Link legacyBehavior href="/shop"><a>Crystal</a></Link></p>
                      <h6><Link legacyBehavior href="/shop/product-default"><a  className="hover-underline">Prism Eyeshadow Palette</a></Link></h6>
                      <span>$170.00 <del>$200.00</del></span>
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
                  </div>
                </SwiperSlide>
              </div>
            </Swiper>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TopSellingProduct
