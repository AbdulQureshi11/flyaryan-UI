import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiX } from "react-icons/fi";
import { RoundTicket } from "../../Common/TicketRound";
import pic3 from "../../pictures/linessss.png";

const Flightdetail = () => {
  const [activeTab, setActiveTab] = useState("itinerary");
  const navigate = useNavigate();

  // Scroll to top when page opens
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="w-full relative p-4">
      {/* Close Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 right-4 text-gray-600 hover:text-black text-xl"
      >
        <FiX />
      </button>

      {/* Tabs */}
      <div className="flex gap-6 border-b mb-4">
        <button
          onClick={() => setActiveTab("itinerary")}
          className={`pb-2 font-medium ${
            activeTab === "itinerary"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          Flight Itinerary
        </button>

        <button
          onClick={() => setActiveTab("fare")}
          className={`pb-2 font-medium ${
            activeTab === "fare"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          Fare Rules
        </button>
      </div>

      {/* Content */}
      <div>
        {activeTab === "itinerary" && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Flight Itinerary</h3>

            <div className="w-[90%] mx-auto flex flex-col gap-6 mb-10">
              {RoundTicket.slice(0, 1).map((items, index) => (
                <div
                  key={index}
                  className="rounded-lg overflow-hidden shadow-[0_6px_15px_-4px_rgba(0,0,0,0.3)] bg-white"
                >
                  {/* TOP ROW */}
                  <div className="flex items-center bg-[#F2F2F2] w-full h-[45px] relative border-t border-gray-300">
                    <h1 className="absolute w-7 h-7 bg-white border border-gray-300 rounded-full left-[47%] -top-3 -bottom-3 z-10"></h1>
                    {/* LEFT SIDE */}
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-600 w-[45px] h-[45px] flex items-center justify-center p-2">
                        <img src={items.img} alt="" className="w-20 h-20" />
                      </div>
                      <div>
                        <img src={items.img2} alt="" className="w-[45px] p-1 ml-2" />
                      </div>
                      <div className="text-sm font-semibold">{items.text1}</div>
                      <div className="text-gray-500 text-[10px]">{items.text2}</div>
                      <div className="text-[12px] text-white bg-[rgba(134,245,53,0.8)] w-[55px] h-[20px] flex items-center justify-center text-center">
                        {items.text3}
                      </div>
                      <div className="text-xl">{items.text4}</div>
                      <div className="text-sm">{items.text5}</div>
                      <div className="text-xl">{items.text6}</div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="flex items-center gap-2 ml-auto">
                      <div className="text-xs bg-gray-700 text-white w-14 pt-1 pl-3 rounded h-7">
                        {items.text7}
                      </div>
                      <div className="text-xs ml-2 font-semibold">{items.text8}</div>
                      <div className="text-xl">{items.text9}</div>
                      <div className="text-sm">{items.text10}</div>
                      <div className="text-xl">{items.text11}</div>
                      <div className="text-[12px] text-white bg-[rgba(134,245,53,0.8)] w-[55px] h-[20px] flex items-center justify-center text-center">
                        {items.text12}
                      </div>
                      <div className="text-gray-500 text-[10px]">{items.text13}</div>
                      <div className="text-sm font-semibold">{items.text14}</div>
                      <div className="w-[45px] p-1">
                        <img src={items.img2} alt="" />
                      </div>
                      <div className="bg-blue-600 w-[45px] h-[45px] p-1 flex items-center justify-center">
                        <img src={items.img3} alt="" />
                      </div>
                    </div>
                  </div>

                  {/* MIDDLE SECTION */}
                  <div className="w-full h-[105px] relative flex">
                    <div className="absolute left-[48%]">
                      <img src={pic3} alt="" />
                    </div>
                    {/* LEFT HALF */}
                    <div className="w-[50%] flex">
                      <div className="pl-3">
                        <h1 className="text-md pt-3 text-gray-500">{items.text15}</h1>
                        <h1 className="text-[12px] text-gray-700 pt-1">{items.text16}</h1>
                        <h1 className="text-2xl font-bold">{items.text17}</h1>
                      </div>
                      <div className="flex items-center pb-3 pl-1">
                        <h1 className="pl-3 text-sm">{items.text18}</h1>
                        <div className="flex bg-[#E3EDFF] rounded-l-lg rounded-r-lg px-2 py-1">
                          <h1 className="text-xl">{items.text19}</h1>
                          <h1 className="text-[10px] pl-2 p-[2px]">4h 0m</h1>
                        </div>
                        <h1 className="pr-1 text-sm">{items.text20}</h1>
                        <div className="ml-auto text-right pl-7">
                          <h1 className="text-sm text-gray-500 pt-3 pb-1">{items.text21}</h1>
                          <h1 className="text-[12px] text-gray-700">{items.text22}</h1>
                          <h1 className="text-2xl font-bold">{items.text222}</h1>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT HALF */}
                    <div className="w-[50%] flex">
                      <div className="pl-3">
                        <h1 className="text-md pt-3 text-gray-500">{items.text23}</h1>
                        <h1 className="text-[12px] text-gray-700 pt-1">{items.text24}</h1>
                        <h1 className="text-2xl font-bold">{items.text25}</h1>
                      </div>
                      <div className="flex items-center pb-1 pl-1">
                        <h1 className="pl-3 text-sm pb-1">{items.text26}</h1>
                        <div className="flex bg-[#E3EDFF] rounded-l-lg rounded-r-lg px-2 py-1">
                          <h1 className="text-xl">{items.text27}</h1>
                          <h1 className="pl-2 p-[2px] text-[10px]">4h 0m</h1>
                        </div>
                        <h1 className="pr-1 text-sm pb-1">{items.text28}</h1>
                        <div className="ml-auto text-right pl-8 pb-2">
                          <h1 className="text-md text-gray-500 pt-3">{items.text29}</h1>
                          <h1 className="text-[12px] text-gray-700">{items.text30}</h1>
                          <h1 className="text-2xl font-bold">{items.text300}</h1>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM SECTION */}
                  <div className="flex items-center w-full h-[30px] relative ">
       
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "fare" && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Fare Rules</h3>
            <p>Here show refund policy, baggage rules, cancellation charges, etc.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Flightdetail;
