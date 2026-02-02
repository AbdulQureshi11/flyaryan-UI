import React, { useState, useEffect } from "react";
import img1 from "../../pictures/c1.png";
import img2 from "../../pictures/c2.png"; // This will stay fixed
import img3 from "../../pictures/c3.png";
import img4 from "../../pictures/c4.png";
import img5 from "../../pictures/c5.png";
import { FaRegStar } from "react-icons/fa";

// Images excluding the fixed image (img2)
const rotatingImages = [img1, img3, img4, img5];

const Clients = () => {
  const [slide, setSlide] = useState(0);
  const [images, setImages] = useState(rotatingImages);

  // Change slide every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setImages((prev) => {
        const newImages = [...prev];
        const first = newImages.shift();
        newImages.push(first); // rotate the images
        return newImages;
      });

      setSlide((prev) => (prev + 1) % 3); // 3 dots
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-[500px] relative overflow-hidden">

      {/* Heading */}
      <h1 className="absolute top-15 left-130 font-teko font-semibold text-blue-600 text-4xl">
        CLIENTS <span className="text-black">FEEDBACK</span>
      </h1>

      {/* 5 Images */}
      {/* Image 1 (rotating) */}
      <img
        src={images[0]}
        className="absolute top-20 left-30 w-35 h-35 transition-all duration-1000"
        alt=""
      />

      {/* Image 2 (fixed) */}
      <img
        src={img2}
        className="absolute w-27 h-27 left-143 bottom-65 transition-all duration-1000"
        alt=""
      />

      {/* Image 3 (rotating) */}
      <img
        src={images[1]}
        className="w-23 top-20 h-23 absolute right-40 transition-all duration-1000"
        alt=""
      />

      {/* Image 4 (rotating) */}
      <img
        src={images[2]}
        className="absolute left-18 bottom-18 w-25 h-25 transition-all duration-1000"
        alt=""
      />

      {/* Image 5 (rotating) */}
      <img
        src={images[3]}
        className="w-35 h-35 absolute bottom-18 right-40 transition-all duration-1000"
        alt=""
      />

      {/* Name */}
      <h1 className="font-teko text-3xl absolute bottom-47 left-138">
        SARA MEHMOOD
      </h1>

      {/* Stars */}
      <div className="flex absolute text-yellow-500 bottom-43 left-145">
        <FaRegStar /><FaRegStar /><FaRegStar /><FaRegStar /><FaRegStar />
      </div>

      {/* Feedback Text */}
      <div className="absolute left-17 italic bottom-20 px-90 leading-6 text-sm">
        Booking with Fly Arayan was incredibly easy and hassle-free. Their
        user-friendly website made finding and confirming my travel options
        quick and seamless, providing peace of mind throughout the process.
      </div>

      {/* 3 Dots Slider */}
      <div className="flex justify-center gap-3 absolute bottom-5 left-1/2 -translate-x-1/2">
        {[0, 1, 2].map((dot) => (
          <div
            key={dot}
            className={`w-3 h-3 rounded-full transition ${
              slide === dot ? "bg-blue-600" : "bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Clients;
