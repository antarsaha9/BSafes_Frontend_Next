import React, { useMemo } from "react";

import SwiperCore, {
  Autoplay,
  EffectFade,
  Navigation,
  Pagination,
} from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
SwiperCore.use([Pagination, Autoplay, EffectFade, Navigation]);

const Testimonial = () => {
    const testimonialSlide = useMemo(()=>{
        return {
          slidesPerView: "auto",
            loop: true,
            spaceBetween: 30,
            speed: 2000,
            centeredSlides: true,
            navigation: {
              nextEl: ".testimonial-next-btn",
              prevEl: ".testimonial-prev-btn",
            },
            autoplay: {
              delay: 5000,
            },
            breakpoints: {
              280: {
                slidesPerView: 1,
              },
              386: {
                slidesPerView: 1,
              },
              576: {
                slidesPerView: 1,
              },
              768: {
                slidesPerView: 1.5,
              },
              992: {
                slidesPerView: 2,
              },
              1200: {
                slidesPerView: 2,
              },
              1400: {
                slidesPerView: 2,
              },
            },
        }
      },[])

  return (
    <div className="testimonial-section mb-110">
      <div className="container">
        <div className="section-title3">
          <h3>What The are say <span>About us</span></h3>
          <div className="slider-btn2">
            <div className="testimonial-prev-btn">
              <i className="bx bxs-chevron-left" />
            </div>
            <div className="testimonial-next-btn">
              <i className="bx bxs-chevron-right" />
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-12">
            <Swiper {...testimonialSlide} className="swiper testimonial-slider">
              <div className="swiper-wrapper">
                <SwiperSlide className="swiper-slide">
                  <div className="testimonial-card">
                    <div className="testimonial-content">
                      <div className="author-rating">
                        <i className="bi bi-star-fill" />
                        <i className="bi bi-star-fill" />
                        <i className="bi bi-star-fill" />
                        <i className="bi bi-star-fill" />
                        <i className="bi bi-star-fill" />
                      </div>
                      <p>“I cannot express enough how satisfied I am with the web development services provided by Egens Lab. From the initial consultation to the final delivery, they have exceeded my expectations in every aspect.”</p>
                    </div>
                    <div className="testimonial-bottom">
                      <div className="author-area">
                        <h5>Mateo Daniel</h5>
                        <p>Customer</p>
                      </div>
                      <div className="testimonial-qoute">
                        <svg xmlns="http://www.w3.org/2000/svg" width={74} height={51} viewBox="0 0 74 51">
                          <g>
                            <path d="M34.6075 16.7875C34.5735 16.4389 34.5054 16.0817 34.4202 15.733C33.6625 6.92252 26.2643 0 17.2484 0C7.72178 0 0 7.71343 0 17.2298C0 26.474 7.28758 33.9918 16.4311 34.417C14.2261 37.8953 10.676 40.7102 6.34258 42.0369L6.19785 42.0794C4.18866 42.6917 2.80095 44.6477 2.98825 46.8248C3.20109 49.3336 5.40609 51.1961 7.9261 50.9835C15.3414 50.3541 22.7567 46.5697 27.7967 40.4211C30.3252 37.3595 32.2833 33.7537 33.4752 29.8247C34.6756 25.9042 35.0843 21.669 34.6756 17.4934L34.6075 16.7875Z" />
                            <path d="M73.1685 16.7875C73.1344 16.4389 73.0663 16.0817 72.9812 15.733C72.2235 6.92252 64.8252 0 55.8094 0C46.2828 0 38.561 7.71343 38.561 17.2298C38.561 26.474 45.8486 33.9918 54.9921 34.417C52.7871 37.8953 49.2369 40.7102 44.9036 42.0369L44.7588 42.0794C42.7496 42.6917 41.3619 44.6477 41.5492 46.8248C41.7621 49.3336 43.9671 51.1961 46.4871 50.9835C53.9024 50.3541 61.3177 46.5697 66.3577 40.4211C68.8862 37.3595 70.8443 33.7537 72.0362 29.8247C73.2366 25.9042 73.6453 21.669 73.2366 17.4934L73.1685 16.7875Z" />
                          </g>
                        </svg>
                      </div>
                      <div className="date-and-time">
                        <p>May 9, 2023</p>
                        <span>10.30 PM</span>
                      </div>
                    </div>
                  </div>
                  <div className="author-img-and-rating">
                    <div className="author-img">
                      <img src="/assets/img/home2/testimonial-author-img1.png" alt="" />
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide className="swiper-slide">
                  <div className="testimonial-card">
                    <div className="testimonial-content">
                      <div className="author-rating">
                        <i className="bi bi-star-fill" />
                        <i className="bi bi-star-fill" />
                        <i className="bi bi-star-fill" />
                        <i className="bi bi-star-fill" />
                        <i className="bi bi-star-fill" />
                      </div>
                      <p>“I cannot express enough how satisfied I am with the web development services provided by Egens Lab. From the initial consultation to the final delivery, they have exceeded my expectations in every aspect.”</p>
                    </div>
                    <div className="testimonial-bottom">
                      <div className="author-area">
                        <h5>Galib Alvez</h5>
                        <p>Customer</p>
                      </div>
                      <div className="testimonial-qoute">
                        <svg xmlns="http://www.w3.org/2000/svg" width={74} height={51} viewBox="0 0 74 51">
                          <g>
                            <path d="M34.6075 16.7875C34.5735 16.4389 34.5054 16.0817 34.4202 15.733C33.6625 6.92252 26.2643 0 17.2484 0C7.72178 0 0 7.71343 0 17.2298C0 26.474 7.28758 33.9918 16.4311 34.417C14.2261 37.8953 10.676 40.7102 6.34258 42.0369L6.19785 42.0794C4.18866 42.6917 2.80095 44.6477 2.98825 46.8248C3.20109 49.3336 5.40609 51.1961 7.9261 50.9835C15.3414 50.3541 22.7567 46.5697 27.7967 40.4211C30.3252 37.3595 32.2833 33.7537 33.4752 29.8247C34.6756 25.9042 35.0843 21.669 34.6756 17.4934L34.6075 16.7875Z" />
                            <path d="M73.1685 16.7875C73.1344 16.4389 73.0663 16.0817 72.9812 15.733C72.2235 6.92252 64.8252 0 55.8094 0C46.2828 0 38.561 7.71343 38.561 17.2298C38.561 26.474 45.8486 33.9918 54.9921 34.417C52.7871 37.8953 49.2369 40.7102 44.9036 42.0369L44.7588 42.0794C42.7496 42.6917 41.3619 44.6477 41.5492 46.8248C41.7621 49.3336 43.9671 51.1961 46.4871 50.9835C53.9024 50.3541 61.3177 46.5697 66.3577 40.4211C68.8862 37.3595 70.8443 33.7537 72.0362 29.8247C73.2366 25.9042 73.6453 21.669 73.2366 17.4934L73.1685 16.7875Z" />
                          </g>
                        </svg>
                      </div>
                      <div className="date-and-time">
                        <p>May 9, 2023</p>
                        <span>10.30 PM</span>
                      </div>
                    </div>
                  </div>
                  <div className="author-img-and-rating">
                    <div className="author-img">
                      <img src="/assets/img/home2/testimonial-author-img2.png" alt="" />
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide className="swiper-slide">
                  <div className="testimonial-card">
                    <div className="testimonial-content">
                      <div className="author-rating">
                        <i className="bi bi-star-fill" />
                        <i className="bi bi-star-fill" />
                        <i className="bi bi-star-fill" />
                        <i className="bi bi-star-fill" />
                        <i className="bi bi-star-fill" />
                      </div>
                      <p>“I cannot express enough how satisfied I am with the web development services provided by Egens Lab. From the initial consultation to the final delivery, they have exceeded my expectations in every aspect.”</p>
                    </div>
                    <div className="testimonial-bottom">
                      <div className="author-area">
                        <h5>David Beckham</h5>
                        <p>Customer</p>
                      </div>
                      <div className="testimonial-qoute">
                        <svg xmlns="http://www.w3.org/2000/svg" width={74} height={51} viewBox="0 0 74 51">
                          <g>
                            <path d="M34.6075 16.7875C34.5735 16.4389 34.5054 16.0817 34.4202 15.733C33.6625 6.92252 26.2643 0 17.2484 0C7.72178 0 0 7.71343 0 17.2298C0 26.474 7.28758 33.9918 16.4311 34.417C14.2261 37.8953 10.676 40.7102 6.34258 42.0369L6.19785 42.0794C4.18866 42.6917 2.80095 44.6477 2.98825 46.8248C3.20109 49.3336 5.40609 51.1961 7.9261 50.9835C15.3414 50.3541 22.7567 46.5697 27.7967 40.4211C30.3252 37.3595 32.2833 33.7537 33.4752 29.8247C34.6756 25.9042 35.0843 21.669 34.6756 17.4934L34.6075 16.7875Z" />
                            <path d="M73.1685 16.7875C73.1344 16.4389 73.0663 16.0817 72.9812 15.733C72.2235 6.92252 64.8252 0 55.8094 0C46.2828 0 38.561 7.71343 38.561 17.2298C38.561 26.474 45.8486 33.9918 54.9921 34.417C52.7871 37.8953 49.2369 40.7102 44.9036 42.0369L44.7588 42.0794C42.7496 42.6917 41.3619 44.6477 41.5492 46.8248C41.7621 49.3336 43.9671 51.1961 46.4871 50.9835C53.9024 50.3541 61.3177 46.5697 66.3577 40.4211C68.8862 37.3595 70.8443 33.7537 72.0362 29.8247C73.2366 25.9042 73.6453 21.669 73.2366 17.4934L73.1685 16.7875Z" />
                          </g>
                        </svg>
                      </div>
                      <div className="date-and-time">
                        <p>May 9, 2023</p>
                        <span>10.30 PM</span>
                      </div>
                    </div>
                  </div>
                  <div className="author-img-and-rating">
                    <div className="author-img">
                      <img src="/assets/img/home2/testimonial-author-img3.png" alt="" />
                    </div>
                  </div>
                </SwiperSlide>
                <SwiperSlide className="swiper-slide">
                  <div className="testimonial-card">
                    <div className="testimonial-content">
                      <div className="author-rating">
                        <i className="bi bi-star-fill" />
                        <i className="bi bi-star-fill" />
                        <i className="bi bi-star-fill" />
                        <i className="bi bi-star-fill" />
                        <i className="bi bi-star-fill" />
                      </div>
                      <p>“I cannot express enough how satisfied I am with the web development services provided by Egens Lab. From the initial consultation to the final delivery, they have exceeded my expectations in every aspect.”</p>
                    </div>
                    <div className="testimonial-bottom">
                      <div className="author-area">
                        <h5>Mark Jack</h5>
                        <p>Customer</p>
                      </div>
                      <div className="testimonial-qoute">
                        <svg xmlns="http://www.w3.org/2000/svg" width={74} height={51} viewBox="0 0 74 51">
                          <g>
                            <path d="M34.6075 16.7875C34.5735 16.4389 34.5054 16.0817 34.4202 15.733C33.6625 6.92252 26.2643 0 17.2484 0C7.72178 0 0 7.71343 0 17.2298C0 26.474 7.28758 33.9918 16.4311 34.417C14.2261 37.8953 10.676 40.7102 6.34258 42.0369L6.19785 42.0794C4.18866 42.6917 2.80095 44.6477 2.98825 46.8248C3.20109 49.3336 5.40609 51.1961 7.9261 50.9835C15.3414 50.3541 22.7567 46.5697 27.7967 40.4211C30.3252 37.3595 32.2833 33.7537 33.4752 29.8247C34.6756 25.9042 35.0843 21.669 34.6756 17.4934L34.6075 16.7875Z" />
                            <path d="M73.1685 16.7875C73.1344 16.4389 73.0663 16.0817 72.9812 15.733C72.2235 6.92252 64.8252 0 55.8094 0C46.2828 0 38.561 7.71343 38.561 17.2298C38.561 26.474 45.8486 33.9918 54.9921 34.417C52.7871 37.8953 49.2369 40.7102 44.9036 42.0369L44.7588 42.0794C42.7496 42.6917 41.3619 44.6477 41.5492 46.8248C41.7621 49.3336 43.9671 51.1961 46.4871 50.9835C53.9024 50.3541 61.3177 46.5697 66.3577 40.4211C68.8862 37.3595 70.8443 33.7537 72.0362 29.8247C73.2366 25.9042 73.6453 21.669 73.2366 17.4934L73.1685 16.7875Z" />
                          </g>
                        </svg>
                      </div>
                      <div className="date-and-time">
                        <p>May 9, 2023</p>
                        <span>10.30 PM</span>
                      </div>
                    </div>
                  </div>
                  <div className="author-img-and-rating">
                    <div className="author-img">
                      <img src="/assets/img/home2/testimonial-author-img4.png" alt="" />
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

export default Testimonial
