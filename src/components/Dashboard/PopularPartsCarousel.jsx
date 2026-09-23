import React from "react";

const defaultPartsSlides = [
  {
    img: "assets/images/product/Front Bumper.png",
    title: "Front Bumper",
    sold: 1200,
    stock: 450,
  },
  {
    img: "assets/images/product/Rear Bumper.png",
    title: "Rear Bumper",
    sold: 100,
    stock: 250,
  },
  {
    img: "assets/images/product/Fender.png",
    title: "Fender",
    sold: 600,
    stock: 150,
  },
  {
    img: "assets/images/product/Car Headlights.png",
    title: "Headlights",
    sold: 600,
    stock: 150,
  },
  {
    img: "assets/images/product/Car Hood.png",
    title: "Hood",
    sold: 600,
    stock: 150,
  },
  {
    img: "assets/images/product/Car Doors.png",
    title: "Doors",
    sold: 600,
    stock: 150,
  },
  {
    img: "assets/images/product/Car Side mirrors.png",
    title: "Side Mirrors",
    sold: 600,
    stock: 150,
  },
  {
    img: "assets/images/product/Car Seats.png",
    title: "Seats",
    sold: 600,
    stock: 150,
  },
  {
    img: "assets/images/product/Odometer.png",
    title: "Odometer",
    sold: 600,
    stock: 150,
  },
  {
    img: "assets/images/product/Rims & tire set.png",
    title: "Rims & Tire Set",
    sold: 600,
    stock: 150,
  },
  {
    img: "assets/images/product/AC Compressor.png",
    title: "AC Compressor",
    sold: 600,
    stock: 150,
  },
  {
    img: "assets/images/product/Alternator.png",
    title: "Alternator",
    sold: 600,
    stock: 150,
  },
  {
    img: "assets/images/product/Air intake manifold.png",
    title: "Air Intake Manifold",
    sold: 600,
    stock: 150,
  },
  {
    img: "assets/images/product/Battery.png",
    title: "Battery",
    sold: 600,
    stock: 150,
  },
  {
    img: "assets/images/product/Fuse box.png",
    title: "Fuse box",
    sold: 600,
    stock: 150,
  },
  {
    img: "assets/images/product/Car Window switches.png",
    title: "Window Switches",
    sold: 600,
    stock: 150,
  },
  {
    img: "assets/images/product/Engine.png",
    title: "Engine",
    sold: 600,
    stock: 150,
  },
  {
    img: "assets/images/product/Transmission.png",
    title: "Transmission",
    sold: 600,
    stock: 150,
  },
  {
    img: "assets/images/product/Trunk Gate.png",
    title: "Trunk Gate",
    sold: 600,
    stock: 150,
  },
];

const PopularPartsCarousel = ({ partsSlides }) => {
  const slides = partsSlides || defaultPartsSlides;
  return (
    <div
      className="card"
      style={{ backgroundColor: "#1F293D", color: "#D6D9E6" }}
    >
      <div className="card-body">
        <h4 className="header-title mb-3">Popular Car Parts</h4>
        <div
          id="popularPartsCarousel"
          className="carousel slide"
          data-bs-ride="carousel"
          style={{ minHeight: "200px" }}
        >
          <div className="carousel-indicators">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                data-bs-target="#popularPartsCarousel"
                data-bs-slide-to={idx}
                className={idx === 0 ? "active" : ""}
                aria-current={idx === 0 ? "true" : undefined}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          <div className="carousel-inner" style={{ minHeight: "200px" }}>
            {slides.map((part, idx) => (
              <div
                key={part.title}
                className={`carousel-item${idx === 0 ? " active" : ""}`}
                style={{ minHeight: "200px" }}
              >
                <div className="row align-items-center" style={{ minHeight: "200px" }}>
                  <div className="col-5 d-flex align-items-center justify-content-center">
                    <img
                      src={part.img}
                      className="img-fluid"
                      alt={part.title}
                      style={{ maxWidth: "100%", maxHeight: "150px", objectFit: "contain" }}
                    />
                  </div>
                  <div className="col-7">
                    <div>
                      <p className="text-muted mb-2 font-size-12">Car</p>
                      <h5 className="text-primary mb-3 font-size-16">{part.title}</h5>
                      <div className="row mt-3">
                        <div className="col-6">
                          <div>
                            <h4 className="font-size-18 mb-1">{part.sold}</h4>
                            <p className="text-muted mb-0 font-size-11">Sold</p>
                          </div>
                        </div>
                        <div className="col-6">
                          <div>
                            <h4 className="font-size-18 mb-1">{part.stock}</h4>
                            <p className="text-muted mb-0 font-size-11">
                              Stock
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopularPartsCarousel;
