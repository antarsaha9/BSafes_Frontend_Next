import React from 'react'

const Newsletter = () => {
  return (
    <div className="newsletter-section style-2 mb-110">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="newsletter-banner">
              <img src="/assets/img/home2/newsletter-top-left-vector.png" alt="" className="top-left" />
              <img src="/assets/img/home2/newsletter-bottom-left-vector.png" alt="" className="bottom-left" />
              <img src="/assets/img/home2/newsletter-top-right-vector.png" alt="" className="top-right" />
              <img src="/assets/img/home2/newsletter-bottom-right-vector.png" alt="" className="bottom-right" />
              <div className="newsletter-content">
                <h2>Sign up to our newsletter for all the latest Offer &amp; discounts.</h2>
                <form>
                  <div className="from-inner">
                    <input type="email" placeholder="Email Address" />
                    <button type="submit" className="from-arrow" style={{background:"transparent"}}>
                      <i className="bi bi-arrow-right" style={{background:"transparent"}} />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Newsletter
