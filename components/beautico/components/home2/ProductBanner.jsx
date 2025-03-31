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

const ProductBanner = () => {

    const productBannerSlider = useMemo(()=>{
        return {
          slidesPerView: "auto",
          spaceBetween: 30,
          loop: true,
          speed: 1500,
          autoplay: true,
          effect: "fade",
          fadeEffect: {
            crossFade: true,
          },
          navigation: {
            nextEl: ".pd-banner-next-btn",
            prevEl: ".pd-banner-prev-btn",
          },
        }
      },[])

    
  return (
    <div className="product-banner-section mb-110">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="product-banner-bg">
              <Swiper {...productBannerSlider} className="swiper product-banner-slider">
                <div className="swiper-wrapper">
                  <SwiperSlide className="swiper-slide">
                    <div className="product-banner-wrapper">
                      <div className="product-banner-left-img">
                        <img src="/assets/img/home2/product-banner-img1.png" alt="" />
                      </div>
                      <div className="product-banner-content"> 
                        <h2>Try fresh product for your face.</h2>
                        <Link legacyBehavior href="/shop"><a  className="primary-btn3 black-bg hover-btn5 hover-white">Shop Now</a></Link>
                      </div>
                      <div className="product-banner-right-img">
                        <img src="/assets/img/home2/product-banner-img2.png" alt="" />
                      </div>
                    </div>
                  </SwiperSlide>
                  <SwiperSlide className="swiper-slide">
                    <div className="product-banner-wrapper">
                      <div className="product-banner-left-img">
                        <img src="/assets/img/home2/product-banner-img4.png" alt="" />
                      </div>
                      <div className="product-banner-content"> 
                        <h2>Refreshing Skin Revival Elixir</h2>
                        <Link legacyBehavior href="/shop"><a  className="primary-btn3 black-bg hover-btn5 hover-white">Shop Now</a></Link>
                      </div>
                      <div className="product-banner-right-img">
                        <img src="/assets/img/home2/product-banner-img3.png" alt="" />
                      </div>
                    </div>
                  </SwiperSlide>
                  <SwiperSlide className="swiper-slide">
                    <div className="product-banner-wrapper">
                      <div className="product-banner-left-img">
                        <img src="/assets/img/home2/product-banner-img5.png" alt="" />
                      </div>
                      <div className="product-banner-content"> 
                        <h2>Renewing Facial Awakening Serum</h2>
                        <Link legacyBehavior href="/shop"><a  className="primary-btn3 black-bg hover-btn5 hover-white">Shop Now</a></Link>
                      </div>
                      <div className="product-banner-right-img">
                        <img src="/assets/img/home2/product-banner-img6.png" alt="" />
                      </div>
                    </div>
                  </SwiperSlide>
                </div>
              </Swiper>
              <div className="product-banner-slider-btn">
                <div className="pd-banner-prev-btn slider-btn-bg">
                  <i className="bx bxs-chevron-left" />
                </div>
                <div className="pd-banner-next-btn slider-btn-bg two">
                  <i className="bx bxs-chevron-right" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  
  )
}

export default ProductBanner
