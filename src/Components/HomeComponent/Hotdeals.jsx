import React from "react";
import img1 from "../../pictures/g1.png";
import img2 from "../../pictures/g2.png";
import img3 from "../../pictures/g3.png";

const Hotdeals = () => {
  return (
    <div className="pt-20 pt-25">
      {/* Heading */}
      <h1 className="group font-teko text-center text-5xl pb-6 cursor-pointer">
        <span className="text-blue-600 ">
          HOT
        </span>{" "}
        <span className="text-black ">
          DEALS
        </span>
      </h1>

      {/* Cards */}
      <div className="flex justify-center gap-8 px-13">
        {/* Card 1 */}
        <div className="relative w-[30%]">
          <img src={img1} className="w-full" />
          <button className="absolute bottom-6 right-7 bottom-9 -translate-x-1/2 
           bg-white text-black text-[13px] font-semibold px-6 py-1 rounded-full
           hover:bg-blue-800 hover:text-white transition">
            BOOK NOW
          </button>
        </div>

        {/* Card 2 */}
        <div className="relative w-[30%]">
          <img src={img2} className="w-full" />
          <button className="absolute bottom-6 left-20 bottom-10 -translate-x-1/2 
           bg-white text-black text-[13px] font-semibold px-6 py-1 rounded-full
           hover:bg-blue-800 hover:text-white transition">
            BOOK NOW
          </button>
        </div>

        {/* Card 3 */}
        <div className="relative w-[30%]">
          <img src={img3} className="w-full" />
          <button className="absolute bottom-6 left-18 bottom-9 -translate-x-1/2 
           bg-white text-black text-[13px] font-semibold px-6 py-1 rounded-full
           hover:bg-blue-800 hover:text-white transition">
            BOOK NOW
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hotdeals;
