import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import pic from "../../pictures/plane.svg";
import pic2 from "../../pictures/qatar.png";
import pic3 from "../../assets/line.png";
import { BsSuitcase } from "react-icons/bs";
import { IoAirplaneSharp } from "react-icons/io5";

const safe = (v, fallback = "") =>
    v === undefined || v === null || v === "" ? fallback : v;

const formatTime = (isoOrTime) => {
    if (!isoOrTime) return "--:--";
    if (/^\d{1,2}:\d{2}$/.test(String(isoOrTime))) return String(isoOrTime);
    const d = new Date(isoOrTime);
    if (Number.isNaN(d.getTime())) return "--:--";
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDuration = (minsOrText) => {
    if (!minsOrText) return "—";
    if (typeof minsOrText === "string") return minsOrText; // e.g. "4h 20m"
    const mins = Number(minsOrText);
    if (!Number.isFinite(mins) || mins <= 0) return "—";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
};

const pick = (obj, keys, fallback = null) => {
    for (const k of keys) {
        const val = obj?.[k];
        if (val !== undefined && val !== null) return val;
    }
    return fallback;
};

// Convert segments array -> leg info
const fromSegments = (segments = [], flightRoot = {}) => {
    if (!Array.isArray(segments) || segments.length === 0) return null;

    const first = segments[0];
    const last = segments[segments.length - 1];

    const origin = pick(first, ["origin", "from", "originAirport", "departureAirport", "Origin", "From"], "--");
    const destination = pick(last, ["destination", "to", "destinationAirport", "arrivalAirport", "Destination", "To"], "--");

    const depTime = pick(first, ["departureTime", "departure", "departTime", "DepartureTime", "Departure"], "");
    const arrTime = pick(last, ["arrivalTime", "arrival", "arriveTime", "ArrivalTime", "Arrival"], "");

    const airline = pick(first, ["carrier", "airline", "marketingCarrier", "Carrier"], "Qatar Airways");
    const flightNo = pick(first, ["flightNumber", "flightNo", "FlightNumber"], "QR-601");

    // Stops: intermediate destinations
    const stopPoints = segments
        .slice(0, -1)
        .map((s) =>
            pick(s, ["destination", "to", "destinationAirport", "arrivalAirport", "Destination", "To"], null)
        )
        .filter(Boolean);

    const stopsCount = Math.max(0, segments.length - 1);

    const duration =
        pick(flightRoot, ["duration", "totalDuration"], null) ||
        pick(first, ["duration", "flightDuration", "Duration"], null);

    return { origin, destination, depTime, arrTime, airline, flightNo, duration, stopsCount, stopPoints };
};

// Build legs (Outbound/Return) safely
const buildLegs = (selectedFlight, criteriaTripType) => {
    const f = selectedFlight || {};
    const tripType = (criteriaTripType || f.tripType || f.searchTripType || "").toLowerCase();

    // Possible round keys
    const outSeg =
        f?.outbound?.segments ||
        f?.outboundSegments ||
        f?.slices?.[0]?.segments ||
        f?.itinerary?.outbound?.segments ||
        f?.segmentsOutbound ||
        null;

    const inSeg =
        f?.inbound?.segments ||
        f?.inboundSegments ||
        f?.slices?.[1]?.segments ||
        f?.itinerary?.inbound?.segments ||
        f?.segmentsInbound ||
        null;

    // Common oneway segments
    const oneSeg = f?.segments || null;

    // If roundtrip: return 2 legs if possible
    if (tripType === "round") {
        const leg1 = outSeg ? fromSegments(outSeg, f) : oneSeg ? fromSegments(oneSeg, f) : null;
        const leg2 = inSeg ? fromSegments(inSeg, f) : null;

        // If inbound missing but still round, show 2nd card placeholder (design-wise) so UI matches figma
        const placeholderReturn = {
            origin: leg1?.destination || "--",
            destination: leg1?.origin || "--",
            depTime: "",
            arrTime: "",
            airline: leg1?.airline || "Qatar Airways",
            flightNo: leg1?.flightNo || "QR-601",
            duration: leg1?.duration || null,
            stopsCount: 0,
            stopPoints: [],
        };

        return [leg1, leg2 || placeholderReturn].filter(Boolean);
    }

    // Oneway
    const leg = oneSeg ? fromSegments(oneSeg, f) : null;
    return leg ? [leg] : [];
};

const LegCard = ({ leg }) => {
    const stopsText =
        !leg
            ? "Direct"
            : leg.stopsCount === 0
                ? "Direct"
                : leg.stopsCount === 1
                    ? safe(leg.stopPoints?.[0], "1 Stop")
                    : `${leg.stopsCount} Stops • ${(leg.stopPoints || []).slice(0, 2).join(", ")}`;

    return (
        <div className="mb-9">
            <div className="w-[90%] h-[140px] bg-white mx-auto rounded mt-4 relative">
                <div className="absolute left-1/2 -top-3 transform -translate-x-1/2 w-6 h-6 bg-[#E7F0FF] rounded-full"></div>

                <div className="w-full h-[40%] bg-gray-300 rounded-t flex">
                    <img
                        src={pic}
                        alt="plane"
                        className="w-[12%] bg-blue-600 h-[100%] px-3 py-3 rounded-l"
                    />
                    <img src={pic2} alt="qatar" className="w-[7%] py-4 ml-1" />

                    <div className="pt-3 pl-1">
                        <h1 className="text-[11px] font-semibold">
                            {safe(leg?.airline, "Qatar Airways")}
                        </h1>
                        <h1 className="text-[10px] text-gray-700">
                            {safe(leg?.flightNo, "QR-601")}
                        </h1>
                    </div>

                    <div className="mx-auto pl-8 flex">
                        <h1 className="bg-green-500 rounded-[2px] px-2 text-white text-[10px] h-4 mt-5">
                            Economy
                        </h1>
                        <h1 className="pl-2 pt-3">|</h1>
                        <h1 className="pt-4 pl-2">
                            <BsSuitcase />
                        </h1>
                        <h1 className="text-xs ml-2 pt-4">25 KG</h1>
                    </div>
                </div>

                <div className="relative flex">
                    <div className="pl-4">
                        <h1 className="text-gray-600 pt-3">{safe(leg?.origin, "ISB")}</h1>
                        <h1 className="text-xl font-bold">{formatTime(leg?.depTime) || "10:20"}</h1>
                    </div>

                    <img
                        src={pic3}
                        alt="line"
                        className="w-[50%] mx-auto absolute right-22 bottom-5"
                    />

                    {/* Bubble + Stop/Direct exactly like figma */}
                    <div className="flex flex-col items-center absolute top-11 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="flex bg-[#E3EDFF] rounded-full px-3 py-1 gap-1 items-center">
                            <IoAirplaneSharp />
                            <div className="text-[10px]">
                                {formatDuration(leg?.duration) || "4h 20m"}
                            </div>
                        </div>
                        <div className="text-[10px] text-gray-700 mt-1 font-semibold">
                            {stopsText}
                        </div>
                    </div>

                    <div className="mx-auto text-right pl-50">
                        <h1 className="text-gray-600 pt-3">{safe(leg?.destination, "DXB")}</h1>
                        <h1 className="text-xl font-bold">{formatTime(leg?.arrTime) || "14:20"}</h1>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FlightCard = ({ fareData: fareDataProp }) => {
    const location = useLocation();
    const fareData = fareDataProp || location.state?.fareData;

    const selectedFlight = useSelector((s) => s.flightSearch?.selectedFlight);
    const criteriaTripType = useSelector((s) => s.flightSearch?.criteria?.tripType); // "oneway" / "round"

    const legs = useMemo(
        () => buildLegs(selectedFlight, criteriaTripType),
        [selectedFlight, criteriaTripType]
    );

    const isRoundTrip = (criteriaTripType || "").toLowerCase() === "round";

    return (
        <div>
            <h2 className="font-bold text-lg">Flight Details</h2>

            {/* ✅ EXACT figma behavior: round => 2 cards, oneway => 1 */}
            {isRoundTrip ? (
                <>
                    <LegCard leg={legs?.[0]} />
                    <LegCard leg={legs?.[1]} />
                </>
            ) : (
                <LegCard leg={legs?.[0]} />
            )}

            <h1 className="font-bold text-2xl ml-5 mt-9 text-blue-900">
                Fare Details
            </h1>

            <div className=" w-[97%] mx-auto mt-4 p-2 ">
                <div className="flex justify-between py-2 bg-white px-7">
                    <span className="font-medium">Base Fare</span>
                    <span>{fareData?.values?.[0] || "PKR 66,150.00"}</span>
                </div>

                <div className="flex justify-between py-2 ">
                    <span className="font-medium pl-4">Taxes</span>
                    <span className="px-8">{fareData?.values?.[1] || "PKR 48,750.00"}</span>
                </div>

                <div className="flex justify-between py-2 bg-white  px-7">
                    <span className="font-medium">Discount</span>
                    <span>{fareData?.values?.[2] || "PKR 500.00"}</span>
                </div>

                <div className="flex justify-between py-2 ">
                    <span className="font-medium pl-4">Service Charges</span>
                    <span className="px-8">{fareData?.values?.[3] || "PKR 100"}</span>
                </div>

                <div className="flex justify-between py-2 font-bold text-blue-800 bg-white px-7">
                    <span>Total</span>
                    <span>{fareData?.price || "PKR 115,500"}</span>
                </div>

                <div className="flex w-full px-3 py-4 mt-3 gap-7 mt-60">
                    <h1 className="text-3xl font-bold text-blue-900">
                        {fareData?.price || "PKR 115,500"}
                    </h1>
                    <button className=" w-[40%] bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-800 transition">
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FlightCard;
