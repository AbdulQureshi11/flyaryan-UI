import React from "react";
import image from "../../pictures/6.png";
import image2 from "../../pictures/7.png";
import image3 from "../../pictures/8.png";
import image4 from "../../pictures/9.png";
import image5 from "../../pictures/10.png";
import image6 from "../../pictures/11.png";
import image7 from "../../pictures/r1.png";
import image8 from "../../pictures/r2.png";
import image9 from "../../pictures/r3.png";
import image10 from "../../pictures/clouds.png";

const Superairline = () => {
  const images = [image, image2, image3, image4, image5, image6];

  return (
    <div className="bg-white mt-[-30px]">
      {/* Title */}
      <h1 className="font-teko text-4xl font-bold text-gray-900 text-center pt-25">
        SUPER AIRLINE OFFER
      </h1>

      {/* Infinite scroll container */}
      <div className="overflow-hidden w-full py-9">
        <div className="flex gap-20 animate-scroll">
          {/* first set */}
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              className="w-[120px] object-contain"
              alt=""
            />
          ))}
          {/* duplicate set for smooth infinite scroll */}
          {images.map((img, index) => (
            <img
              key={index + images.length}
              src={img}
              className="w-[120px] object-contain"
              alt=""
            />
          ))}
        </div>
      </div>

      <div className="flex w-full h-[450px]">
        {/* Left side - stacked images */}
        <div className="w-[50%] relative ml-10 items-start z-0">

          {/* 🔼 Image 9 (UPPER) */}
          <img
            src={image9}
            alt=""
            className="absolute top-3 left-12 w-40 z-20 animate-updown-1"
          />

          {/* 🔽 Image 8 (LOWER) */}
          <img
            src={image8}
            alt=""
            className="absolute w-60 top-3 left-40 z-10"
          />

          <img
            src={image7}
            alt=""
            className="absolute top-42 left-90 w-35 z-30 animate-updown-2"
          />

          <img
            src={image10}
            alt=""
            className="absolute top-7 left-55 w-65 z-30 animate-leftright"
          />
        </div>



        {/* Right side - text */}
        <div className="w-[50%] ">
          <h1 className="text-4xl  tracking-wide text-blue-600 font-teko">
            WELCOME TO <span className="text-black"> FLY ARYAN</span>
          </h1>
          <p className="text-xs pr-25 leading-loose pt-5">
            Welcome to Fly Aryan, the best travel agency in Pakistan, where your
            journey begins with trust, comfort, and exceptional service. If
            you’re looking to discover the ultimate travel adventure, Fly Aryan
            is your perfect partner—offering seamless bookings, unbeatable
            deals, and exclusive benefits designed to make every trip memorable.
            From dream vacations to essential travel arrangements, we’re
            committed to turning your travel plans into extraordinary
            experiences.{" "}
          </p>

          <p className="font-bold text-sm pt-3">
            Your Gateway to Unforgettable Journeys
          </p>
          <p className="text-xs pt-3">
            {" "}
            Experience seamless travel with exclusive deals and trusted service
            across Pakistan and beyond.
          </p>
          <p className="font-bold text-sm pt-3">
            Travel Smarter with Fly Aryan
          </p>
          <p className="text-xs pt-3">
            Enjoy unbeatable fares, exclusive benefits, and stress-free journeys
            tailored just for you.
          </p>
          <button
            className="
  font-teko
  bg-blue-600
  px-8 py-2
  text-white
  rounded
  mt-7
  hover:bg-blue-700
  hover:scale-105
  hover:shadow-lg
  transition-all
  duration-300
  ease-in-out
"
          >
            BOOK NOW
          </button>
        </div>
      </div>
    </div>
  );
};

export default Superairline;
