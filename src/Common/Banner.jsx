import React, { useState, useEffect } from "react";
import bg from "../pictures/lines.png";
import { headinglist } from "../utlis/bannermap.jsx";

const Banner = () => {
  const [current, setCurrent] = useState(0);
  const [slide, setSlide] = useState(true);

  // Automatic slide change every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      changeSlide((current + 1) % headinglist.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [current]);

  // Slide change handler
  const changeSlide = (index) => {
    setSlide(false);
    setTimeout(() => {
      setCurrent(index);
      setSlide(true);
    }, 100);
  };

  const currentSlide = headinglist[current];

  return (
    <section className="relative h-screen  ">
      {/* Background */}
      <div
        className="absolute top-0 inset-0 bg-top bg-cover h-100 top-[10] transition-opacity duration-500"
        style={{ backgroundImage: `url(${bg})` }}
      />

      {/* Banner Content */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between h-full px-14 py-24">
        {/* Text */}
        <div
          className={`text-white max-w-full  md:max-w-lg mb-50 ml-10 transition-opacity duration-500 ${slide ? "opacity-100" : "opacity-0"
            }`}
        >
          {currentSlide.title && (
            <h1 className="text-5xl  text-blue-700 font-teko ">
              {currentSlide.title}
            </h1>
          )}
          <div className="flex gap-3 flex-wrap">
            {currentSlide.title && (
              <h1 className="text-5xl  text-blue-700 font-teko ">
                {currentSlide.title4}
              </h1>
            )}
            <div className="flex gap-3 flex-wrap">
              {currentSlide.title2 && (
                <h2 className="text-5xl  text-black font-teko font-bold  ">
                  {currentSlide.title2}
                </h2>
              )}
            </div>
            {currentSlide.title3 && (
              <h3 className="text-5xl  text-blue-700  font-teko  ">
                {currentSlide.title3}
              </h3>
            )}
            {currentSlide.disc && (
              <p className=" text-base  text-black">
                {currentSlide.disc}
              </p>
            )}
          </div>
        </div>

        {/* Image */}
        {currentSlide.img && (
          <img
            src={currentSlide.img}
            alt={currentSlide.title || "banner image"}
            className={`w-[400px] mb-60 transition-transform duration-500 ${slide ? "translate-x-0" : "-translate-x-10"
              }`}
          />
        )}
      </div>

      {/* Dots for slide navigation */}
      <div className="absolute left-8 top-28 flex flex-col gap-3">
        {headinglist.map((_, i) => (
          <button
            key={i}
            onClick={() => changeSlide(i)}
            className={`w-3 h-3 rounded-full transition-transform duration-300 ${i === current ? "bg-blue-600 scale-125" : "bg-gray-300"
              }`}
          />
        ))}
      </div>
    </section>

  );
};

export default Banner;