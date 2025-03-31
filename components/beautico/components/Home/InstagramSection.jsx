
import React, { useMemo } from "react";
import SwiperCore, {
  Autoplay,
  EffectFade,
  Navigation,
  Pagination,
} from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import GiftSection from "../common/GiftSection";
SwiperCore.use([Pagination, Autoplay, EffectFade, Navigation]);

const InstagramSection = () => {
  const sldieSettings = useMemo(()=>{
    return {
      slidesPerView: "auto",
      spaceBetween: 15,
      loop: true,
      speed: 2500,
      autoplay: {
        delay: 2000,
        disableOnInteraction: true,
      },
      breakpoints: {
        280: {
          slidesPerView: 1,
          spaceBetween: 15,
        },
        386: {
          slidesPerView: 2,
        },
        576: {
          slidesPerView: 4,
          spaceBetween: 15,
        },
        768: {
          slidesPerView: 5,
          spaceBetween: 15,
        },
        992: {
          slidesPerView: 6,
          spaceBetween: 15,
        },
        1200: {
          slidesPerView: 7,
        },
        1400: {
          slidesPerView: 8,
        },
      },
    }
  },[])
  return (
    <>
    <div className="instagram-section mb-110">
  <div className="container">
    <div className="section-title style-3">
      <h3>Instagram Feed</h3>
      <p>Follow us on <a href="#">@Egenslab</a></p>
    </div>
  </div>
  <div className="instagram-wrapper">
    <div className="container-fluid p-0">
      <div className="row">
        <div className="col-12">
          <Swiper {...sldieSettings} className="swiper instagram-slider">
            <div className="swiper-wrapper">
              <SwiperSlide className="swiper-slide">
                <a href="https://www.instagram.com/"><img src="/assets/img/home1/insta-img1.png" alt="" /></a>
              </SwiperSlide>
              <SwiperSlide className="swiper-slide">
                <a href="https://www.instagram.com/"><img src="/assets/img/home1/insta-img2.png" alt="" /></a>
              </SwiperSlide>
              <SwiperSlide className="swiper-slide">
                <a href="https://www.instagram.com/"><img src="/assets/img/home1/insta-img3.png" alt="" /></a>
              </SwiperSlide>
              <SwiperSlide className="swiper-slide">
                <a href="https://www.instagram.com/"><img src="/assets/img/home1/insta-img4.png" alt="" /></a>
              </SwiperSlide>
              <SwiperSlide className="swiper-slide">
                <a href="https://www.instagram.com/"><img src="/assets/img/home1/insta-img5.png" alt="" /></a>
              </SwiperSlide>
              <SwiperSlide className="swiper-slide">
                <a href="https://www.instagram.com/"><img src="/assets/img/home1/insta-img6.png" alt="" /></a>
              </SwiperSlide>
              <SwiperSlide className="swiper-slide">
                <a href="https://www.instagram.com/"><img src="/assets/img/home1/insta-img7.png" alt="" /></a>
              </SwiperSlide>
              <SwiperSlide className="swiper-slide">
                <a href="https://www.instagram.com/"><img src="/assets/img/home1/insta-img8.png" alt="" /></a>
              </SwiperSlide>
            </div>
          </Swiper>
        </div>
      </div>
    </div>
  </div>
   </div>

    <GiftSection/>
</>
  )
}

export default InstagramSection
