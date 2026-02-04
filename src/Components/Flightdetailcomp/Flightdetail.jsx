import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiX } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";

import pic3 from "../../pictures/linessss.png";
import routeline from "../../assets/Line.png";
import laggage from "../../assets/laggage.png";
import takeoff from "../../pictures/plane.svg";
import landing from "../../pictures/plan2.png";

import { MdOutlineAirplanemodeActive } from "react-icons/md";
import { getAirlineLogo } from "../../utlis/airlineLogo";

import { asyncAirPricing, clearAirPricing } from "../../features/airpricing/airPricingSlice";
import { setSelectedFlight } from "../../features/flightsearch/flightsearchSlice";

// ---------- helpers ----------
const safe = (v, fallback = "") => (v === undefined || v === null || v === "" ? fallback : v);

const formatTime = (dt) => {
  if (!dt) return "--:--";
  const s = String(dt);
  const match = s.match(/T(\d{2}):(\d{2})/);
  if (match) return `${match[1]}:${match[2]}`;
  const m2 = s.match(/^(\d{2}):(\d{2})$/);
  if (m2) return s;
  return "--:--";
};

const minutesToHM = (mins) => {
  const m = Number(mins || 0);
  if (!Number.isFinite(m) || m <= 0) return "—";
  const h = Math.floor(m / 60);
  const r = m % 60;
  return `${h}h ${r}m`;
};

const formatDayDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
};

const stopsLabelFromSegs = (groupSegs) => {
  const count = Array.isArray(groupSegs) ? groupSegs.length : 0;
  if (count <= 1) return "Direct";
  return `${count - 1} Stop`;
};

const airlineNameFromCode = (code) => {
  const map = {
    KU: "Kuwait Airways",
    QR: "Qatar Airways",
    EK: "Emirates",
    PK: "Pakistan International Airlines",
    EY: "Etihad",
    SV: "Saudia",
    FZ: "Flydubai",
  };
  return map[code] || "Airline";
};

const baggageMaxOnly = (b, fallback = "30") => {
  if (!b) return fallback;
  if (typeof b === "object") {
    const w = b.maxWeight ?? b.weight ?? b.value ?? "";
    return w ? String(w) : fallback;
  }
  const s = String(b);
  const m = s.match(/(\d+(\.\d+)?)/);
  return m ? m[1] : fallback;
};

const sumFlightTime = (segs) =>
  (Array.isArray(segs) ? segs : []).reduce((sum, s) => sum + Number(s?.flightTime || 0), 0);

const splitLegs = (flight, tripType) => {
  const segments = Array.isArray(flight?.segments) ? flight.segments : [];
  const hasGroups = segments.some((s) => s?.group !== undefined && s?.group !== null);

  if (tripType === "round" && hasGroups) {
    const outSegs = segments.filter((s) => String(s.group) === "0");
    const inSegs = segments.filter((s) => String(s.group) === "1");
    return { outSegs, inSegs };
  }

  return { outSegs: segments, inSegs: [] };
};

const makeLegUI = (segs) => {
  const first = segs?.[0] || null;
  const last = segs?.[segs.length - 1] || null;

  return {
    fromCode: safe(first?.from, "--"),
    toCode: safe(last?.to, safe(first?.to, "--")),
    departTime: safe(first?.departure, ""),
    arriveTime: safe(last?.arrival, safe(first?.arrival, "")),
    dateLabel: formatDayDate(first?.departure),
    duration: minutesToHM(sumFlightTime(segs)),
    stopsLabel: stopsLabelFromSegs(segs),
    segs,
  };
};

/**
 * Badge text:
 * Direct
 * 1 Stop • via KWI
 * 2 Stops • via ABC, DEF
 */
const stopBadgeText = (segs) => {
  const count = Array.isArray(segs) ? segs.length : 0;

  let stopPart = "Direct";
  if (count > 1) {
    const stops = segs.slice(0, -1).map((s) => s?.to).filter(Boolean);
    const nStops = count - 1;
    const label = nStops === 1 ? "1 Stop" : `${nStops} Stops`;
    const via = stops.length ? ` • via ${stops.join(", ")}` : "";
    stopPart = `${label}${via}`;
  }

  return stopPart;
};

