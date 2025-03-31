import React from "react";

const Newsletter = () => {
  return (
    <div className="newsletter-section mb-110">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="newsletter-banner hover-img">
              <div className="newsletter-content">
                <h2>
                  Sign up to our newsletter for all the latest Offer &amp;
                  discounts.
                </h2>
                <form>
                  <div className="from-inner">
                    <input type="email" placeholder="Email Address" />
                    <div className="from-arrow" >
                      <i className="bi bi-arrow-right" style={{background:"transparent"}} />
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;
