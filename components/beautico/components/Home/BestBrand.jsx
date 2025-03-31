
import React, {  useMemo } from "react";
import Link from "next/link";
import SwiperCore, {
  Autoplay,
  EffectFade,
  Navigation,
  Pagination,
} from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { useRouter } from "next/router";
SwiperCore.use([Pagination, Autoplay, EffectFade, Navigation]);

const BestBrand = () => {
  const route = useRouter();
  const currentPath = route.pathname
  const bestBranSlideSettings = useMemo(()=>{
    return {
      slidesPerView: "auto",
      spaceBetween: 30,
      loop: true,
      speed: 2500,
      autoplay: {
        delay: 2000,
      },
      breakpoints: {
        280: {
          slidesPerView: 2,
          spaceBetween: 15,
        },
        386: {
          slidesPerView: 2,
          spaceBetween: 10,
        },
        576: {
          slidesPerView: 3,
        },
        768: {
          slidesPerView: 4,
        },
        992: {
          slidesPerView: 4,
        },
        1200: {
          slidesPerView: 6,
        },
        1400: {
          slidesPerView: 7,
        },
      },
      }
    },[])
  return (
    <div className={`best-brand-section mb-110 ${currentPath === "/about-us"? "style-2":""}`}>
      <div className="container-fluid">
        <div className="section-title style-2 text-center">
          <h3>Our Best Brand</h3>
        </div>
        <div className="best-brand-wrapper">
          <div className="row">
            <div className="col-lg-12">
              <Swiper {...bestBranSlideSettings} className="swiper brand-slider">
                <div className="swiper-wrapper">
                  <SwiperSlide className="swiper-slide">
                    <div className="brand-icon">
                      <Link legacyBehavior href="/shop">
                        <a>
                          <img src="/assets/img/home1/brand-logo1.png" alt="" />
                        </a>
                      </Link>
                    </div>
                  </SwiperSlide>
                  <SwiperSlide className="swiper-slide">
                    <div className="brand-icon">
                   <Link legacyBehavior href="/shop">
                        <a>
                          <img src="/assets/img/home1/brand-logo2.png" alt="" />
                        </a>
                      </Link>
                    </div>
                  </SwiperSlide>
                  <SwiperSlide className="swiper-slide">
                    <div className="brand-icon">
                   <Link legacyBehavior href="/shop">
                        <a>
                          <img src="/assets/img/home1/brand-logo3.png" alt="" />
                        </a>
                      </Link>
                    </div>
                  </SwiperSlide>
                  <SwiperSlide className="swiper-slide">
                    <div className="brand-icon">
                   <Link legacyBehavior href="/shop">
                        <a>
                          <img src="/assets/img/home1/brand-logo4.png" alt="" />
                        </a>
                      </Link>
                    </div>
                  </SwiperSlide>
                  <SwiperSlide className="swiper-slide">
                    <div className="brand-icon">
                   <Link legacyBehavior href="/shop">
                        <a>
                          <img src="/assets/img/home1/brand-logo5.png" alt="" />
                        </a>
                      </Link>
                    </div>
                  </SwiperSlide>
                  <SwiperSlide className="swiper-slide">
                    <div className="brand-icon">
                   <Link legacyBehavior href="/shop">
                        <a>
                          <img src="/assets/img/home1/brand-logo6.png" alt="" />
                        </a>
                      </Link>
                    </div>
                  </SwiperSlide>
                  <SwiperSlide className="swiper-slide">
                    <div className="brand-icon">
                   <Link legacyBehavior href="/shop">
                        <a>
                          <img src="/assets/img/home1/brand-logo7.png" alt="" />
                        </a>
                      </Link>
                    </div>
                  </SwiperSlide>
                </div>
              </Swiper>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BestBrand
