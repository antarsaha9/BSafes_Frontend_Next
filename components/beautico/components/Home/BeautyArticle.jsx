import Link from 'next/link'
import React from 'react'

const BeautyArticle = () => {
  return (
    <div className="beauty-article-section mb-110">
      <div className="container-md container-fluid">
        <div className="section-title style-2 text-center">
          <h3>Our Beauty Article</h3>
        </div>
        <div className="row gy-4">
          <div className="col-lg-7">
            <div className="row gy-4">
              <div className="col-sm-6">
                <div className="article-card">
                  <div className="article-image">
                    <div className="blog-date">
                      <Link legacyBehavior href="/blog-grid"><a>20 July, 2023</a></Link>
                    </div>
                    <Link legacyBehavior href="/blog-details">
                      <a  className="article-card-img hover-img">
                      <img src="/assets/img/home1/article-img1.png" alt="" />
                      </a>
                    </Link>
                  </div>
                  <div className="article-card-content">
                    <div className="tag">
                      <ul>
                        <li>
                          <Link legacyBehavior href="/blog-grid"><a>Beauty</a></Link>
                        </li>
                        <li>
                          <Link legacyBehavior href="/blog-grid"><a>Makeup</a></Link>
                        </li>
                        <li>
                          <Link legacyBehavior href="/blog-grid"><a>Health</a></Link>
                        </li>
                      </ul>
                    </div>
                    <h5><Link legacyBehavior href="/blog-details"><a>Vestibulum leo ex posueret eu lobortis ut.</a></Link></h5>
                    <p>Software development is the process offer creatain onet computer software programs that perform specific tasks.......</p>
                    <Link legacyBehavior href="/blog-details"><a>Read More</a></Link>
                  </div>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="article-card">
                  <div className="article-image">
                    <Link legacyBehavior href="/blog-details">
                      <a  className="article-card-img hover-img">
                      <img src="/assets/img/home1/article-img2.png" alt="" />
                      </a>
                    </Link>
                    <div className="blog-date">
                      <Link legacyBehavior href="/blog-grid"><a>25 July, 2023</a></Link>
                    </div>
                  </div>
                  <div className="article-card-content">
                    <div className="tag">
                      <ul>
                        <li>
                          <Link legacyBehavior href="/blog-grid"><a>Beauty</a></Link>
                        </li>
                        <li>
                          <Link legacyBehavior href="/blog-grid"><a>Makeup </a></Link>
                        </li>
                        <li>
                          <Link legacyBehavior href="/blog-grid"><a>Health</a></Link>
                        </li>
                      </ul>
                    </div>
                    <h5><Link legacyBehavior href="/blog-details"><a  className="hover-underline">Duis justo orci consecteturi et convallis.</a></Link></h5>
                    <p>Software development is the process offer creatain onet computer software programs that perform specific tasks.......</p>
                    <Link legacyBehavior href="/blog-details"><a>Read More</a></Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-5">
            <div className="article-card">
              <div className="article-image">
                <Link legacyBehavior href="/blog-details">
                  <a  className="article-card-img hover-img">
                    <img src="/assets/img/home1/article-img3.png" alt="" />
                  </a>
                </Link>
                <div className="blog-date">
                  <Link legacyBehavior href="/blog-grid"><a>10 June, 2023</a></Link>
                </div>
              </div>
              <div className="article-card-content style-2">
                <div className="tag">
                  <ul>
                    <li>
                      <Link legacyBehavior href="/blog-grid"><a>Beauty</a></Link>
                    </li>
                    <li>
                      <Link legacyBehavior href="/blog-grid"><a>Makeup </a></Link>
                    </li>
                    <li>
                      <Link legacyBehavior href="/blog-grid"><a>Health</a></Link>
                    </li>
                  </ul>
                </div>
                <h5><Link legacyBehavior href="/blog-details"><a  className="hover-underline">Fusce vel auctor leo, a tempus sapieno Nunc ut purus.</a></Link></h5>
                <p>Software development is the process offer creatain onet computer software programs that perform specific tasks and its helps user to complete tasks in easy way.......</p>
                <Link legacyBehavior href="/blog-details"><a>Read More</a></Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  )
}

export default BeautyArticle
