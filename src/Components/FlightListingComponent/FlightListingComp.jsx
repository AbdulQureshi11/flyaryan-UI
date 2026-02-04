import React, { useMemo, useState } from "react";
import pic3 from "../../pictures/linessss.png";
import { Link, useNavigate } from "react-router-dom";
import FlightSearch from "../HomeComponent/FlightSearch";
import takeoff from "../../pictures/plane.svg";
import landing from "../../pictures/plan2.png";
import laggage from "../../assets/laggage.png";
import routeline from "../../assets/Line.png";
// Airline Logos
import { getAirlineLogo } from "../../utlis/airlineLogo";

// Icons
import { MdOutlineAirplanemodeActive } from "react-icons/md";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { setSelectedFlight } from "../../features/flightsearch/flightsearchSlice";

// Dummy blocks (top summary)

import Filter from "./Filter";
import MultiDate from "./MultiDate";

// ---------- helpers ----------

//scalculation (route-based)
const getRouteStops = (flight, isOneWay) => {
    const segments = Array.isArray(flight?.segments) ? flight.segments : [];

    if (isOneWay) {
        return Math.max(0, segments.length - 1);
    }

    const outSegs = segments.filter(s => String(s.group) === "0");
    const inSegs = segments.filter(s => String(s.group) === "1");

    const outboundStops = Math.max(0, outSegs.length - 1);
    const inboundStops = Math.max(0, inSegs.length - 1);

    // route ka stop = max of both sides
    return Math.max(outboundStops, inboundStops);
};


const safe = (v, fallback = "") =>
    v === undefined || v === null || v === "" ? fallback : v;

// baggage max weight only
const baggageMaxOnly = (b, fallback = "") => {
    if (!b) return fallback;

    if (typeof b === "object") {
        const w = b.maxWeight ?? b.weight ?? b.value ?? "";
        return w ? String(w) : fallback;
    }

    const s = String(b);
    const m = s.match(/(\d+(\.\d+)?)/);
    return m ? m[1] : fallback;
};

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