// ---------- component ----------
const Flightdetail = () => {
  const [activeTab, setActiveTab] = useState("itinerary");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedFlight, flights, criteria } = useSelector((state) => state.flightSearch);

  const {
    loading: pricingLoading,
    error: pricingError,
    pricing,
    pricedFlight,
    suggestedFlight,
    errorCode,
    success,
  } = useSelector((state) => state.airPricing);

  const tripTypeUI = criteria?.tripType || selectedFlight?.tripType || "round";
  const isOneWay = tripTypeUI === "oneway";

  const flight = selectedFlight; // Always use selectedFlight for itinerary details

  const ui = useMemo(() => {
    if (!flight) return null;

    const { outSegs, inSegs } = splitLegs(flight, tripTypeUI);
    const out = makeLegUI(outSegs);
    const inn = inSegs.length ? makeLegUI(inSegs) : null;

    const airlineCode = safe(outSegs?.[0]?.carrier, safe(flight?.travelportData?.platingCarrier, ""));
    const airlineName = airlineNameFromCode(airlineCode);
    const airlineLogo = getAirlineLogo(airlineCode);

    const className = safe(outSegs?.[0]?.cabinClass, "Economy");
    const baggage = baggageMaxOnly(flight?.baggage, "30");
    const refundable = flight?.pricing?.refundable;
    const refundableLabel = refundable === true ? "Refundable" : "Non-refundable";

    const displayCur = pricing?.currency || flight?.currency || "PKR";
    const displayTotal = pricing?.totalPrice ?? flight?.displayPrice ?? "";
    const priceText =
      displayTotal === ""
        ? `${displayCur} --`
        : `${displayCur} ${Number(displayTotal).toLocaleString?.() ?? displayTotal}`;

    const outNo = safe(outSegs?.[0]?.flightNumber, "");
    const inNo = inn ? safe(inSegs?.[0]?.flightNumber, "") : "";

    return {
      airlineCode,
      airlineName,
      airlineLogo,
      className,
      baggage,
      refundableLabel,
      priceText,
      outNo,
      inNo,
      out,
      inn,
    };
  }, [flight, pricing, tripTypeUI]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!selectedFlight) return;

    const adults = Number(criteria?.travelers?.adults ?? 1);
    const child = Number(criteria?.travelers?.child ?? 0);
    const infant = Number(criteria?.travelers?.infant ?? 0);

    const passengers = [];
    if (adults > 0) passengers.push({ type: "ADT", quantity: adults });
    if (child > 0) passengers.push({ type: "CNN", quantity: child });
    if (infant > 0) passengers.push({ type: "INF", quantity: infant });

    dispatch(
      asyncAirPricing({
        selectedFlight,
        passengers,
        allFlights: Array.isArray(flights) ? flights : [],
        searchContext: null,
      })
    );
  }, [dispatch, selectedFlight, flights, criteria]);

  const handleUseSuggested = () => {
    if (!suggestedFlight) return;
    dispatch(setSelectedFlight(suggestedFlight));
  };

  if (!selectedFlight) {
    return (
      <div className="w-full p-6">
        <div className="border border-gray-200 bg-gray-50 p-4 rounded">
          No selected flight found. Please go back and select a flight.
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="w-full relative p-4">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 right-4 text-gray-600 hover:text-black text-xl"
      >
        <FiX />
      </button>

      {/* Pricing banners */}
      <div className="w-[90%] mx-auto mt-2">
        {pricingLoading && (
          <div className="p-3 rounded border border-blue-200 bg-blue-50 text-blue-800">
            Fetching latest price...
          </div>
        )}

        {!pricingLoading && pricingError && (
          <div className="p-3 rounded border border-red-200 bg-red-50 text-red-800 flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold">Pricing failed</div>
              <div className="text-sm">
                {pricingError?.message || pricingError?.error || "Unknown error"}
                {errorCode ? ` (Code: ${errorCode})` : ""}
              </div>
            </div>

            {errorCode === "000276" && suggestedFlight && (
              <button
                onClick={handleUseSuggested}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Use Suggested Flight
              </button>
            )}
          </div>
        )}

        {!pricingLoading && success && pricing && (
          <div className="p-3 rounded border border-green-200 bg-green-50 text-green-800">
            Latest total:{" "}
            <b>
              {pricing.currency} {Number(pricing.totalPrice).toLocaleString()}
            </b>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="w-[90%] mx-auto flex gap-6 border-b mb-4 mt-4">
        <button
          onClick={() => setActiveTab("itinerary")}
          className={`pb-2 font-medium ${activeTab === "itinerary"
            ? "border-b-2 border-blue-600 text-blue-600"
            : "text-gray-500"
            }`}
        >
          Flight Itinerary
        </button>

        <button
          onClick={() => setActiveTab("fare")}
          className={`pb-2 font-medium ${activeTab === "fare"
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
            <h3 className="text-lg font-semibold mb-2 w-[90%] mx-auto">
              Flight Itinerary
            </h3>

            {!ui ? (
              <div className="w-[90%] mx-auto p-4 border rounded bg-gray-50">
                Loading itinerary...
              </div>
            ) : (
              <div className="w-[90%] mx-auto flex flex-col gap-6 mb-10">
                <div className="rounded-lg overflow-hidden shadow-[0_6px_15px_-4px_rgba(0,0,0,0.3)] bg-white">
                  {/* TOP ROW */}
                  <div className="flex items-center bg-[#F2F2F2] w-full h-[45px] relative border-t border-gray-300">
                    <h1 className="absolute w-7 h-7 bg-white border border-gray-300 rounded-full left-[47%] -top-3 -bottom-3 z-10"></h1>

                    {/* LEFT SIDE */}
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-600 w-[45px] h-[45px] flex items-center justify-center p-2">
                        <img src={takeoff} alt="" />
                      </div>

                      <div className="text-sm font-semibold flex items-center gap-2">
                        {ui.airlineLogo ? (
                          <img
                            src={ui.airlineLogo}
                            alt={ui.airlineCode}
                            className="w-18 h-18 object-contain"
                          />
                        ) : (
                          <span className="w-5 h-5 flex items-center justify-center text-xs">
                            ✈
                          </span>
                        )}
                        <span className="text-[13px]">{ui.airlineName}</span>
                      </div>

                      <div className="text-gray-500 text-[10px]">
                        {ui.outNo ? `${ui.airlineCode}-${ui.outNo}` : ui.airlineCode}
                      </div>

                      <div className="text-[10px] text-white bg-green-500 w-[50px] h-[20px] flex items-center justify-center text-center">
                        {ui.className}
                      </div>

                      <div className="text-gray-700 text-sm">|</div>

                      <div className="text-gray-500 text-[12px] flex relative px-3 items-center">
                        <img src={laggage} alt="" className="w-[30%] absolute right-10" />
                        {ui.baggage}
                        <p>kg</p>
                      </div>

                      <div className="text-gray-700 text-sm">|</div>
                      <div className="font-semibold text-[12px]">{ui.out.dateLabel}</div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="flex items-center gap-2 ml-auto pr-2">
                      <div className="text-xs mr-5 bg-gray-700 text-white w-14 pt-1 pl-3 rounded h-7">
                        {ui.out.stopsLabel}
                      </div>

                      {!isOneWay && ui.inn && (
                        <>
                          <div className="font-semibold text-[12px]">{ui.inn.dateLabel}</div>

                          <div className="text-gray-700 text-sm">|</div>

                          <div className="text-gray-500 text-[12px] flex relative px-4 items-center">
                            <img src={laggage} alt="" className="w-[30%] absolute right-10" />
                            {ui.baggage}
                            <p>kg</p>
                          </div>

                          <div className="text-gray-700 text-sm ml-[-10px]">|</div>

                          <div className="text-[10px] text-white bg-green-500 w-[50px] h-[20px] flex items-center justify-center text-center">
                            {ui.className}
                          </div>

                          <div className="text-gray-500 text-[10px]">
                            {ui.inNo ? `${ui.airlineCode}-${ui.inNo}` : ui.airlineCode}
                          </div>

                          <div className="text-sm font-semibold flex items-center gap-2">
                            <span className="text-[13px]">{ui.airlineName}</span>
                            {ui.airlineLogo ? (
                              <img
                                src={ui.airlineLogo}
                                alt={ui.airlineCode}
                                className="w-18 h-18 object-contain"
                              />
                            ) : (
                              <span className="w-5 h-5 flex items-center justify-center text-xs">
                                ✈
                              </span>
                            )}
                          </div>

                          <div className="bg-blue-600 w-[45px] h-[45px] mr-[-10px] p-1 flex items-center justify-center">
                            <img src={landing} alt="" />
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* MIDDLE SECTION */}
                  <div className="w-full h-[105px] relative flex">
                    {!isOneWay && ui.inn && (
                      <div className="absolute left-[48%]">
                        <img src={pic3} alt="" className="mt-2" />
                      </div>
                    )}

                    {/* OUTBOUND */}
                    <div className={`${isOneWay ? "w-full" : "w-[50%]"} flex items-center`}>
                      {/* LEFT (From) */}
                      <div className="pl-3 flex flex-col justify-center min-w-[70px]">
                        <h1 className="text-md text-gray-500 leading-none">{ui.out.fromCode}</h1>
                        <h1 className="text-2xl font-bold leading-tight">
                          {formatTime(ui.out.departTime)}
                        </h1>
                      </div>

                      {/* CENTER (Line + Duration + Stops) */}
                      <div className="flex-1 flex items-center justify-center px-2">
                        <div className="relative flex flex-col items-center justify-center w-full">
                          <img
                            src={routeline}
                            alt=""
                            className={`${isOneWay ? "w-[320px]" : "w-[200px]"} h-[1px]`}
                          />

                          {/* Duration pill */}
                          <div className="absolute -top-3">
                            <h1 className="text-[10px] flex items-center gap-1 px-2 py-[2px] bg-blue-100 rounded-full">
                              <MdOutlineAirplanemodeActive className="rotate-90 text-[15px]" />
                              {ui.out.duration}
                            </h1>
                          </div>

                          {/* Stop badge under the line */}
                          <div className="absolute top-3">
                            <span className="text-[10px] px-2 py-[2px] rounded-full border border-gray-300 bg-white text-gray-700">
                              {stopBadgeText(ui.out.segs)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* RIGHT (To) */}
                      <div className="pr-12 flex flex-col justify-center items-end ">
                        <h1 className="text-sm text-gray-500 leading-none">{ui.out.toCode}</h1>
                        <h1 className="text-2xl font-bold leading-tight">
                          {formatTime(ui.out.arriveTime)}
                        </h1>
                      </div>
                    </div>

                    {/* INBOUND */}
                    {!isOneWay && ui.inn && (
                      <div className="w-[50%] flex items-center">
                        {/* LEFT (From) */}
                        <div className=" flex flex-col justify-center min-w-[70px]">
                          <h1 className="text-md text-gray-500 leading-none">{ui.inn.fromCode}</h1>
                          <h1 className="text-2xl font-bold leading-tight">
                            {formatTime(ui.inn.departTime)}
                          </h1>
                        </div>

                        {/* CENTER (Line + Duration + Stops) */}
                        <div className="flex-1 flex items-center justify-center px-2">
                          <div className="relative flex flex-col items-center justify-center w-full">
                            <img src={routeline} alt="" className="w-[200px] h-[1px]" />

                            {/* Duration pill */}
                            <div className="absolute -top-3">
                              <h1 className="text-[10px] flex items-center gap-1 px-2 py-[2px] bg-blue-100 rounded-full">
                                <MdOutlineAirplanemodeActive className="rotate-90 text-[15px]" />
                                {ui.inn.duration}
                              </h1>
                            </div>

                            {/* Stop badge */}
                            <div className="absolute top-3">
                              <span className="text-[10px] px-2 py-[2px] rounded-full border border-gray-300 bg-white text-gray-700">
                                {stopBadgeText(ui.inn.segs)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* RIGHT (To) */}
                        <div className="pr-4 flex flex-col justify-center items-end min-w-[70px]">
                          <h1 className="text-sm text-gray-500 leading-none">{ui.inn.toCode}</h1>
                          <h1 className="text-2xl font-bold leading-tight">
                            {formatTime(ui.inn.arriveTime)}
                          </h1>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* FOOTER */}
                  <div className="flex items-center bg-[#F2F2F2] w-full h-[45px] relative border-t border-gray-300">
                    <div className="flex items-center gap-2">
                      <h1 className="pl-4 text-sm pt-[3px]">{ui.refundableLabel}</h1>
                    </div>

                    <div className="ml-auto flex items-center gap-4 pr-4">
                      <h1 className="text-2xl font-bold text-blue-900">{ui.priceText}</h1>

                      <Link to="/booking">
                        <button
                          disabled={pricingLoading || !!pricingError}
                          onClick={() => navigate("/booking")}
                          className={`font-bold text-white py-[10px] px-6 ${pricingLoading || pricingError ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600"
                            }`}
                        >
                          CONTINUE
                        </button>
                      </Link>
                    </div>

                    <h1 className="absolute w-7 h-7 bg-white border border-gray-300 rounded-full left-[47%] -bottom-3 z-10"></h1>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Flightdetail;
