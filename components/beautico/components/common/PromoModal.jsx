import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";

function PromoModal() {
  const [showModal, setShowModal] = useState(false);
  const handleClose = () => {
    setShowModal(false);
  };
  useEffect(() => {
    // Show the modal when the component mounts
    setShowModal(true);
  }, []);

  return (
    <div>
      <Modal  className="page-load-modal" size="lg" show={showModal} onHide={handleClose}>
        <div className="popup-wrapper">
          <div className="modal-close-btn" onClick={handleClose} />
          <div className="popup-img">
            <img src="assets/img/home1/on-load-popup-img.png" alt="" />
          </div>
          <div className="popup-content">
            <h2>Get 15% off your first order</h2>
            <p>Get your promo code and apply it at checkout</p>
            <form>
              <div className="form-inner">
                <input type="email" placeholder="Email Address" />
                <button style={{background:"transparent"}} type="submit" className="form-arrow">
                  <svg xmlns="http://www.w3.org/2000/svg" width={18} height={11} viewBox="0 0 18 11">
                    <path d="M16.4587 5.76798H1.12214C0.796856 5.76798 0.533569 5.50447 0.533569 5.17891C0.533569 4.85335 0.796856 4.58984 1.12214 4.58984H16.4587C16.784 4.58984 17.0473 4.85335 17.0473 5.17891C17.0473 5.50447 16.784 5.76798 16.4587 5.76798Z" />
                    <path d="M12.1134 10.3617C11.9395 10.3617 11.7677 10.2852 11.6515 10.1383C11.4499 9.88302 11.493 9.51269 11.7481 9.31084L13.5789 7.86173L16.5198 5.23489L11.6621 1.03484C11.4161 0.82199 11.389 0.450092 11.6013 0.203862C11.814 -0.0423681 12.1864 -0.069072 12.4316 0.142992L17.7958 4.78131C17.9241 4.89205 17.9983 5.05267 17.9999 5.22271C18.001 5.39236 17.9296 5.55416 17.8033 5.66687L14.3354 8.76301L12.4783 10.2349C12.37 10.3205 12.2409 10.3617 12.1134 10.3617Z" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default PromoModal;
