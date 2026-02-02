import React, { useEffect, useRef, useState } from "react";
import pic from "../../pictures/plane.svg";
import pic2 from "../../pictures/plan2.png";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { CiSearch } from "react-icons/ci";
import { AiOutlineClose } from "react-icons/ai";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import PrimaryBtn from "../Common/PrimaryBtn";

import { DateRange, Calendar } from "react-date-range";
import { format } from "date-fns";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const FlightSearch = () => {
    const [showTraveler, setShowTraveler] = useState(false);

    // RoundTrip/OneWay calendar
    const [openCalendar, setOpenCalendar] = useState(false);
    const calendarRef = useRef(null);

    // MultiCity per-row calendar (index)
    const [openMultiCalIndex, setOpenMultiCalIndex] = useState(null);
    const multiCalendarRef = useRef(null);

    // From / To dropdown (single trip)
    const [openFrom, setOpenFrom] = useState(false);
    const [openTo, setOpenTo] = useState(false);

    const fromRef = useRef(null);
    const toRef = useRef(null);
    const travelerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (calendarRef.current && !calendarRef.current.contains(e.target)) {
                setOpenCalendar(false);
            }
            if (multiCalendarRef.current && !multiCalendarRef.current.contains(e.target)) {
                setOpenMultiCalIndex(null);
            }
            if (fromRef.current && !fromRef.current.contains(e.target)) {
                setOpenFrom(false);
            }
            if (toRef.current && !toRef.current.contains(e.target)) {
                setOpenTo(false);
            }
            if (travelerRef.current && !travelerRef.current.contains(e.target)) {
                setShowTraveler(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
        { code: "LHE", name: "Lahore International Airport" },
    ];

    const initialValues = {
        tripType: "roundtrip",
        from: "",
        to: "",
        traveler: 1,
        travelClass: "Economy",
        fromDate: "",
        toDate: "",
        //  MultiCity: start with 2 EMPTY rows (no preset date/from/to)
        segments: [
            { from: "", to: "", date: "" },
            { from: "", to: "", date: "" },
        ],
    };

    //  Validation: MultiCity requires segments filled, Round/One requires single fields
    const validationSchema = Yup.object().shape({
        tripType: Yup.string().oneOf(["roundtrip", "oneway", "multicity"]).required(),

        from: Yup.string().when("tripType", {
            is: (t) => t !== "multicity",
            then: (s) => s.required("From is required"),
            otherwise: (s) => s.notRequired(),
        }),

        to: Yup.string().when("tripType", {
            is: (t) => t !== "multicity",
            then: (s) => s.required("To is required"),
            otherwise: (s) => s.notRequired(),
        }),

        traveler: Yup.number().min(1).max(4).required("Traveler is required"),
        travelClass: Yup.string().required("Class is required"),

        fromDate: Yup.string().when("tripType", {
            is: (t) => t === "roundtrip" || t === "oneway",
            then: (s) => s.required("Departure date is required"),
            otherwise: (s) => s.notRequired(),
        }),

        toDate: Yup.string().when("tripType", {
            is: "roundtrip",
            then: (schema) => schema.required("Return date is required"),
            otherwise: (schema) => schema.notRequired(),
        }),

        segments: Yup.array().when("tripType", {
            is: "multicity",
            then: (arrSchema) =>
                arrSchema
                    .min(2, "At least 2 flights required")
                    .max(5, "Maximum 5 flights allowed")
                    .of(
                        Yup.object().shape({
                            from: Yup.string().required("From is required"),
                            to: Yup.string().required("To is required"),
                            date: Yup.string().required("Date is required"),
                        })
                    ),
            otherwise: (arrSchema) => arrSchema.notRequired(),
        }),
    });

    //  IMPORTANT: Submit payload me only relevant data bhejo
    const handleSubmit = (values) => {
        const cleanedSegments = (values.segments || []).filter(
            (s) => s.from && s.to && s.date
        );

        const payload =
            values.tripType === "multicity"
                ? {
                    tripType: values.tripType,
                    traveler: values.traveler,
                    travelClass: values.travelClass,
                    segments: cleanedSegments, //  only filled segments
                }
                : {
                    tripType: values.tripType,
                    from: values.from,
                    to: values.to,
                    traveler: values.traveler,
                    travelClass: values.travelClass,
                    fromDate: values.fromDate,
                    ...(values.tripType === "roundtrip" ? { toDate: values.toDate } : {}),
                    //  segments OMIT for oneway/roundtrip
                };

        console.log("Submit Payload:", payload);
    };

    const fieldShell =
        "flex items-stretch border border-gray-300 rounded-lg bg-white h-[100px]";

    return (
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ values, setFieldValue }) => {
                const isRoundTrip = values.tripType === "roundtrip";
                const isOneWay = values.tripType === "oneway";
                const isMulti = values.tripType === "multicity";

                const current = optionsFrom.find((opt) => opt.code === values.from);
                const currentTo = optionsTo.find((opt) => opt.code === values.to);

                const swapAirports = () => {
                    if (!values.from && !values.to) return;
                    const oldFrom = values.from;
                    const oldTo = values.to;
                    setFieldValue("from", oldTo);
                    setFieldValue("to", oldFrom);
                };

                // Dates display (single trip)
                const displayFrom = values.fromDate ? format(new Date(values.fromDate), "dd MMM yyyy") : "";
                const displayTo = values.toDate ? format(new Date(values.toDate), "dd MMM yyyy") : "";

                const startDateObj = values.fromDate ? new Date(values.fromDate) : new Date();
                const endDateObj = values.toDate ? new Date(values.toDate) : startDateObj;

                const rangeSelection = [
                    { startDate: startDateObj, endDate: endDateObj, key: "selection" },
                ];

                const setTripType = (type) => {
                    setFieldValue("tripType", type);
                    setOpenCalendar(false);
                    setOpenMultiCalIndex(null);

                    if (type === "oneway") {
                        setFieldValue("toDate", "");
                    }

                    //  UI phase: multicity me empty rows maintain (already in initialValues)
                    // (No need to reset here unless you want)
                };

                //  Multicity helpers
                const addSegment = () => {
                    if (values.segments.length >= 5) return;
                    const newSeg = { from: "", to: "", date: "" };
                    setFieldValue("segments", [...values.segments, newSeg]);
                };

                const removeSegment = (index) => {
                    const updated = values.segments.filter((_, i) => i !== index);
                    setFieldValue("segments", updated);
                };

                const updateSegment = (index, field, value) => {
                    const updated = [...values.segments];
                    updated[index] = { ...updated[index], [field]: value };
                    setFieldValue("segments", updated);
                };

                const swapSegment = (index) => {
                    const seg = values.segments[index];
                    const updated = [...values.segments];
                    updated[index] = { ...seg, from: seg.to, to: seg.from };
                    setFieldValue("segments", updated);
                };

                return (
                    <div className="w-full">
                        {/* Tabs */}
                        <div className="flex gap-6 mb-3 text-sm">
                            <span
                                onClick={() => setTripType("roundtrip")}
                                className={`cursor-pointer ${values.tripType === "roundtrip" ? "font-bold text-black" : "text-gray-500"
                                    }`}
                            >
                                ROUND TRIP
                            </span>

                            <span
                                onClick={() => setTripType("oneway")}
                                className={`cursor-pointer ${values.tripType === "oneway" ? "font-bold text-black" : "text-gray-500"
                                    }`}
                            >
                                ONE WAY
                            </span>

                            <span
                                onClick={() => setTripType("multicity")}
                                className={`cursor-pointer ${values.tripType === "multicity" ? "font-bold text-black" : "text-gray-500"
                                    }`}
                            >
                                MULTI CITY
                            </span>
                        </div>

                        <Form className="w-full">
                            {/* ===================== SINGLE TRIP UI ===================== */}
                            {!isMulti && (
                                <div className="flex w-full gap-3 items-stretch mb-2">
                                    {/* FROM + TO GROUP */}
                                    <div className="relative z-[60] flex items-stretch w-[50%] gap-3 min-w-0">
                                        {/* FROM BOX */}
                                        <div className={`${fieldShell} w-1/2 min-w-0 relative overflow-visible z-[70]`} ref={fromRef}>
                                            <div className="bg-blue-500 flex items-center justify-center w-12 shrink-0 rounded-l-lg">
                                                <img src={pic} alt="Plane" className="w-6 h-6" />
                                            </div>

                                            <div className="flex-1 px-4 flex flex-col justify-center min-w-0">
                                                <span className="font-bold text-lg leading-tight">{current?.code || ""}</span>

                                                <div
                                                    onClick={() => {
                                                        setOpenFrom((p) => !p);
                                                        setOpenTo(false);
                                                    }}
                                                    className={`cursor-pointer text-sm mt-1 ${current?.name ? "text-gray-600" : "text-gray-400"}`}
                                                    title={current?.name || "From (City or Airport)"}
                                                >
                                                    <span
                                                        className="block max-w-full leading-snug break-words"
                                                        style={{
                                                            display: "-webkit-box",
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: "vertical",
                                                            overflow: "hidden",
                                                        }}
                                                    >
                                                        {current?.name || "From (City or Airport)"}
                                                    </span>
                                                </div>
                                            </div>

                                            {openFrom && (
                                                <div className="absolute left-0 top-[105px] w-full bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999] overflow-hidden">
                                                    {optionsFrom.map((opt) => (
                                                        <div
                                                            key={opt.code}
                                                            onClick={() => {
                                                                setFieldValue("from", opt.code);
                                                                setOpenFrom(false);
                                                            }}
                                                            className="flex items-start gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer"
                                                        >
                                                            <div className="w-6 flex justify-center mt-1">
                                                                <img src={pic} alt="plane" className="w-5 h-5" style={{ filter: "brightness(0)" }} />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="font-semibold text-gray-900">{opt.code}</div>
                                                                <div className="text-sm text-gray-500 break-words leading-snug">{opt.name}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* SWAP BUTTON (Figma like) */}
                                        <div
                                            onClick={swapAirports}
                                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
             w-9 h-9 rounded-full bg-white border border-gray-200
             shadow-sm z-[90] flex items-center justify-center cursor-pointer"
                                            title="Swap"
                                        >
                                            <div className="flex items-center gap-[2px] text-gray-400">
                                                <FiArrowLeft className="text-base" />
                                                <FiArrowRight className="text-base" />
                                            </div>
                                        </div>


                                        {/* TO BOX */}
                                        <div className={`${fieldShell} w-1/2 min-w-0 relative overflow-visible z-[70]`} ref={toRef}>
                                            <div className="flex-1 px-4 flex flex-col justify-center min-w-0">
                                                <span className="font-bold text-lg leading-tight">{currentTo?.code || ""}</span>

                                                <div
                                                    onClick={() => {
                                                        setOpenTo((p) => !p);
                                                        setOpenFrom(false);
                                                    }}
                                                    className={`cursor-pointer text-sm mt-1 ${currentTo?.name ? "text-gray-600" : "text-gray-400"}`}
                                                    title={currentTo?.name || "To (City or Airport)"}
                                                >
                                                    <span
                                                        className="block max-w-full leading-snug break-words"
                                                        style={{
                                                            display: "-webkit-box",
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: "vertical",
                                                            overflow: "hidden",
                                                        }}
                                                    >
                                                        {currentTo?.name || "To (City or Airport)"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="bg-blue-500 flex items-center justify-center w-12 shrink-0 rounded-r-lg">
                                                <img src={pic2} alt="Arrival" className="w-9 h-9" />
                                            </div>

                                            {openTo && (
                                                <div className="absolute left-0 top-[105px] w-full bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999] overflow-hidden">
                                                    {optionsTo.map((opt) => (
                                                        <div
                                                            key={opt.code}
                                                            onClick={() => {
                                                                setFieldValue("to", opt.code);
                                                                setOpenTo(false);
                                                            }}
                                                            className="flex items-start gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer"
                                                        >
                                                            <div className="w-6 flex justify-center mt-1">
                                                                <img src={pic} alt="plane" className="w-5 h-5" style={{ filter: "brightness(0)" }} />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="font-semibold text-gray-900">{opt.code}</div>
                                                                <div className="text-sm text-gray-500 break-words leading-snug">{opt.name}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* RIGHT SIDE */}
                                    <div className="flex gap-3 w-[50%] min-w-0">
                                        {/* Date */}
                                        <div className="flex-1 relative min-w-0" ref={calendarRef}>
                                            <div
                                                className={`${fieldShell} px-4 cursor-pointer flex flex-col justify-center`}
                                                onClick={() => setOpenCalendar((p) => !p)}
                                            >
                                                <span className="font-bold text-lg">{isRoundTrip ? "Date Range" : "Select Date"}</span>

                                                <p className="text-gray-400 text-sm mt-1">
                                                    {isRoundTrip ? "Departure - Return Date" : "Departure Date"}
                                                </p>

                                                <p className="text-gray-500 text-sm mt-1 truncate">
                                                    {isRoundTrip ? (
                                                        displayFrom || displayTo ? (
                                                            <>
                                                                {displayFrom} {displayFrom && displayTo ? "→" : ""} {displayTo}
                                                            </>
                                                        ) : (
                                                            ""
                                                        )
                                                    ) : (
                                                        <>{displayFrom}</>
                                                    )}
                                                </p>
                                            </div>

                                            {openCalendar && (
                                                <div className="absolute top-[110px] left-[-140px] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 p-3 max-w-[95vw] overflow-auto">
                                                    {isRoundTrip && (
                                                        <DateRange
                                                            ranges={rangeSelection}
                                                            onChange={(item) => {
                                                                const start = item.selection.startDate;
                                                                const end = item.selection.endDate;
                                                                setFieldValue("fromDate", format(start, "yyyy-MM-dd"));
                                                                setFieldValue("toDate", format(end, "yyyy-MM-dd"));
                                                            }}
                                                            months={2}
                                                            direction="horizontal"
                                                            moveRangeOnFirstSelection={false}
                                                            editableDateInputs={true}
                                                            showDateDisplay={false}
                                                        />
                                                    )}

                                                    {isOneWay && (
                                                        <Calendar
                                                            date={values.fromDate ? new Date(values.fromDate) : new Date()}
                                                            onChange={(date) => setFieldValue("fromDate", format(date, "yyyy-MM-dd"))}
                                                        />
                                                    )}

                                                    <div className="flex justify-end mt-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => setOpenCalendar(false)}
                                                            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold"
                                                        >
                                                            Done
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Traveler */}
                                        <div className="flex-1 relative min-w-0" ref={travelerRef}>
                                            <div
                                                className={`${fieldShell} px-4 cursor-pointer flex flex-col justify-center`}
                                                onClick={() => setShowTraveler((p) => !p)}
                                            >
                                                <span className="font-bold text-lg">Traveler and class</span>
                                                <p className="text-gray-500 text-sm mt-1 truncate">
                                                    {values.traveler} Traveler - {values.travelClass}
                                                </p>
                                            </div>

                                            {showTraveler && (
                                                <div className="absolute top-[110px] left-0 w-full bg-white border border-gray-300 rounded-lg p-3 shadow-xl z-50">
                                                    <p className="font-semibold mb-2">Travelers</p>
                                                    <div className="flex gap-2 mb-3 flex-wrap">
                                                        {[1, 2, 3, 4].map((num) => (
                                                            <button
                                                                type="button"
                                                                key={num}
                                                                onClick={() => setFieldValue("traveler", num)}
                                                                className={`px-3 py-1 border rounded ${values.traveler === num ? "bg-blue-500 text-white" : ""}`}
                                                            >
                                                                {num}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    <p className="font-semibold mb-2">Class</p>
                                                    <div className="flex gap-2 flex-wrap">
                                                        {["Economy", "Business", "First"].map((cls) => (
                                                            <button
                                                                type="button"
                                                                key={cls}
                                                                onClick={() => setFieldValue("travelClass", cls)}
                                                                className={`px-3 py-1 border rounded ${values.travelClass === cls ? "bg-blue-500 text-white" : ""}`}
                                                            >
                                                                {cls}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Search Button */}
                                        <div className="w-[100px] min-w-[100px]">
                                            <PrimaryBtn
                                                type="submit"
                                                className="w-full h-[100px] bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-3xl flex items-center justify-center"
                                            >
                                                <CiSearch />
                                            </PrimaryBtn>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ===================== MULTI CITY UI ===================== */}
                            {isMulti && (
                                <div className="flex flex-col gap-3">
                                    {values.segments.map((seg, index) => (
                                        <div key={suggestedKey(seg, index)} className="flex items-center gap-2 relative w-full">
                                            {/* Left 70% */}
                                            <div className="flex flex-1 w-[70%] gap-2 min-w-0">
                                                {/* From */}
                                                <div className="flex border border-gray-300 rounded-lg flex-1 h-20 overflow-hidden min-w-0">
                                                    <div className="bg-blue-500 flex items-center justify-center h-full w-12 shrink-0">
                                                        <img src={pic} alt="Plane" className="w-6 h-6" />
                                                    </div>

                                                    <div className="flex-1 p-3 flex flex-col justify-center min-w-0">
                                                        <span className="font-bold text-lg">{seg.from || ""}</span>

                                                        <select
                                                            className={`mt-1 border-none outline-none w-full cursor-pointer text-sm bg-transparent ${seg.from ? "text-gray-600" : "text-gray-400"
                                                                }`}
                                                            value={seg.from}
                                                            onChange={(e) => updateSegment(index, "from", e.target.value)}
                                                        >
                                                            <option value="" disabled>
                                                                From (City or Airport)
                                                            </option>
                                                            {optionsFrom.map((opt) => (
                                                                <option key={opt.code} value={opt.code}>
                                                                    {opt.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Swap */}
                                                <div
                                                    onClick={() => swapSegment(index)}
                                                    className="flex flex-col items-center justify-center w-7 h-7 mt-7 rounded-full border border-gray-300 text-gray-500 cursor-pointer bg-white shadow-lg z-10 shrink-0"
                                                    title="Swap"
                                                >
                                                    <FiArrowLeft className="text-xl" />
                                                    <FiArrowRight className="text-xl" />
                                                </div>

                                                {/* To */}
                                                <div className="flex items-center border border-gray-300 rounded-lg flex-1 h-20 overflow-hidden min-w-0">
                                                    <div className="flex-1 p-3 flex flex-col justify-center min-w-0">
                                                        <span className="font-bold text-lg">{seg.to || ""}</span>

                                                        <select
                                                            className={`mt-1 border-none outline-none w-full cursor-pointer text-sm bg-transparent ${seg.to ? "text-gray-600" : "text-gray-400"
                                                                }`}
                                                            value={seg.to}
                                                            onChange={(e) => updateSegment(index, "to", e.target.value)}
                                                        >
                                                            <option value="" disabled>
                                                                To (City or Airport)
                                                            </option>
                                                            {optionsTo.map((opt) => (
                                                                <option key={opt.code} value={opt.code}>
                                                                    {opt.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div className="bg-blue-500 flex items-center justify-center h-full w-12 shrink-0">
                                                        <img src={pic2} alt="Arrival" className="w-6 h-6" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right 30%: Date + remove */}
                                            <div className="flex items-center gap-2 ml-4 w-[30%] justify-end">
                                                <div className="flex-1 border border-gray-300 rounded-lg p-3 relative h-20 flex flex-col justify-center">
                                                    <span className="font-bold text-lg">Select Date</span>

                                                    <p
                                                        className={`text-sm mt-1 cursor-pointer ${seg.date ? "text-gray-600" : "text-gray-400"}`}
                                                        onClick={() => setOpenMultiCalIndex(index)}
                                                    >
                                                        {seg.date ? format(new Date(seg.date), "dd MMM yyyy") : "Departure Date"}
                                                    </p>

                                                    {openMultiCalIndex === index && (
                                                        <div
                                                            ref={multiCalendarRef}
                                                            className="absolute top-[85px] right-0 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 p-3"
                                                        >
                                                            <Calendar
                                                                date={seg.date ? new Date(seg.date) : new Date()}
                                                                onChange={(date) => {
                                                                    updateSegment(index, "date", format(date, "yyyy-MM-dd"));
                                                                }}
                                                            />
                                                            <div className="flex justify-end mt-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setOpenMultiCalIndex(null)}
                                                                    className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold"
                                                                >
                                                                    Done
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Remove only for 3rd+ flights */}
                                                {index > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeSegment(index)}
                                                        className="text-gray-500 hover:text-red-500"
                                                        title="Remove"
                                                    >
                                                        <AiOutlineClose size={20} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Bottom row */}
                                    <div className="flex justify-between items-center mt-2 w-full">
                                        {/* Add Flight */}
                                        <div>
                                            {values.segments.length < 5 && (
                                                <button
                                                    type="button"
                                                    onClick={addSegment}
                                                    className="text-blue-600 text-md hover:bg-blue-200 border border-blue-600 rounded-2xl py-4 px-8"
                                                >
                                                    + Add Flight
                                                </button>
                                            )}
                                        </div>

                                        {/* Traveler & Search */}
                                        <div className="flex gap-3 items-center w-[40%] justify-end">
                                            <div className="border border-gray-300 rounded-lg p-3 relative flex-1" ref={travelerRef}>
                                                <span className="font-bold text-lg">Traveler and class</span>
                                                <p
                                                    className="text-gray-500 text-sm mt-1 cursor-pointer"
                                                    onClick={() => setShowTraveler((p) => !p)}
                                                >
                                                    {values.traveler} Traveler - {values.travelClass}
                                                </p>

                                                {showTraveler && (
                                                    <div className="absolute top-full right-0 w-full bg-white border border-gray-300 rounded-lg mt-2 p-3 shadow-xl z-50">
                                                        <p className="font-semibold mb-2">Travelers</p>
                                                        <div className="flex gap-2 mb-3 flex-wrap">
                                                            {[1, 2, 3, 4].map((num) => (
                                                                <button
                                                                    type="button"
                                                                    key={num}
                                                                    onClick={() => setFieldValue("traveler", num)}
                                                                    className={`px-3 py-1 border rounded ${values.traveler === num ? "bg-blue-500 text-white" : ""
                                                                        }`}
                                                                >
                                                                    {num}
                                                                </button>
                                                            ))}
                                                        </div>

                                                        <p className="font-semibold mb-2">Class</p>
                                                        <div className="flex gap-2 flex-wrap">
                                                            {["Economy", "Business", "First"].map((cls) => (
                                                                <button
                                                                    type="button"
                                                                    key={cls}
                                                                    onClick={() => setFieldValue("travelClass", cls)}
                                                                    className={`px-3 py-1 border rounded ${values.travelClass === cls ? "bg-blue-500 text-white" : ""
                                                                        }`}
                                                                >
                                                                    {cls}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="w-[100px] min-w-[100px]">
                                                <PrimaryBtn
                                                    type="submit"
                                                    className="w-full h-[80px] bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-3xl flex items-center justify-center"
                                                >
                                                    <CiSearch />
                                                </PrimaryBtn>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Form>
                    </div>
                );
            }}
        </Formik>
    );
};

//  stable key helper (optional)
function suggestedKey(seg, index) {
    // UI phase: simple stable key
    return `${index}-${seg.from}-${seg.to}-${seg.date}`;
}

export default FlightSearch;
