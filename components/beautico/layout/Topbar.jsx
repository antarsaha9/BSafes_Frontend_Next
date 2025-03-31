import Link from "next/link";
import React from "react";

const Topbar = () => {
  return (
    <div className="top-bar">
      <div className="container">
        <div className="row">
          <div className="col-lg-12 d-flex align-items-center justify-content-between gap-3">
            <div className="top-bar-left">
              <p>
                *New Winter Product 2023{" "}
                <Link legacyBehavior href="/shop">
                  <a>Shop Now*</a>
                </Link>
              </p>
            </div>
            <div className="company-logo">
              <Link legacyBehavior href="/">
                <a>
                  <img src="/assets/img/logo.svg" alt="" />
                </a>
              </Link>
            </div>
            <div className="search-area">
              <form>
                <div className="form-inner">
                  <input type="text" placeholder="Search..." />
                  <button type="submit">
                    <i className="bx bx-search" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
