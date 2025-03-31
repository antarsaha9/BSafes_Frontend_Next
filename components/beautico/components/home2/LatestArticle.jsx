import Link from 'next/link'
import React from 'react'

const LatestArticle = () => {
  return (
    <div className="latest-article-section mb-110">
      <div className="container">
        <div className="section-title3 justify-content-center">
          <h3>The Latest <span>Article</span></h3>
        </div>
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="article-card style-2">
              <div className="article-image">
                <Link legacyBehavior href="/blog-details">
                  <a  className="article-card-img hover-img">
                  <img src="/assets/img/home2/latest-article-img1.png" alt="" />
                  </a>
                </Link>
              </div>
              <div className="article-card-content">
                <div className="tag two">
                  <span>20 July, 2023</span>
                  <ul>
                    <li>
                      <Link legacyBehavior href="/blog-grid"><a>Beauty</a></Link>
                    </li>
                    <li>
                      <Link legacyBehavior href="/blog-grid"><a>Makeup</a></Link>
                    </li>
                  </ul>
                </div>
                <h5><Link legacyBehavior href="/blog-details"><a  className="hover-underline">Aenean eget augue idendtr odio efficitur.</a></Link>
                </h5>
                <p>Software development is the process offer creatain onet computer software......</p>
                <Link legacyBehavior href="/blog-details"><a>Read More</a></Link>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="article-card style-2">
              <div className="article-image">
                <Link legacyBehavior href="/blog-details">
                  <a  className="article-card-img hover-img">
                  <img src="/assets/img/home2/latest-article-img2.png" alt="" />
                  </a>
                </Link>
              </div>
              <div className="article-card-content">
                <div className="tag two">
                  <span>22 July, 2023</span>
                  <ul>
                    <li>
                      <Link legacyBehavior href="/blog-grid"><a>Beauty</a></Link>
                    </li>
                    <li>
                      <Link legacyBehavior href="/blog-grid"><a>Makeup</a></Link>
                    </li>
                  </ul>
                </div>
                <h5><Link legacyBehavior href="/blog-details"><a  className="hover-underline">Pellentesque habitant senei morbi tristique.</a></Link>
                </h5>
                <p>Software development is the process offer creatain onet computer software......</p>
                <Link legacyBehavior href="/blog-details"><a>Read More</a></Link>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="article-card style-2">
              <div className="article-image">
                <Link legacyBehavior href="/blog-details">
                  <a  className="article-card-img hover-img">
                  <img src="/assets/img/home2/latest-article-img3.png" alt="" />
                  </a>
                </Link>
              </div>
              <div className="article-card-content">
                <div className="tag two">
                  <span>20 June, 2023</span>
                  <ul>
                    <li>
                      <Link legacyBehavior href="/blog-grid"><a>Beauty</a></Link>
                    </li>
                    <li>
                      <Link legacyBehavior href="/blog-grid"><a>Makeup</a></Link>
                    </li>
                  </ul>
                </div>
                <h5><Link legacyBehavior href="/blog-details"><a  className="hover-underline">egestas tincidunt arcu sedi lacinia erat.</a></Link>
                </h5>
                <p>Software development is the process offer creatain onet computer software......</p>
                <Link legacyBehavior href="/blog-details"><a>Read More</a></Link>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="article-card style-2">
              <div className="article-image">
                <Link legacyBehavior href="/blog-details">
                  <a  className="article-card-img hover-img">
                  <img src="/assets/img/home2/latest-article-img4.png" alt="" />
                  </a>
                </Link>
              </div>
              <div className="article-card-content">
                <div className="tag two">
                  <span>5 May, 2023</span>
                  <ul>
                    <li>
                      <Link legacyBehavior href="/blog-grid"><a>Beauty</a></Link>
                    </li>
                    <li>
                      <Link legacyBehavior href="/blog-grid"><a>Makeup</a></Link>
                    </li>
                  </ul>
                </div>
                <h5><Link legacyBehavior href="/blog-details"><a  className="hover-underline">tincidunt neque ettont felis blandit sit amet.</a></Link>
                </h5>
                <p>Software development is the process offer creatain onet computer software......</p>
                <Link legacyBehavior href="/blog-details"><a>Read More</a></Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  
  )
}

export default LatestArticle
