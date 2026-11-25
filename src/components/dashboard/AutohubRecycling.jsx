import React from "react";

const defaultAutohubSlides = [
  "assets/images/AutoHub/Junk Yard 1.png",
  "assets/images/AutoHub/Junk Yard 2.png",
  "assets/images/AutoHub/Junk Yard 3.jpeg",
  "assets/images/AutoHub/Junk Yard 4.jpeg",
  "assets/images/AutoHub/Junk Yard 5.jpeg",
  "assets/images/AutoHub/Junk Yard 6.jpeg",
  "assets/images/AutoHub/Junk Yard 7.jpeg",
  "assets/images/AutoHub/Junk Yard 8.jpeg",
];

const AutohubRecycling = ({ autohubSlides }) => {
  const slides = autohubSlides || defaultAutohubSlides;
  return (
    <div
      className="card"
      style={{ backgroundColor: "#1F293D", color: "#D6D9E6" }}
    >
      <div className="card-body">
        <h4 className="header-title mb-4">Autohub Recycling</h4>
        <div
          id="autohubCarousel"
          className="carousel slide"
          data-bs-ride="carousel"
        >
          <div className="carousel-indicators">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                data-bs-target="#autohubCarousel"
                data-bs-slide-to={idx}
                className={idx === 0 ? "active" : ""}
                aria-current={idx === 0 ? "true" : undefined}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          <div className="carousel-inner">
            {slides.map((src, idx) => (
              <div
                key={src}
                className={`carousel-item${idx === 0 ? " active" : ""}`}
              >
                <div className="row align-items-center mb-5">
                  <img
                    src={src}
                    className="img-fluid me-3"
                    alt={`Scrap Yard ${idx + 1}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="clearfix mt-2" />
        <h4 className="header-title mb-4">Our Contact Details</h4>
        <p>
          <b>Address : </b>242 Monmouth Rd. Wrightstown, NJ - 08562 USA
        </p>
        <p>
          <b>Mobile : </b>+1 609 758 1919
        </p>
        <p>
          <b>Email : </b>hello@autohub.express
        </p>
      </div>
    </div>
  );
};

export default AutohubRecycling;
