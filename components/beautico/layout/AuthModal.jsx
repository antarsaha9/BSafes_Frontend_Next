import React from 'react'

const AuthModal = () => {
  return (
    <div className="modal login-modal fade" id="user-login" data-bs-keyboard="false" tabIndex={-1} aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <ul className="nav nav-tabs" id="myTab" role="tablist">
              <li className="nav-item" role="presentation">
                <button className="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home" type="button" role="tab" aria-controls="home" aria-selected="true">
                  Log In
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button className="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile" type="button" role="tab" aria-controls="profile" aria-selected="false">Registration</button>
              </li>
            </ul>
          </div>
          <div className="modal-body">
            <div className="tab-content" id="myTabContent">
              <div className="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                <div className="login-registration-form">
                  <div className="form-title">
                    <h3>Log In</h3>
                  </div>
                  <form>
                    <div className="form-inner mb-35">
                      <input type="text" placeholder="User name or Email *" />
                    </div>
                    <div className="form-inner">
                      <input id="password" type="password" placeholder="Password *" />
                      <i className="bi bi-eye-slash" id="togglePassword" />
                    </div>
                    <div className="form-remember-forget">
                      <div className="remember">
                        <input type="checkbox" className="custom-check-box" id="check1" />
                        <label htmlFor="check1">Remember me</label>
                      </div>
                      <a href="#" className="forget-pass hover-underline">Forget Password</a>
                    </div>
                    <a href="#" className="primary-btn1 hover-btn3">Log In</a>
                    <a href="#" className="member">Not a member yet?</a>
                  </form>
                </div>
              </div>
              <div className="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                <div className="login-registration-form">
                  <div className="form-title">
                    <h3>Registration</h3>
                  </div>
                  <form>
                    <div className="form-inner mb-25">
                      <input type="text" placeholder="User Name *" />
                    </div>
                    <div className="form-inner mb-25">
                      <input type="email" placeholder="Email Here *" />
                    </div>
                    <div className="form-inner mb-25">
                      <input id="password2" type="password" placeholder="Password *" />
                      <i className="bi bi-eye-slash" id="togglePassword2" />
                    </div>
                    <div className="form-inner mb-35">
                      <input id="password3" type="password" placeholder="Confirm Password *" />
                      <i className="bi bi-eye-slash" id="togglePassword3" />
                    </div>
                    <a href="#" className="primary-btn1 hover-btn3">Registration</a>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthModal
