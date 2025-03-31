
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


const ExclusiveProduct = () => {
  const exclusiveSlideSettings = useMemo(()=>{
    return {
      slidesPerView: "auto",
      spaceBetween: 30,
      loop: true,
      speed: 1000,
      effect: "fade",
      fadeEffect: {
        crossFade: true,
      },
      navigation: {
        nextEl: ".exclusive-next-btn",
        prevEl: ".exclusive-prev-btn",
      },
      }
    },[])
  return (
    <div className="exclusive-product-section mb-110">
      <img src="/assets/img/home1/icon/vector-3.svg" alt="" className="vector3" />
      <img src="/assets/img/home1/icon/vector-4.svg" alt="" className="vector4" />
      <div className="container">
        <div className="section-title style-2 text-center">
          <h3>Exclusive Product</h3>
        </div>
        <div className="row">
          <div className="col-lg-12">
            <Swiper {...exclusiveSlideSettings} className="swiper exclusive-slider">
              <div className="swiper-wrapper">
                <SwiperSlide className="swiper-slide">
                  <div className="row g-4">
                    <div className="col-lg-6">
                      <div className="exclusive-product-left">
                        <h2>Infallible Pro Matte Perfume.</h2>
                        <p>Whatever your summer looks like, bring your own heat with up to 25% off Lumin Brand.Pellentesque ipsum dui, laoreet vitae ex in, pellentesque aliquam leo.</p>
                        <ul>
                          <li>
                            <svg width={13} height={11} viewBox="0 0 13 11" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12.2986 0.0327999C9.89985 0.832756 6.86143 2.97809 4.03623 6.6688L2.36599 4.778C2.09946 4.4871 1.63748 4.4871 1.38872 4.778L0.162693 6.17792C-0.0682981 6.45063 -0.0505298 6.86879 0.19823 7.12332L3.96516 10.814C4.28499 11.1231 4.78251 11.0322 4.99574 10.6504C7.00358 6.92333 9.17134 4.15985 12.7961 0.996384C13.2581 0.596406 12.8672 -0.167189 12.2986 0.0327999Z" />
                            </svg>
                            Paraben-Free
                          </li>
                          <li>
                            <svg width={13} height={11} viewBox="0 0 13 11" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12.2986 0.0327999C9.89985 0.832756 6.86143 2.97809 4.03623 6.6688L2.36599 4.778C2.09946 4.4871 1.63748 4.4871 1.38872 4.778L0.162693 6.17792C-0.0682981 6.45063 -0.0505298 6.86879 0.19823 7.12332L3.96516 10.814C4.28499 11.1231 4.78251 11.0322 4.99574 10.6504C7.00358 6.92333 9.17134 4.15985 12.7961 0.996384C13.2581 0.596406 12.8672 -0.167189 12.2986 0.0327999Z" />
                            </svg>
                            Sulfate-Free 
                          </li>
                          <li>
                            <svg width={13} height={11} viewBox="0 0 13 11" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12.2986 0.0327999C9.89985 0.832756 6.86143 2.97809 4.03623 6.6688L2.36599 4.778C2.09946 4.4871 1.63748 4.4871 1.38872 4.778L0.162693 6.17792C-0.0682981 6.45063 -0.0505298 6.86879 0.19823 7.12332L3.96516 10.814C4.28499 11.1231 4.78251 11.0322 4.99574 10.6504C7.00358 6.92333 9.17134 4.15985 12.7961 0.996384C13.2581 0.596406 12.8672 -0.167189 12.2986 0.0327999Z" />
                            </svg>
                            Clean at Sephora
                          </li>
                          <li>
                            <svg width={13} height={11} viewBox="0 0 13 11" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12.2986 0.0327999C9.89985 0.832756 6.86143 2.97809 4.03623 6.6688L2.36599 4.778C2.09946 4.4871 1.63748 4.4871 1.38872 4.778L0.162693 6.17792C-0.0682981 6.45063 -0.0505298 6.86879 0.19823 7.12332L3.96516 10.814C4.28499 11.1231 4.78251 11.0322 4.99574 10.6504C7.00358 6.92333 9.17134 4.15985 12.7961 0.996384C13.2581 0.596406 12.8672 -0.167189 12.2986 0.0327999Z" />
                            </svg>
                            Fragrance Free
                          </li>
                          <li>
                            <svg width={13} height={11} viewBox="0 0 13 11" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12.2986 0.0327999C9.89985 0.832756 6.86143 2.97809 4.03623 6.6688L2.36599 4.778C2.09946 4.4871 1.63748 4.4871 1.38872 4.778L0.162693 6.17792C-0.0682981 6.45063 -0.0505298 6.86879 0.19823 7.12332L3.96516 10.814C4.28499 11.1231 4.78251 11.0322 4.99574 10.6504C7.00358 6.92333 9.17134 4.15985 12.7961 0.996384C13.2581 0.596406 12.8672 -0.167189 12.2986 0.0327999Z" />
                            </svg>
                            Cruelty-Free
                          </li>
                          <li>
                            <svg width={13} height={11} viewBox="0 0 13 11" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12.2986 0.0327999C9.89985 0.832756 6.86143 2.97809 4.03623 6.6688L2.36599 4.778C2.09946 4.4871 1.63748 4.4871 1.38872 4.778L0.162693 6.17792C-0.0682981 6.45063 -0.0505298 6.86879 0.19823 7.12332L3.96516 10.814C4.28499 11.1231 4.78251 11.0322 4.99574 10.6504C7.00358 6.92333 9.17134 4.15985 12.7961 0.996384C13.2581 0.596406 12.8672 -0.167189 12.2986 0.0327999Z" />
                            </svg>
                            Antioxidants    
                          </li>
                        </ul>
                        <Link legacyBehavior href="/shop"><a  className="primary-btn1 hover-btn3">*Buy Now*</a></Link>
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="exclusive-product-right">
                        <div className="product-right-img hover-img">
                          <Link legacyBehavior href="/shop/product-default">
                            <a>
                            <img src="/assets/img/home1/ex-product-img-01.png" alt="" />
                            </a>
                          </Link>
                        </div>
                        <div className="product-right-content">
                          <Link legacyBehavior href="/shop">
                            <a>
                            <img src="/assets/img/home1/loreal-logo.png" alt="" />
                            </a>
                          </Link>
                          <div className="star-bg">
                            <img src="/assets/img/home1/star.svg" alt="" />
                            <span>NEW</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide className="swiper-slide">
                  <div className="row g-4">
                    <div className="col-lg-6">
                      <div className="exclusive-product-left">
                        <h2>Radiant Glow Moisturizer.</h2>
                        <p>Whatever your summer looks like, bring your own heat with up to 25% off Lumin Brand.Pellentesque ipsum dui, laoreet vitae ex in, pellentesque aliquam leo.</p>
                        <ul>
                          <li>
                            <svg width={13} height={11} viewBox="0 0 13 11" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12.2986 0.0327999C9.89985 0.832756 6.86143 2.97809 4.03623 6.6688L2.36599 4.778C2.09946 4.4871 1.63748 4.4871 1.38872 4.778L0.162693 6.17792C-0.0682981 6.45063 -0.0505298 6.86879 0.19823 7.12332L3.96516 10.814C4.28499 11.1231 4.78251 11.0322 4.99574 10.6504C7.00358 6.92333 9.17134 4.15985 12.7961 0.996384C13.2581 0.596406 12.8672 -0.167189 12.2986 0.0327999Z" />
                            </svg>
                            Paraben-Free
                          </li>
                          <li>
                            <svg width={13} height={11} viewBox="0 0 13 11" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12.2986 0.0327999C9.89985 0.832756 6.86143 2.97809 4.03623 6.6688L2.36599 4.778C2.09946 4.4871 1.63748 4.4871 1.38872 4.778L0.162693 6.17792C-0.0682981 6.45063 -0.0505298 6.86879 0.19823 7.12332L3.96516 10.814C4.28499 11.1231 4.78251 11.0322 4.99574 10.6504C7.00358 6.92333 9.17134 4.15985 12.7961 0.996384C13.2581 0.596406 12.8672 -0.167189 12.2986 0.0327999Z" />
                            </svg>
                            Sulfate-Free 
                          </li>
                          <li>
                            <svg width={13} height={11} viewBox="0 0 13 11" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12.2986 0.0327999C9.89985 0.832756 6.86143 2.97809 4.03623 6.6688L2.36599 4.778C2.09946 4.4871 1.63748 4.4871 1.38872 4.778L0.162693 6.17792C-0.0682981 6.45063 -0.0505298 6.86879 0.19823 7.12332L3.96516 10.814C4.28499 11.1231 4.78251 11.0322 4.99574 10.6504C7.00358 6.92333 9.17134 4.15985 12.7961 0.996384C13.2581 0.596406 12.8672 -0.167189 12.2986 0.0327999Z" />
                            </svg>
                            Clean at Sephora
                          </li>
                          <li>
                            <svg width={13} height={11} viewBox="0 0 13 11" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12.2986 0.0327999C9.89985 0.832756 6.86143 2.97809 4.03623 6.6688L2.36599 4.778C2.09946 4.4871 1.63748 4.4871 1.38872 4.778L0.162693 6.17792C-0.0682981 6.45063 -0.0505298 6.86879 0.19823 7.12332L3.96516 10.814C4.28499 11.1231 4.78251 11.0322 4.99574 10.6504C7.00358 6.92333 9.17134 4.15985 12.7961 0.996384C13.2581 0.596406 12.8672 -0.167189 12.2986 0.0327999Z" />
                            </svg>
                            Fragrance Free
                          </li>
                          <li>
                            <svg width={13} height={11} viewBox="0 0 13 11" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12.2986 0.0327999C9.89985 0.832756 6.86143 2.97809 4.03623 6.6688L2.36599 4.778C2.09946 4.4871 1.63748 4.4871 1.38872 4.778L0.162693 6.17792C-0.0682981 6.45063 -0.0505298 6.86879 0.19823 7.12332L3.96516 10.814C4.28499 11.1231 4.78251 11.0322 4.99574 10.6504C7.00358 6.92333 9.17134 4.15985 12.7961 0.996384C13.2581 0.596406 12.8672 -0.167189 12.2986 0.0327999Z" />
                            </svg>
                            Cruelty-Free
                          </li>
                          <li>
                            <svg width={13} height={11} viewBox="0 0 13 11" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12.2986 0.0327999C9.89985 0.832756 6.86143 2.97809 4.03623 6.6688L2.36599 4.778C2.09946 4.4871 1.63748 4.4871 1.38872 4.778L0.162693 6.17792C-0.0682981 6.45063 -0.0505298 6.86879 0.19823 7.12332L3.96516 10.814C4.28499 11.1231 4.78251 11.0322 4.99574 10.6504C7.00358 6.92333 9.17134 4.15985 12.7961 0.996384C13.2581 0.596406 12.8672 -0.167189 12.2986 0.0327999Z" />
                            </svg>
                            Antioxidants
                          </li>
                        </ul>
                        <Link legacyBehavior href="/shop"><a  className="primary-btn1 hover-btn3">*Buy Now*</a></Link>
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="exclusive-product-right">
                        <div className="product-right-img hover-img">
                          <Link legacyBehavior href="/shop/product-default">
                            <a>
                            <img src="/assets/img/home1/ex-product-img-02.png" alt="" />
                            </a>
                          </Link>
                        </div>
                        <div className="product-right-content">
                          <Link legacyBehavior href="/shop">
                            <a>
                            <img src="/assets/img/home1/loreal-logo.png" alt="" />
                            </a>
                          </Link>
                          <div className="star-bg">
                            <img src="/assets/img/home1/star.svg" alt="" />
                            <span>NEW</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide className="swiper-slide">
                  <div className="row g-4">
                    <div className="col-lg-6">
                      <div className="exclusive-product-left">
                        <h2>Nourishing Day Cream.</h2>
                        <p>Whatever your summer looks like, bring your own heat with up to 25% off Lumin Brand.Pellentesque ipsum dui, laoreet vitae ex in, pellentesque aliquam leo.</p>
                        <ul>
                          <li>
                            <svg width={13} height={11} viewBox="0 0 13 11" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12.2986 0.0327999C9.89985 0.832756 6.86143 2.97809 4.03623 6.6688L2.36599 4.778C2.09946 4.4871 1.63748 4.4871 1.38872 4.778L0.162693 6.17792C-0.0682981 6.45063 -0.0505298 6.86879 0.19823 7.12332L3.96516 10.814C4.28499 11.1231 4.78251 11.0322 4.99574 10.6504C7.00358 6.92333 9.17134 4.15985 12.7961 0.996384C13.2581 0.596406 12.8672 -0.167189 12.2986 0.0327999Z" />
                            </svg>
                            Paraben-Free
                          </li>
                          <li>
                            <svg width={13} height={11} viewBox="0 0 13 11" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12.2986 0.0327999C9.89985 0.832756 6.86143 2.97809 4.03623 6.6688L2.36599 4.778C2.09946 4.4871 1.63748 4.4871 1.38872 4.778L0.162693 6.17792C-0.0682981 6.45063 -0.0505298 6.86879 0.19823 7.12332L3.96516 10.814C4.28499 11.1231 4.78251 11.0322 4.99574 10.6504C7.00358 6.92333 9.17134 4.15985 12.7961 0.996384C13.2581 0.596406 12.8672 -0.167189 12.2986 0.0327999Z" />
                            </svg>
                            Sulfate-Free 
                          </li>
                          <li>
                            <svg width={13} height={11} viewBox="0 0 13 11" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12.2986 0.0327999C9.89985 0.832756 6.86143 2.97809 4.03623 6.6688L2.36599 4.778C2.09946 4.4871 1.63748 4.4871 1.38872 4.778L0.162693 6.17792C-0.0682981 6.45063 -0.0505298 6.86879 0.19823 7.12332L3.96516 10.814C4.28499 11.1231 4.78251 11.0322 4.99574 10.6504C7.00358 6.92333 9.17134 4.15985 12.7961 0.996384C13.2581 0.596406 12.8672 -0.167189 12.2986 0.0327999Z" />
                            </svg>
                            Clean at Sephora
                          </li>
                          <li>
                            <svg width={13} height={11} viewBox="0 0 13 11" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12.2986 0.0327999C9.89985 0.832756 6.86143 2.97809 4.03623 6.6688L2.36599 4.778C2.09946 4.4871 1.63748 4.4871 1.38872 4.778L0.162693 6.17792C-0.0682981 6.45063 -0.0505298 6.86879 0.19823 7.12332L3.96516 10.814C4.28499 11.1231 4.78251 11.0322 4.99574 10.6504C7.00358 6.92333 9.17134 4.15985 12.7961 0.996384C13.2581 0.596406 12.8672 -0.167189 12.2986 0.0327999Z" />
                            </svg>
                            Fragrance Free
                          </li>
                          <li>
                            <svg width={13} height={11} viewBox="0 0 13 11" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12.2986 0.0327999C9.89985 0.832756 6.86143 2.97809 4.03623 6.6688L2.36599 4.778C2.09946 4.4871 1.63748 4.4871 1.38872 4.778L0.162693 6.17792C-0.0682981 6.45063 -0.0505298 6.86879 0.19823 7.12332L3.96516 10.814C4.28499 11.1231 4.78251 11.0322 4.99574 10.6504C7.00358 6.92333 9.17134 4.15985 12.7961 0.996384C13.2581 0.596406 12.8672 -0.167189 12.2986 0.0327999Z" />
                            </svg>
                            Cruelty-Free
                          </li>
                          <li>
                            <svg width={13} height={11} viewBox="0 0 13 11" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12.2986 0.0327999C9.89985 0.832756 6.86143 2.97809 4.03623 6.6688L2.36599 4.778C2.09946 4.4871 1.63748 4.4871 1.38872 4.778L0.162693 6.17792C-0.0682981 6.45063 -0.0505298 6.86879 0.19823 7.12332L3.96516 10.814C4.28499 11.1231 4.78251 11.0322 4.99574 10.6504C7.00358 6.92333 9.17134 4.15985 12.7961 0.996384C13.2581 0.596406 12.8672 -0.167189 12.2986 0.0327999Z" />
                            </svg>
                            Antioxidants
                          </li>
                        </ul>
                        <Link legacyBehavior href="/shop"><a  className="primary-btn1 hover-btn3">*Buy Now*</a></Link>
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="exclusive-product-right">
                        <div className="product-right-img hover-img">
                          <Link legacyBehavior href="/shop/product-default">
                            <a>
                            <img src="/assets/img/home1/ex-product-img-03.png" alt="" />
                            </a>
                          </Link>
                        </div>
                        <div className="product-right-content">
                          <Link legacyBehavior href="/shop">
                            <a>
                            <img src="/assets/img/home1/loreal-logo.png" alt="" />
                            </a>
                          </Link>
                          <div className="star-bg">
                            <img src="/assets/img/home1/star.svg" alt="" />
                            <span>NEW</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              </div>
            </Swiper>
            <div className="slider-btn">
              <div className="prev-btn exclusive-prev-btn">
                <i className="bi bi-arrow-up" />
              </div>
              <div className="next-btn exclusive-next-btn">
                <i className="bi bi-arrow-down" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  )
}

export default ExclusiveProduct