const moneyText = (flight) => {
    const cur = flight?.currency || "PKR";
    const amt = flight?.displayPrice ?? "";
    if (amt === "") return `${cur} --`;
    const num = Number(amt);
    const pretty = Number.isFinite(num) ? num.toLocaleString() : String(amt);
    return `${cur} ${pretty}`;
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

// RoundTrip adapter
const adaptRoundTrip = (flight) => {
    const segments = Array.isArray(flight?.segments) ? flight.segments : [];

    const outSegs = segments.filter((s) => String(s.group) === "0");
    const inSegs = segments.filter((s) => String(s.group) === "1");

    const outFirst = outSegs[0] || null;
    const outLast = outSegs[outSegs.length - 1] || null;

    const inFirst = inSegs[0] || null;
    const inLast = inSegs[inSegs.length - 1] || null;

    const airlineCode = safe(
        outFirst?.carrier,
        safe(flight?.travelportData?.platingCarrier, "")
    );
    const airlineName = airlineNameFromCode(airlineCode);

    const outboundFlightNo = safe(outFirst?.flightNumber, "");
    const inboundFlightNo = safe(inFirst?.flightNumber, "");

    const className = safe(outFirst?.cabinClass, "Economy");
    const baggage = baggageMaxOnly(flight?.baggage, "30");

    const refundable = flight?.pricing?.refundable;
    const refundableLabel = refundable === true ? "Refundable" : "Non-refundable";

    const priceText = moneyText(flight);

    const outDurationMin = outSegs.reduce(
        (sum, s) => sum + Number(s.flightTime || 0),
        0
    );
    const inDurationMin = inSegs.reduce(
        (sum, s) => sum + Number(s.flightTime || 0),
        0
    );

    const outbound = {
        fromCode: safe(outFirst?.from, ""),
        toCode: safe(outLast?.to, safe(outFirst?.to, "")),
        departTime: safe(outFirst?.departure, ""),
        arriveTime: safe(outLast?.arrival, safe(outFirst?.arrival, "")),
        duration: minutesToHM(outDurationMin),
        stopsLabel: stopsLabelFromSegs(outSegs),
        dateLabel: formatDayDate(outFirst?.departure),
    };

    const inbound = {
        fromCode: safe(inFirst?.from, ""),
        toCode: safe(inLast?.to, safe(inFirst?.to, "")),
        departTime: safe(inFirst?.departure, ""),
        arriveTime: safe(inLast?.arrival, safe(inFirst?.arrival, "")),
        duration: minutesToHM(inDurationMin),
        stopsLabel: stopsLabelFromSegs(inSegs),
        dateLabel: formatDayDate(inFirst?.departure),
    };

    return {
        airlineName,
        airlineCode,
        outboundFlightNo,
        inboundFlightNo,
        className,
        baggage,
        refundableLabel,
        priceText,
        outbound,
        inbound,
    };
};

// OneWay adapter
const adaptOneWay = (flight) => {
    const segments = Array.isArray(flight?.segments) ? flight.segments : [];

    const outSegs = segments.some((s) => String(s.group) === "0")
        ? segments.filter((s) => String(s.group) === "0")
        : segments;

    const first = outSegs[0] || null;
    const last = outSegs[outSegs.length - 1] || null;

    const airlineCode = safe(
        first?.carrier,
        safe(flight?.travelportData?.platingCarrier, "")
    );
    const airlineName = airlineNameFromCode(airlineCode);

    const flightNo = safe(first?.flightNumber, "");

    const className = safe(first?.cabinClass, "Economy");
    const baggage = baggageMaxOnly(flight?.baggage, "30");

    const refundable = flight?.pricing?.refundable;
    const refundableLabel = refundable === true ? "Refundable" : "Non-refundable";

    const priceText = moneyText(flight);

    const durationMin = outSegs.reduce(
        (sum, s) => sum + Number(s.flightTime || 0),
        0
    );

    const outbound = {
        fromCode: safe(first?.from, ""),
        toCode: safe(last?.to, safe(first?.to, "")),
        departTime: safe(first?.departure, ""),
        arriveTime: safe(last?.arrival, safe(first?.arrival, "")),
        duration: minutesToHM(durationMin),
        stopsLabel: stopsLabelFromSegs(outSegs),
        dateLabel: formatDayDate(first?.departure),
    };

    return {
        airlineName,
        airlineCode,
        flightNo,
        className,
        baggage,
        refundableLabel,
        priceText,
        outbound,
    };
};

const FlightListingComp = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { flights, loading, error, totalResults, criteria } = useSelector(
        (state) => state.flightSearch
    );

    const displayFlights = useMemo(
        () => (Array.isArray(flights) ? flights : []),
        [flights]
    );

    // filters state
    const [filters, setFilters] = useState({
        TIME: "TIME",
        PRICE: "PRICE",
        STOPS: "STOPS",
        CLASS: "CLASS",
        REFUNDABLE: "REFUNDABLE",
        AIRLINE: "AIRLINE",
    });

    // NEW: dynamic airlines from response
    const airlineOptions = useMemo(() => {
        const set = new Set();
        displayFlights.forEach((f) => {
            const code =
                f?.segments?.[0]?.carrier || f?.travelportData?.platingCarrier;
            if (code) set.add(code);
        });
        return Array.from(set);
    }, [displayFlights]);

    const filterOptions = useMemo(
        () => ({
            TIME: ["Morning", "Afternoon", "Evening"],
            PRICE: ["Low to High", "High to Low"],
            STOPS: ["Direct", "1 Stop", "2+ Stops"],
            CLASS: [], // skip for Now
            REFUNDABLE: [], // skip for Now
            AIRLINE: airlineOptions,
        }),
        [airlineOptions]
    );

    // NEW: filtered flights
    const filteredFlights = useMemo(() => {
        let data = [...displayFlights];

        // Airline
        if (filters.AIRLINE && filters.AIRLINE !== "AIRLINE") {
            data = data.filter((f) => {
                const code =
                    f?.segments?.[0]?.carrier || f?.travelportData?.platingCarrier;
                return code === filters.AIRLINE;
            });
        }

        // Stops filter (route-aware)
        if (filters.STOPS !== "STOPS") {
            data = data.filter((f) => {
                const tripTypeUI = criteria?.tripType || f?.tripType || "round";
                const isOneWay = tripTypeUI === "oneway";

                const stops = getRouteStops(f, isOneWay);

                if (filters.STOPS === "Direct") return stops === 0;
                if (filters.STOPS === "1 Stop") return stops === 1;
                if (filters.STOPS === "2+ Stops") return stops >= 2;

                return true;
            });
        }

        // Price sorting
        if (filters.PRICE === "Low to High") {
            data.sort((a, b) => Number(a?.displayPrice || 0) - Number(b?.displayPrice || 0));
        }
        if (filters.PRICE === "High to Low") {
            data.sort((a, b) => Number(b?.displayPrice || 0) - Number(a?.displayPrice || 0));
        }

        // Time buckets (based on first segment departure)
        const getHour = (f) => {
            const t = f?.segments?.[0]?.departure;
            if (!t) return null;
            // ISO: 2026-02-19T01:35:00
            const h = Number(String(t).slice(11, 13));
            return Number.isFinite(h) ? h : null;
        };

        if (filters.TIME === "Morning") data = data.filter((f) => (getHour(f) ?? 99) < 12);
        if (filters.TIME === "Afternoon") data = data.filter((f) => {
            const h = getHour(f);
            return h !== null && h >= 12 && h < 18;
        });
        if (filters.TIME === "Evening") data = data.filter((f) => (getHour(f) ?? -1) >= 18);

        return data;
    }, [displayFlights, filters]);

    return (
        <>
            <div className="flex flex-col items-center mt-10 w-full gap-6">
                {/* Main Form */}
                <div className="w-[87%] border border-gray-300 rounded-xl p-4 flex flex-col gap-4 bg-white shadow-lg">
                    <FlightSearch />
                </div>

                {/* Filter (wired) */}
                <Filter
                    options={filterOptions}
                    onChange={setFilters}
                    resetKey={criteria}
                />
            </div>

            {/* Top summary row */}
            <div>
                <MultiDate resultsCount={filteredFlights.length} nextDatesCount={6} />
            </div>

            {/* Loading / Error / Empty */}
            <div className="w-[90%] mx-auto mb-6">
                {loading && (
                    <div className="p-3 rounded border border-blue-200 bg-blue-50 text-blue-700">
                        Searching flights...
                    </div>
                )}

                {!loading && error?.error && (
                    <div className="p-3 rounded border border-red-200 bg-red-50 text-red-700">
                        {error?.error} {error?.message ? `- ${error.message}` : ""}
                    </div>
                )}

                {!loading && !error && filteredFlights.length === 0 && (
                    <div className="p-3 rounded border border-gray-200 bg-gray-50 text-gray-700">
                        No flights found.
                    </div>
                )}
            </div>

            {/* Flight cards */}
            <div className="w-[90%] mx-auto flex flex-col gap-6 mb-10">
                {/* IMPORTANT: map filteredFlights */}
                {filteredFlights.map((flight, index) => {
                    const tripTypeUI = criteria?.tripType || flight?.tripType || "round";
                    const isOneWay = tripTypeUI === "oneway";

                    const ui = isOneWay ? adaptOneWay(flight) : adaptRoundTrip(flight);

                    const airlineLogo = getAirlineLogo(ui.airlineCode);

                    const o = ui.outbound;
                    const oDep = formatTime(o.departTime);
                    const oArr = formatTime(o.arriveTime);

                    const outNo = isOneWay
                        ? ui.flightNo
                            ? `${ui.airlineCode}-${ui.flightNo}`
                            : ui.airlineCode
                        : ui.outboundFlightNo
                            ? `${ui.airlineCode}-${ui.outboundFlightNo}`
                            : ui.airlineCode;

                    const r = !isOneWay ? ui.inbound : null;
                    const rDep = !isOneWay ? formatTime(r.departTime) : "";
                    const rArr = !isOneWay ? formatTime(r.arriveTime) : "";

                    const inNo = !isOneWay
                        ? ui.inboundFlightNo
                            ? `${ui.airlineCode}-${ui.inboundFlightNo}`
                            : ui.airlineCode
                        : "";

                    return (
                        <div
                            key={flight?.id || index}
                            className="rounded-lg overflow-hidden shadow-[0_6px_15px_-4px_rgba(0,0,0,0.3)] bg-white"
                        >
                            {/* TOP ROW */}
                            <div className="flex items-center bg-[#F2F2F2] w-full h-[45px] relative border-t border-gray-300">
                                <h1 className="absolute w-7 h-7 bg-white border border-gray-300 rounded-full left-[47%] -top-3 -bottom-3 z-10"></h1>

                                {/* LEFT SIDE */}
                                <div className="flex items-center gap-2">
                                    <div className="bg-blue-600 w-[45px] h-[45px] flex items-center justify-center p-2">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold">
                                            <img src={takeoff} alt="" />
                                        </div>
                                    </div>

                                    <div className="text-sm font-semibold flex items-center gap-2">
                                        {airlineLogo ? (
                                            <img
                                                src={airlineLogo}
                                                alt={ui.airlineCode}
                                                className="w-15 h-15 object-contain"
                                            />
                                        ) : (
                                            <span className="w-5 h-5 flex items-center justify-center text-xs">
                                                ✈
                                            </span>
                                        )}
                                        <span className="text-[13px]">{ui.airlineName}</span>
                                    </div>

                                    <div className="text-gray-500 text-[10px]">{outNo}</div>

                                    <div className="text-[10px] text-white bg-green-500 w-[50px] h-[20px] flex items-center justify-center text-center">
                                        {ui.className}
                                    </div>

                                    <div className="text-gray-700 text-sm">|</div>

                                    <div className="text-gray-500 text-[12px] flex relative px-3 items-center">
                                        <img
                                            src={laggage}
                                            alt=""
                                            className="w-[30%] absolute right-10"
                                        />
                                        {ui.baggage}
                                        <p>kg</p>
                                    </div>

                                    <div className="text-gray-700 text-sm">|</div>

                                    <div className="font-semibold text-[12px]">{o.dateLabel}</div>
                                </div>

                                {/* RIGHT SIDE */}
                                <div className="flex items-center gap-2 ml-auto pr-2">
                                    <div className="text-xs mr-5 bg-gray-700 text-white w-14 pt-1 pl-3 rounded h-7">
                                        {o.stopsLabel}
                                    </div>

                                    {!isOneWay && (
                                        <>
                                            <div className="font-semibold text-[12px]">{r.dateLabel}</div>

                                            <div className="text-gray-700 text-sm">|</div>

                                            <div className="text-gray-500 text-[12px] flex relative px-4 items-center">
                                                <img
                                                    src={laggage}
                                                    alt=""
                                                    className="w-[30%] absolute right-10"
                                                />
                                                {ui.baggage}
                                                <p>kg</p>
                                            </div>

                                            <div className="text-gray-700 text-sm ml-[-10px]">|</div>

                                            <div className="text-[10px] text-white bg-green-500 w-[50px] h-[20px] flex items-center justify-center text-center">
                                                {ui.className}
                                            </div>

                                            <div className="text-gray-500 text-[10px]">{inNo}</div>

                                            <div className="text-sm font-semibold flex items-center gap-2">
                                                <span className="text-[13px]">{ui.airlineName}</span>
                                                {airlineLogo ? (
                                                    <img
                                                        src={airlineLogo}
                                                        alt={ui.airlineCode}
                                                        className="w-15 h-15 object-contain"
                                                    />
                                                ) : (
                                                    <span className="w-5 h-5 flex items-center justify-center text-xs">
                                                        ✈
                                                    </span>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    {!isOneWay && (
                                        <div className="bg-blue-600 w-[45px] h-[45px] mr-[-10px] p-1 flex items-center justify-center">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold">
                                                <img src={landing} alt="" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* MIDDLE SECTION */}
                            <div className="w-full h-[105px] relative flex">
                                {!isOneWay && (
                                    <div className="absolute left-[48%] ">
                                        <img src={pic3} alt="" className="mt-2" />
                                    </div>
                                )}

                                {isOneWay ? (
                                    <div className="w-full flex">
                                        <div className="pl-3">
                                            <h1 className="text-md pt-3 text-gray-500">
                                                {safe(o.fromCode, "--")}
                                            </h1>
                                            <h1 className="text-[12px] font-bold text-red-700 pt-1">
                                                Data Not Available
                                            </h1>
                                            <h1 className="text-2xl font-bold">{oDep}</h1>
                                        </div>

                                        <div className="flex items-center pb-3 pl-1 flex-1">
                                            <div className="flex rounded-l-lg rounded-r-lg relative px-2 py-1 flex-1 justify-center">
                                                <img
                                                    src={routeline}
                                                    alt=""
                                                    className="mt-2 w-[320px] h-[1px]"
                                                />
                                                <h1 className="text-[10px] flex items-center gap-1 px-2 py-[2px] absolute top-1 bg-blue-100 rounded-full">
                                                    <MdOutlineAirplanemodeActive className="rotate-90 text-[15px]" />
                                                    {o.duration}
                                                </h1>
                                            </div>

                                            <div className="text-right pr-4">
                                                <h1 className="text-sm text-gray-500 pt-3 pb-1">
                                                    {safe(o.toCode, "--")}
                                                </h1>
                                                <h1 className="text-[12px] font-bold text-red-700 pt-1">
                                                    Data Not Available
                                                </h1>
                                                <h1 className="text-2xl font-bold">{oArr}</h1>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-[50%] flex">
                                            <div className="pl-3">
                                                <h1 className="text-md pt-3 text-gray-500">
                                                    {safe(o.fromCode, "--")}
                                                </h1>
                                                <h1 className="text-[12px] font-bold text-red-700 pt-1">
                                                    Data Not Available
                                                </h1>
                                                <h1 className="text-2xl font-bold">{oDep}</h1>
                                            </div>

                                            <div className="flex items-center pb-3 pl-1">
                                                <div className="flex rounded-l-lg rounded-r-lg relative px-2 py-1">
                                                    <img
                                                        src={routeline}
                                                        alt=""
                                                        className="mt-2 pl-5 ml-7 w-[200px] h-[1px]"
                                                    />
                                                    <h1 className="text-[10px] flex items-center gap-1 pl-2 p-[2px] absolute top-1 left-30 bg-blue-100 rounded-full ">
                                                        <MdOutlineAirplanemodeActive className="rotate-90 text-[15px]" />
                                                        {o.duration}
                                                    </h1>
                                                </div>

                                                <div className="ml-15 text-right">
                                                    <h1 className="text-sm text-gray-500 pt-3 pb-1">
                                                        {safe(o.toCode, "--")}
                                                    </h1>
                                                    <h1 className="text-[12px] font-bold text-red-700 pt-1">
                                                        Data Not Available
                                                    </h1>
                                                    <h1 className="text-2xl font-bold">{oArr}</h1>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-[50%] flex">
                                            <div className="pl-3">
                                                <h1 className="text-md pt-3 text-gray-500">
                                                    {safe(r.fromCode, "--")}
                                                </h1>
                                                <h1 className="text-[12px] font-bold text-red-700 pt-1">
                                                    Data Not Available
                                                </h1>
                                                <h1 className="text-2xl font-bold">{rDep}</h1>
                                            </div>

                                            <div className="flex items-center pb-3 pl-1">
                                                <div className="flex rounded-l-lg rounded-r-lg relative px-2 py-1">
                                                    <img
                                                        src={routeline}
                                                        alt=""
                                                        className="mt-2 pl-5 ml-7 w-[200px] h-[1px]"
                                                    />
                                                    <h1 className="text-[10px] flex items-center gap-1 pl-2 p-[2px] absolute top-1 left-30 bg-blue-100 rounded-full ">
                                                        <MdOutlineAirplanemodeActive className="rotate-90 text-[15px]" />
                                                        {r.duration}
                                                    </h1>
                                                </div>

                                                <div className="ml-15 text-right">
                                                    <h1 className="text-sm text-gray-500 pt-3 pb-1">
                                                        {safe(r.toCode, "--")}
                                                    </h1>
                                                    <h1 className="text-[12px] font-bold text-red-700 pt-1">
                                                        Data Not Available
                                                    </h1>
                                                    <h1 className="text-2xl font-bold">{rArr}</h1>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* BOTTOM SECTION */}
                            <div className="flex items-center bg-[#F2F2F2] w-full h-[45px] relative border-t border-gray-300 ">
                                <div className="flex items-center gap-2">
                                    <h1 className="pl-4 text-sm pt-[3px]">{ui.refundableLabel}</h1>

                                    <Link
                                        to="/flight-detail"
                                        className="border border-blue-600 text-blue-600 px-6 py-1 text-sm ml-4 inline-block"
                                        onClick={() => dispatch(setSelectedFlight(flight))}
                                    >
                                        Flight details
                                    </Link>
                                </div>

                                <div className="ml-auto flex items-center gap-4">
                                    <h1 className="text-2xl font-bold text-blue-900">{ui.priceText}</h1>

                                    <h1
                                        className="font-bold text-white bg-blue-600 py-[10px] px-6 cursor-pointer"
                                        onClick={() => {
                                            dispatch(setSelectedFlight(flight));
                                            navigate("/flight-detail");
                                        }}
                                    >
                                        SELECT FLIGHT
                                    </h1>
                                </div>

                                <h1 className="absolute w-7 h-7 bg-white border border-gray-300 rounded-full left-[47%] -bottom-3 z-10"></h1>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
};

export default FlightListingComp;
