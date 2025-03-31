
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
const Testimonial = () => {
    const testimonialSlideSettings= useMemo(()=>{
        return {
            slidesPerView: "auto",
            spaceBetween: 40,
            loop: true,
            navigation: {
              nextEl: ".about-next-btn",
              prevEl: ".about-prev-btn",
            },
            pagination: {
              el: ".swiper-pagination2",
              clickable: true,
            },
            breakpoints: {
              280: {
                slidesPerView: 1,
                spaceBetween: 15,
              },
              386: {
                slidesPerView: 1,
                spaceBetween: 30,
              },
              576: {
                slidesPerView: 1,
              },
              768: {
                slidesPerView: 2,
              },
              992: {
                slidesPerView: 2,
              },
              1200: {
                slidesPerView: 3,
              },
              1400: {
                slidesPerView: 3,
              },
            },
          }
        },[])


  return (
    <div className="say-about-section mb-110">
      <img src="/assets/img/home1/testimonial-vector-2.png" alt="" className="vector3" />
      <img src="/assets/img/home1/testimonial-vector-1.png" alt="" className="vector4" />
      <div className="container-fluid p-0">
          <div className="section-title2 style-3">
          <h3>They Say About Our Product</h3>
          <div className="slider-btn">
              <div className="about-prev-btn">
              <i className="bi bi-arrow-left" />
              </div>
              <div className="about-next-btn">
              <i className="bi bi-arrow-right" />
              </div>
          </div>
          </div>
          <div className="say-about-wrapper">
          <div className="row">
              <div className="col-lg-12">
              <Swiper {...testimonialSlideSettings} className="swiper say-about-slider">
                  <div className="swiper-wrapper">
                  <SwiperSlide className="swiper-slide">
                      <div className="say-about-card">
                      <div className="say-about-card-top">
                          <ul>
                          <li><i className="bi bi-star-fill" /></li>
                          <li><i className="bi bi-star-fill" /></li>
                          <li><i className="bi bi-star-fill" /></li>
                          <li><i className="bi bi-star-fill" /></li>
                          <li><i className="bi bi-star-fill" /></li>
                          </ul>
                      </div>
                      <p>“I was recommended snaga from a dear friendest onest Gives energy, strength &amp; mostly youm motivationt goint and WOW!!! Gives energy, strength &amp; mostlydat youm motivation”</p>
                      <div className="say-about-card-bottom">
                          <div className="author-area">
                          <div className="author-img">
                              <img src="/assets/img/home2/testimonial-author-img1.png" alt="" />
                          </div>
                          <div className="author">
                              <h5>Jayden Carter</h5>
                              <p>Manager at Global Business</p>
                          </div>
                          </div>
                          <div className="quote">
                          <svg width={59} height={41} viewBox="0 0 59 41" xmlns="http://www.w3.org/2000/svg">
                              <g opacity="0.05">
                              <path d="M27.8217 13.4959C27.7944 13.2156 27.7396 12.9284 27.6712 12.6481C27.062 5.56517 21.1144 0 13.8664 0C6.2077 0 0 6.20099 0 13.8514C0 21.283 5.85865 27.3268 13.2093 27.6686C11.4367 30.4649 8.58264 32.7278 5.09894 33.7944L4.98259 33.8286C3.36735 34.3208 2.25175 35.8933 2.40232 37.6435C2.57342 39.6604 4.34608 41.1576 6.37196 40.9867C12.3333 40.4808 18.2946 37.4384 22.3464 32.4954C24.3791 30.0341 25.9533 27.1353 26.9114 23.9767C27.8765 20.8249 28.205 17.4202 27.8765 14.0633L27.8217 13.4959Z" />
                              <path d="M58.8217 13.4959C58.7944 13.2156 58.7396 12.9284 58.6712 12.6481C58.062 5.56517 52.1144 0 44.8664 0C37.2077 0 31 6.20099 31 13.8514C31 21.283 36.8586 27.3268 44.2093 27.6686C42.4367 30.4649 39.5826 32.7278 36.0989 33.7944L35.9826 33.8286C34.3674 34.3208 33.2517 35.8933 33.4023 37.6435C33.5734 39.6604 35.3461 41.1576 37.372 40.9867C43.3333 40.4808 49.2946 37.4384 53.3464 32.4954C55.3791 30.0341 56.9533 27.1353 57.9114 23.9767C58.8765 20.8249 59.205 17.4202 58.8765 14.0633L58.8217 13.4959Z" />
                              </g>
                          </svg>
                          </div>
                      </div>
                      </div>
                  </SwiperSlide>
                  <SwiperSlide className="swiper-slide">
                      <div className="say-about-card">
                      <div className="say-about-card-top">
                          <ul>
                          <li><i className="bi bi-star-fill" /></li>
                          <li><i className="bi bi-star-fill" /></li>
                          <li><i className="bi bi-star-fill" /></li>
                          <li><i className="bi bi-star-fill" /></li>
                          <li><i className="bi bi-star-fill" /></li>
                          </ul>
                      </div>
                      <p>“I was recommended snaga from a dear friendest onest Gives energy, strength &amp; mostly youm motivationt goint and WOW!!! Gives energy, strength &amp; mostlydat youm motivation”</p>
                      <div className="say-about-card-bottom">
                          <div className="author-area">
                          <div className="author-img">
                              <img src="/assets/img/home2/testimonial-author-img2.png" alt="" />
                          </div>
                          <div className="author">
                              <h5>Colton Roman</h5>
                              <p>Ceo at Global Business</p>
                          </div>
                          </div>
                          <div className="quote">
                          <svg width={59} height={41} viewBox="0 0 59 41" xmlns="http://www.w3.org/2000/svg">
                              <g opacity="0.05">
                              <path d="M27.8217 13.4959C27.7944 13.2156 27.7396 12.9284 27.6712 12.6481C27.062 5.56517 21.1144 0 13.8664 0C6.2077 0 0 6.20099 0 13.8514C0 21.283 5.85865 27.3268 13.2093 27.6686C11.4367 30.4649 8.58264 32.7278 5.09894 33.7944L4.98259 33.8286C3.36735 34.3208 2.25175 35.8933 2.40232 37.6435C2.57342 39.6604 4.34608 41.1576 6.37196 40.9867C12.3333 40.4808 18.2946 37.4384 22.3464 32.4954C24.3791 30.0341 25.9533 27.1353 26.9114 23.9767C27.8765 20.8249 28.205 17.4202 27.8765 14.0633L27.8217 13.4959Z" />
                              <path d="M58.8217 13.4959C58.7944 13.2156 58.7396 12.9284 58.6712 12.6481C58.062 5.56517 52.1144 0 44.8664 0C37.2077 0 31 6.20099 31 13.8514C31 21.283 36.8586 27.3268 44.2093 27.6686C42.4367 30.4649 39.5826 32.7278 36.0989 33.7944L35.9826 33.8286C34.3674 34.3208 33.2517 35.8933 33.4023 37.6435C33.5734 39.6604 35.3461 41.1576 37.372 40.9867C43.3333 40.4808 49.2946 37.4384 53.3464 32.4954C55.3791 30.0341 56.9533 27.1353 57.9114 23.9767C58.8765 20.8249 59.205 17.4202 58.8765 14.0633L58.8217 13.4959Z" />
                              </g>
                          </svg>
                          </div>
                      </div>
                      </div>
                  </SwiperSlide>
                  <diSwiperSlidev className="swiper-slide">
                      <div className="say-about-card">
                      <div className="say-about-card-top">
                          <ul>
                          <li><i className="bi bi-star-fill" /></li>
                          <li><i className="bi bi-star-fill" /></li>
                          <li><i className="bi bi-star-fill" /></li>
                          <li><i className="bi bi-star-fill" /></li>
                          <li><i className="bi bi-star-fill" /></li>
                          </ul>
                      </div>
                      <p>“I was recommended snaga from a dear friendest onest Gives energy, strength &amp; mostly youm motivationt goint and WOW!!! Gives energy, strength &amp; mostlydat youm motivation”</p>
                      <div className="say-about-card-bottom">
                          <div className="author-area">
                          <div className="author-img">
                              <img src="/assets/img/home2/testimonial-author-img3.png" alt="" />
                          </div>
                          <div className="author">
                              <h5>Lincoln Miles</h5>
                              <p>Director at Global Business</p>
                          </div>
                          </div>
                          <div className="quote">
                          <svg width={59} height={41} viewBox="0 0 59 41" xmlns="http://www.w3.org/2000/svg">
                              <g opacity="0.05">
                              <path d="M27.8217 13.4959C27.7944 13.2156 27.7396 12.9284 27.6712 12.6481C27.062 5.56517 21.1144 0 13.8664 0C6.2077 0 0 6.20099 0 13.8514C0 21.283 5.85865 27.3268 13.2093 27.6686C11.4367 30.4649 8.58264 32.7278 5.09894 33.7944L4.98259 33.8286C3.36735 34.3208 2.25175 35.8933 2.40232 37.6435C2.57342 39.6604 4.34608 41.1576 6.37196 40.9867C12.3333 40.4808 18.2946 37.4384 22.3464 32.4954C24.3791 30.0341 25.9533 27.1353 26.9114 23.9767C27.8765 20.8249 28.205 17.4202 27.8765 14.0633L27.8217 13.4959Z" />
                              <path d="M58.8217 13.4959C58.7944 13.2156 58.7396 12.9284 58.6712 12.6481C58.062 5.56517 52.1144 0 44.8664 0C37.2077 0 31 6.20099 31 13.8514C31 21.283 36.8586 27.3268 44.2093 27.6686C42.4367 30.4649 39.5826 32.7278 36.0989 33.7944L35.9826 33.8286C34.3674 34.3208 33.2517 35.8933 33.4023 37.6435C33.5734 39.6604 35.3461 41.1576 37.372 40.9867C43.3333 40.4808 49.2946 37.4384 53.3464 32.4954C55.3791 30.0341 56.9533 27.1353 57.9114 23.9767C58.8765 20.8249 59.205 17.4202 58.8765 14.0633L58.8217 13.4959Z" />
                              </g>
                          </svg>
                          </div>
                      </div>
                      </div>
                  </diSwiperSlidev>
                  </div>
              </Swiper>
              </div>
          </div>
          <div className="swiper-pagination2" />
          </div>
      </div>
    </div>
  )
}

export default Testimonial
