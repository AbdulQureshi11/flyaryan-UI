import React, { useState } from "react";
import pic from "../../pictures/plane.svg";
import pic2 from "../../pictures/arrival.svg";
import { FiArrowLeft, FiArrowRight, FiChevronDown } from "react-icons/fi";
import { CiSearch } from "react-icons/ci";
import { Showingdata } from "../../Common/Showing";
import { RoundTicket } from "../../Common/TicketRound";
import pic3 from "../../pictures/linessss.png";
import { Link } from "react-router-dom";

const RoundtripdetailsComponent = () => {
  const [selected, setSelected] = useState("ISB");
  const [selectedTo, setSelectedTo] = useState("DXB");
  const [traveler, setTraveler] = useState(1);
  const [travelClass, setTravelClass] = useState("Economy");
  const [showTraveler, setShowTraveler] = useState(false);
  const [fromDate, setFromDate] = useState("2025-12-24");
  const [toDate, setToDate] = useState("2026-01-10");
  const [activeDate, setActiveDate] = useState("from");
  const [activeTab, setActiveTab] = useState("Round Trip");

  // Dropdown filters state
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState({
    TIME: "TIME",
    PRICE: "PRICE",
    STOPS: "STOPS",
    CLASS: "CLASS",
    REFUNDABLE: "REFUNDABLE",
    AIRLINE: "AIRLINE",
  });

  const dropdownOptions = {
    TIME: ["10:00 AM", "2:00 PM", "6:00 PM"],
    PRICE: ["Low", "Medium", "High"],
    STOPS: ["Non-stop", "1 Stop", "2+ Stops"],
    CLASS: ["Economy", "Business", "First"],
    REFUNDABLE: ["Yes", "No", "Partial"],
    AIRLINE: ["Emirates", "Qatar Airways", "Etihad"],
  };

  const optionsFrom = [
    { code: "ISB", name: "Islamabad International Airport" },
    { code: "KHI", name: "Karachi International Airport" },
    { code: "PEW", name: "Peshawar International Airport" },
    { code: "LHE", name: "Lahore International Airport" },
  ];

  const optionsTo = [
    { code: "DXB", name: "Dubai International Airport" },
    { code: "DOH", name: "Hamad International Airport, Qatar" },
    { code: "RUH", name: "King Khalid International Airport, Saudi" },
  ];

  const current = optionsFrom.find((opt) => opt.code === selected);
  const currentTo = optionsTo.find((opt) => opt.code === selectedTo);

  return (
    <>
      <div className="flex flex-col items-center mt-10 w-full gap-6">
        {/* ========================= */}
        {/* Main Form */}
        <div className="w-[87%] border border-gray-300 rounded-xl p-4 flex flex-col gap-4 bg-white shadow-lg">
          {/* Tabs */}
          <div className="flex border-b border-gray-300 pb-2 gap-2 items-center justify-center">

            <button className="flex gap-6 font-bold text-gray-600 h">
              <h1 className="hover:text-black">Round trip </h1>
              <h1 className="hover:text-black">One way</h1>
              <h1 className="hover:text-black">multi city </h1>
            </button>

          </div>

          {/* Form Fields */}
          <div className="flex gap-1 w-full">
            {/* From */}
            <div className="flex border border-gray-300 rounded-lg w-[25%] h-20 overflow-hidden">
              <div className="bg-blue-500 flex items-center justify-center h-full w-12">
                <img src={pic} alt="Plane" className="w-6 h-6" />
              </div>
              <div className="flex-1 p-3 flex flex-col justify-center">
                <span className="font-bold text-lg">{current.code}</span>
                <select
                  className="mt-1 border-none outline-none w-full text-gray-600 cursor-pointer"
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                >
                  {optionsFrom.map((opt) => (
                    <option key={opt.code} value={opt.code}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap */}
            <div className="flex flex-col items-center ml-[-11px] justify-center w-7 h-7 mt-7 rounded-full border border-gray-300 text-gray-500 cursor-pointer bg-white shadow-lg z-10">
              <FiArrowLeft className="text-xl" />
              <FiArrowRight className="text-xl" />
            </div>

            {/* To */}
            <div className="flex items-center border border-gray-300 rounded-lg w-[250px] h-20 ml-[-11px] overflow-hidden">
              <div className="flex-1 p-3 flex flex-col justify-center">
                <span className="font-bold text-lg">{currentTo.code}</span>
                <select
                  className="mt-1 border-none outline-none w-full text-gray-600 cursor-pointer"
                  value={selectedTo}
                  onChange={(e) => setSelectedTo(e.target.value)}
                >
                  {optionsTo.map((opt) => (
                    <option key={opt.code} value={opt.code}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="bg-blue-500 flex items-center justify-center h-full w-12">
                <img src={pic2} alt="Arrival" className="w-9 h-9" />
              </div>
            </div>

            {/* Date + Traveler + Search */}
            <div className="flex gap-4 w-[50%] pl-4">
              {/* Date */}
              <div className="flex-1 border border-gray-300 rounded-lg p-3 relative">
                <span className="font-bold text-lg">Return Ticket</span>
                <p
                  className="text-gray-500 text-sm cursor-pointer mt-1"
                  onClick={() => {
                    if (activeDate === "from") {
                      document.getElementById("fromDate").showPicker();
                    } else {
                      document.getElementById("toDate").showPicker();
                    }
                  }}
                >
                  {new Date(fromDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  →{" "}
                  {new Date(toDate).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>

                <input
                  type="date"
                  id="fromDate"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setActiveDate("to");
                  }}
                  className="absolute opacity-0 pointer-events-none"
                />
                <input
                  type="date"
                  id="toDate"
                  value={toDate}
                  min={fromDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setActiveDate("from");
                  }}
                  className="absolute opacity-0 pointer-events-none"
                />
              </div>

              {/* Traveler */}
              <div className="flex-1 border border-gray-300 rounded-lg p-3 relative">
                <span className="font-bold text-lg">Traveler - Economy</span>
                <p
                  className="text-gray-500 text-sm mt-1 cursor-pointer"
                  onClick={() => setShowTraveler(!showTraveler)}
                >
                  {traveler} Traveler - {travelClass}
                </p>

                {showTraveler && (
                  <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-lg mt-2 p-3 shadow-xl z-20">
                    <p className="font-semibold mb-2">Travelers</p>
                    <div className="flex gap-2 mb-3">
                      {[1, 2, 3, 4].map((num) => (
                        <button
                          key={num}
                          onClick={() => setTraveler(num)}
                          className={`px-3 py-1 border rounded ${traveler === num ? "bg-blue-500 text-white" : ""
                            }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>

                    <p className="font-semibold mb-2">Class</p>
                    <div className="flex gap-1">
                      {["Economy", "Business", "First"].map((cls) => (
                        <button
                          key={cls}
                          onClick={() => setTravelClass(cls)}
                          className={`px-1 py-1 border rounded ${travelClass === cls
                            ? "bg-blue-500 text-white"
                            : ""
                            }`}
                        >
                          {cls}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Search */}
              <div className="w-20 h-[80px]">
                <button className="w-full h-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-3xl flex items-center justify-center">
                  <CiSearch />
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Form border ends */}

        {/* ========================= */}
        {/* 6 Dropdown Filters BELOW FORM, outside border */}
        <div className="flex gap-3 flex-wrap w-[87%] items-center justify-center">
          {Object.keys(dropdownOptions).map((key) => (
            <div key={key} className="relative w-43">
              <div
                className="flex justify-between items-center border border-blue-300 font-semibold rounded px-3 py-2 cursor-pointer bg-white"
                onClick={() =>
                  setOpenDropdown(openDropdown === key ? null : key)
                }
              >
                <span>{selectedFilter[key]}</span>
                <FiChevronDown />
              </div>

              {openDropdown === key && (
                <div className="absolute top-full left-0 w-full border border-gray-300 rounded bg-white mt-1 shadow-lg z-20">
                  {dropdownOptions[key].map((option) => (
                    <div
                      key={option}
                      className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                      onClick={() => {
                        setSelectedFilter({
                          ...selectedFilter,
                          [key]: option,
                        });
                        setOpenDropdown(null);
                      }}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ========================= */}
      <div>
        <div className="flex gap-6 py-4 text-xs justify-center border border-blue-600 mt-10 mb-10">
          {Showingdata.map((items, index) => (
            <div key={index} className="">
              {/* Heading Section */}
              <div
                className={`pl-8 pr-8 pt-4 pb-4 -mt-4 -mb-6 ${index === 0 ? "bg-blue-600 text-white" : ""
                  }`}
              >
                <h1>{items.heading}</h1>
                <h1 className="mt-1 font-bold">{items.heading2}</h1>
              </div>

              {/* Content Section */}
              <h1 className="">{items.title}</h1>
              <h1 className="font-bold pt-2">{items.title2}</h1>
            </div>
          ))}
        </div>
      </div>

      {/* ========================= */}


      <div className="w-[90%] mx-auto flex flex-col gap-6 mb-10  ">
        {RoundTicket.map((items, index) => (
          <div
            key={index}
            className="rounded-lg overflow-hidden shadow-[0_6px_15px_-4px_rgba(0,0,0,0.3)] bg-white"
          >
            {/* TOP ROW */}
            <div className="flex items-center bg-[#F2F2F2] w-full h-[45px] relative border-t border-gray-300">
              <h1 className="absolute  w-7 h-7 bg-white border border-gray-300 rounded-full left-[47%] -top-3 -bottom-3 z-10"></h1>

              {/* LEFT SIDE: text1 → text6 */}
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
              <div className="absolute left-[48%] ">
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
                    <h1 className="text-xl ">{items.text19} </h1>
                    <h1 className="text-[10px] pl-2 p-[2px]"> 4h 0m</h1>
                  </div>
                  <h1 className="pr-1 text-sm">{items.text20}</h1>

                  <div className="ml-auto text-right pl-7 ">
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
                  <div className="flex bg-[#E3EDFF] rounded-l-lg rounded-r-lg px-2 py-1 ">
                    <h1 className="text-xl ">{items.text27} </h1>
                    <h1 className=" pl-2 p-[2px] text-[10px]"> 4h 0m</h1>
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
            {/* BOTTOM SECTION */}
            <div className="flex items-center bg-[#F2F2F2] w-full h-[45px] relative border-t border-gray-300 ">
              <div className="flex items-center gap-2">
                <h1 className="pl-4 text-sm pt-[3px]">{items.text31}</h1>

                {/* LINK for text32 */}
                <Link
                  to="/flight-detail"   // route you defined

                  className="border border-blue-600 text-blue-600 px-6 py-1 text-sm ml-4 inline-block"
                >
                  {items.text32}
                </Link>
              </div>

              <div className="ml-auto flex items-center gap-4">
                <h1 className="text-2xl font-bold text-blue-900">{items.text33}</h1>
                <h1 className="font-bold text-white bg-blue-600 py-[10px] px-6">
                  {items.text34}
                </h1>
              </div>
              <h1 className="absolute w-7 h-7 bg-white border border-gray-300 rounded-full left-[47%] -bottom-3 z-10"></h1>
            </div>
          </div>
        ))}
      </div>

    </>
  );
};

export default RoundtripdetailsComponent;

