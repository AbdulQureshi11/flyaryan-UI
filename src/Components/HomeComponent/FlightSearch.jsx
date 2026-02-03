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

// Redux
import { useDispatch, useSelector } from "react-redux";
import { asyncSearchFlights } from "../../features/flightsearch/flightsearchSlice";

// Router
import { useNavigate } from "react-router-dom";

const API_BASE =
    import.meta?.env?.VITE_API_BASE_URL || "http://localhost:9000/api";

const FlightSearch = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { loading, error, flights } = useSelector((state) => state.flightSearch);

    const [showTraveler, setShowTraveler] = useState(false);

    // Round/OneWay calendar
    const [openCalendar, setOpenCalendar] = useState(false);
    const calendarRef = useRef(null);

    // Multi per-row calendar
    const [openMultiCalIndex, setOpenMultiCalIndex] = useState(null);
    const multiCalendarRef = useRef(null);

    // Suggestions dropdown state
    const [openSuggest, setOpenSuggest] = useState({
        field: null, // "from" | "to" | "mfrom" | "mto"
        index: null,
    });

    // From/To input refs for outside click close
    const fromRef = useRef(null);
    const toRef = useRef(null);
    const travelerRef = useRef(null);

    // Single input text (what user types / sees)
    const [fromText, setFromText] = useState("");
    const [toText, setToText] = useState("");

    // Suggestions data
    const [fromSug, setFromSug] = useState([]);
    const [toSug, setToSug] = useState([]);
    const [multiSug, setMultiSug] = useState([]); // shared for active multi field
    const [sugLoading, setSugLoading] = useState(false);

    // Multi input text per segment
    const [multiText, setMultiText] = useState([
        { fromText: "", toText: "" },
        { fromText: "", toText: "" },
    ]);

    // click outside close
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (calendarRef.current && !calendarRef.current.contains(e.target))
                setOpenCalendar(false);

            if (
                multiCalendarRef.current &&
                !multiCalendarRef.current.contains(e.target)
            )
                setOpenMultiCalIndex(null);

            if (fromRef.current && !fromRef.current.contains(e.target)) {
                setOpenSuggest((p) => (p.field === "from" ? { field: null, index: null } : p));
            }

            if (toRef.current && !toRef.current.contains(e.target)) {
                setOpenSuggest((p) => (p.field === "to" ? { field: null, index: null } : p));
            }

            if (travelerRef.current && !travelerRef.current.contains(e.target))
                setShowTraveler(false);
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // navigate after search success
    useEffect(() => {
        if (!loading && Array.isArray(flights) && flights.length > 0) {
            navigate("/flight-listing");
        }
    }, [loading, flights, navigate]);

    /**
     * Backend: GET /api/airports?q=isb&limit=10
     */
    const fetchAirports = async (q, limit = 8) => {
        const url = `${API_BASE}/airports?q=${encodeURIComponent(q)}&limit=${limit}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Airport API failed");
        return await res.json();
    };

    /**
     * Debounced search helper
     */
    const useDebouncedAirportSearch = (query, onResult, enabled = true) => {
        useEffect(() => {
            if (!enabled) return;
            const q = (query || "").trim();
            if (!q) {
                onResult([]);
                return;
            }

            let alive = true;
            const t = setTimeout(async () => {
                try {
                    setSugLoading(true);
                    const data = await fetchAirports(q, 10);
                    if (alive) onResult(Array.isArray(data) ? data : []);
                } catch (e) {
                    if (alive) onResult([]);
                } finally {
                    if (alive) setSugLoading(false);
                }
            }, 250);

            return () => {
                alive = false;
                clearTimeout(t);
            };
        }, [query, enabled]); // eslint-disable-line
    };

    // single suggestions
    useDebouncedAirportSearch(
        fromText,
        (list) => setFromSug(list),
        openSuggest.field === "from"
    );
    useDebouncedAirportSearch(
        toText,
        (list) => setToSug(list),
        openSuggest.field === "to"
    );

    // multi suggestions (active only)
    const activeMultiIndex = openSuggest.field === "mfrom" || openSuggest.field === "mto"
        ? openSuggest.index
        : null;

    const activeMultiQuery =
        activeMultiIndex != null
            ? openSuggest.field === "mfrom"
                ? multiText?.[activeMultiIndex]?.fromText || ""
                : multiText?.[activeMultiIndex]?.toText || ""
            : "";

    useDebouncedAirportSearch(
        activeMultiQuery,
        (list) => setMultiSug(list),
        activeMultiIndex != null
    );

    /**
     * NOW FORM FIELDS SAME AS BACKEND
     * tripType: oneway | round | multi
     * from/to/date/returnDate/adults/travelClass/segments
     */
    const initialValues = {
        tripType: "round",
        from: "",
        to: "",
        adults: 1,
        travelClass: "Economy",
        date: "",
        returnDate: "",
        segments: [
            { from: "", to: "", date: "" },
            { from: "", to: "", date: "" },
        ],
    };

    // Validation updated to backend names
    const validationSchema = Yup.object().shape({
        tripType: Yup.string().oneOf(["round", "oneway", "multi"]).required(),

        from: Yup.string().when("tripType", {
            is: (t) => t !== "multi",
            then: (s) => s.required("From is required"),
            otherwise: (s) => s.notRequired(),
        }),

        to: Yup.string().when("tripType", {
            is: (t) => t !== "multi",
            then: (s) => s.required("To is required"),
            otherwise: (s) => s.notRequired(),
        }),

        adults: Yup.number().min(1).max(9).required("Adults is required"),
        travelClass: Yup.string().required("Class is required"),

        date: Yup.string().when("tripType", {
            is: (t) => t === "round" || t === "oneway",
            then: (s) => s.required("Departure date is required"),
            otherwise: (s) => s.notRequired(),
        }),

        returnDate: Yup.string().when("tripType", {
            is: "round",
            then: (schema) => schema.required("Return date is required"),
            otherwise: (schema) => schema.notRequired(),
        }),

        segments: Yup.array().when("tripType", {
            is: "multi",
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

    const handleSubmit = async (values) => {
        const tripType =
            values.tripType === "roundtrip" ? "round"
                : values.tripType === "multicity" ? "multi"
                    : values.tripType;

        // ✅ EXACT backend payload (NO adults at top-level)
        let payload = {
            tripType,
            travelClass: values.travelClass ?? "Economy",
            travelers: {
                adults: Number(values.adults ?? 1),
                child: 0,
                infant: 0,
            },
        };

        if (tripType === "multi") {
            payload.segments = (values.segments || [])
                .filter((s) => s.from && s.to && s.date)
                .map((s) => ({
                    from: s.from.toUpperCase(),
                    to: s.to.toUpperCase(),
                    date: s.date,
                }));
        } else {
            payload.from = (values.from || "").toUpperCase();
            payload.to = (values.to || "").toUpperCase();
            payload.date = values.date;

            if (tripType === "round") payload.returnDate = values.returnDate;
        }

        console.log("✅ FINAL PAYLOAD (ONLY ONE) =>", payload);

        const res = await dispatch(asyncSearchFlights(payload));
        if (res?.meta?.requestStatus === "rejected") {
            console.log("Search Failed:", res?.payload);
        }
    };


    const fieldShell =
        "flex items-stretch border border-gray-300 rounded-lg bg-white h-[100px]";

    // Suggest item renderer
    const SuggestItem = ({ item, onPick }) => {
        return (
            <div
                onClick={() => onPick(item)}
                className="flex items-start gap-3 px-4 py-3 hover:bg-gray-100 cursor-pointer"
            >
                <div className="w-6 flex justify-center mt-1">
                    <img
                        src={pic}
                        alt="plane"
                        className="w-5 h-5"
                        style={{ filter: "brightness(0)" }}
                    />
                </div>
                <div className="min-w-0">
                    <div className="font-semibold text-gray-900">
                        {item.iata || item.icao || ""}
                    </div>
                    <div className="text-sm text-gray-500 break-words leading-snug">
                        {item.name}
                        {item.city ? `, ${item.city}` : ""}{" "}
                        {item.country ? `(${item.country})` : ""}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
        >
            {({ values, setFieldValue }) => {
                const isRoundTrip = values.tripType === "round";
                const isOneWay = values.tripType === "oneway";
                const isMulti = values.tripType === "multi";

                const swapAirports = () => {
                    if (!values.from && !values.to) return;

                    // swap form codes
                    const oldFrom = values.from;
                    const oldTo = values.to;
                    setFieldValue("from", oldTo);
                    setFieldValue("to", oldFrom);

                    // swap display text too
                    const oldFromText = fromText;
                    const oldToText = toText;
                    setFromText(oldToText);
                    setToText(oldFromText);
                };

                // display dates
                const displayFrom = values.date
                    ? format(new Date(values.date), "dd MMM yyyy")
                    : "";
                const displayTo = values.returnDate
                    ? format(new Date(values.returnDate), "dd MMM yyyy")
                    : "";

                const startDateObj = values.date ? new Date(values.date) : new Date();
                const endDateObj = values.returnDate ? new Date(values.returnDate) : startDateObj;

                const rangeSelection = [
                    { startDate: startDateObj, endDate: endDateObj, key: "selection" },
                ];

                const setTripType = (type) => {
                    setFieldValue("tripType", type);
                    setOpenCalendar(false);
                    setOpenMultiCalIndex(null);

                    // close suggestions
                    setOpenSuggest({ field: null, index: null });

                    if (type === "oneway") setFieldValue("returnDate", "");
                };

                // multi helpers
                const addSegment = () => {
                    if (values.segments.length >= 5) return;
                    setFieldValue("segments", [
                        ...values.segments,
                        { from: "", to: "", date: "" },
                    ]);

                    setMultiText((prev) => [
                        ...prev,
                        { fromText: "", toText: "" },
                    ]);
                };

                const removeSegment = (index) => {
                    setFieldValue(
                        "segments",
                        values.segments.filter((_, i) => i !== index)
                    );

                    setMultiText((prev) => prev.filter((_, i) => i !== index));
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

                    // swap display texts
                    setMultiText((prev) => {
                        const copy = [...prev];
                        const row = copy[index] || { fromText: "", toText: "" };
                        copy[index] = { fromText: row.toText, toText: row.fromText };
                        return copy;
                    });
                };

                const pickSingleFrom = (item) => {
                    const code = (item.iata || item.icao || "").toUpperCase();
                    setFieldValue("from", code);
                    setFromText(`${item.city || ""} - ${item.name} (${code})`.trim());
                    setOpenSuggest({ field: null, index: null });
                };

                const pickSingleTo = (item) => {
                    const code = (item.iata || item.icao || "").toUpperCase();
                    setFieldValue("to", code);
                    setToText(`${item.city || ""} - ${item.name} (${code})`.trim());
                    setOpenSuggest({ field: null, index: null });
                };

                const pickMulti = (index, which, item) => {
                    const code = (item.iata || item.icao || "").toUpperCase();
                    updateSegment(index, which === "from" ? "from" : "to", code);

                    setMultiText((prev) => {
                        const copy = [...prev];
                        const row = copy[index] || { fromText: "", toText: "" };

                        const label = `${item.city || ""} - ${item.name} (${code})`.trim();

                        copy[index] =
                            which === "from"
                                ? { ...row, fromText: label }
                                : { ...row, toText: label };

                        return copy;
                    });

                    setOpenSuggest({ field: null, index: null });
                };

                return (
                    <div className="w-full">
                        {/* Error */}
                        {error?.error && (
                            <div className="mb-3 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
                                {error?.error} {error?.message ? `- ${error.message}` : ""}
                            </div>
                        )}

                        {/* Tabs */}
                        <div className="flex gap-6 mb-3 text-sm">
                            <span
                                onClick={() => setTripType("round")}
                                className={`cursor-pointer ${values.tripType === "round"
                                    ? "font-bold text-black"
                                    : "text-gray-500"
                                    }`}
                            >
                                ROUND TRIP
                            </span>

                            <span
                                onClick={() => setTripType("oneway")}
                                className={`cursor-pointer ${values.tripType === "oneway"
                                    ? "font-bold text-black"
                                    : "text-gray-500"
                                    }`}
                            >
                                ONE WAY
                            </span>

                            <span
                                onClick={() => setTripType("multi")}
                                className={`cursor-pointer ${values.tripType === "multi"
                                    ? "font-bold text-black"
                                    : "text-gray-500"
                                    }`}
                            >
                                MULTI CITY
                            </span>
                        </div>

                        <Form className="w-full">
                            {/* SINGLE */}
                            {!isMulti && (
                                <div className="flex w-full gap-3 items-stretch mb-2">
                                    {/* FROM + TO */}
                                    <div className="relative z-[60] flex items-stretch w-[50%] gap-3 min-w-0">
                                        {/* FROM */}
                                        <div
                                            className={`${fieldShell} w-1/2 min-w-0 relative overflow-visible z-[70]`}
                                            ref={fromRef}
                                        >
                                            <div className="bg-blue-500 flex items-center justify-center w-12 shrink-0 rounded-l-lg">
                                                <img src={pic} alt="Plane" className="w-6 h-6" />
                                            </div>

                                            <div className="flex-1 px-4 flex flex-col justify-center min-w-0">
                                                <span className="font-bold text-lg leading-tight">
                                                    {values.from || ""}
                                                </span>

                                                {/* INPUT */}
                                                <input
                                                    value={fromText}
                                                    onChange={(e) => {
                                                        setFromText(e.target.value);
                                                        setOpenSuggest({ field: "from", index: null });
                                                        // when user types new, clear selected code
                                                        setFieldValue("from", "");
                                                    }}
                                                    onFocus={() =>
                                                        setOpenSuggest({ field: "from", index: null })
                                                    }
                                                    placeholder="From (City or Airport)"
                                                    className="mt-1 text-sm text-gray-600 outline-none bg-transparent"
                                                />
                                            </div>

                                            {/* Suggestions */}
                                            {openSuggest.field === "from" && (
                                                <div className="absolute left-0 top-[105px] w-full bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999] overflow-hidden max-h-[340px] overflow-y-auto">
                                                    {sugLoading && (
                                                        <div className="px-4 py-3 text-sm text-gray-500">
                                                            Loading...
                                                        </div>
                                                    )}

                                                    {!sugLoading && fromSug.length === 0 && (
                                                        <div className="px-4 py-3 text-sm text-gray-500">
                                                            No airports found
                                                        </div>
                                                    )}

                                                    {fromSug.map((item, i) => (
                                                        <SuggestItem
                                                            key={`${item.iata || item.icao || "x"}-${i}`}
                                                            item={item}
                                                            onPick={pickSingleFrom}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* SWAP */}
                                        <div
                                            onClick={swapAirports}
                                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm z-[90] flex items-center justify-center cursor-pointer"
                                            title="Swap"
                                        >
                                            <div className="flex items-center gap-[2px] text-gray-400">
                                                <FiArrowLeft className="text-base" />
                                                <FiArrowRight className="text-base" />
                                            </div>
                                        </div>

                                        {/* TO */}
                                        <div
                                            className={`${fieldShell} w-1/2 min-w-0 relative overflow-visible z-[70]`}
                                            ref={toRef}
                                        >
                                            <div className="flex-1 px-4 flex flex-col justify-center min-w-0">
                                                <span className="font-bold text-lg leading-tight">
                                                    {values.to || ""}
                                                </span>

                                                {/* INPUT */}
                                                <input
                                                    value={toText}
                                                    onChange={(e) => {
                                                        setToText(e.target.value);
                                                        setOpenSuggest({ field: "to", index: null });
                                                        setFieldValue("to", "");
                                                    }}
                                                    onFocus={() =>
                                                        setOpenSuggest({ field: "to", index: null })
                                                    }
                                                    placeholder="To (City or Airport)"
                                                    className="mt-1 text-sm text-gray-600 outline-none bg-transparent"
                                                />
                                            </div>

                                            <div className="bg-blue-500 flex items-center justify-center w-12 shrink-0 rounded-r-lg">
                                                <img src={pic2} alt="Arrival" className="w-9 h-9" />
                                            </div>

                                            {/* Suggestions */}
                                            {openSuggest.field === "to" && (
                                                <div className="absolute left-0 top-[105px] w-full bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999] overflow-hidden max-h-[340px] overflow-y-auto">
                                                    {sugLoading && (
                                                        <div className="px-4 py-3 text-sm text-gray-500">
                                                            Loading...
                                                        </div>
                                                    )}

                                                    {!sugLoading && toSug.length === 0 && (
                                                        <div className="px-4 py-3 text-sm text-gray-500">
                                                            No airports found
                                                        </div>
                                                    )}

                                                    {toSug.map((item, i) => (
                                                        <SuggestItem
                                                            key={`${item.iata || item.icao || "x"}-${i}`}
                                                            item={item}
                                                            onPick={pickSingleTo}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* RIGHT */}
                                    <div className="flex gap-3 w-[50%] min-w-0">
                                        {/* Date */}
                                        <div className="flex-1 relative min-w-0" ref={calendarRef}>
                                            <div
                                                className={`${fieldShell} px-4 cursor-pointer flex flex-col justify-center`}
                                                onClick={() => setOpenCalendar((p) => !p)}
                                            >
                                                <span className="font-bold text-lg">
                                                    {isRoundTrip ? "Date Range" : "Select Date"}
                                                </span>
                                                <p className="text-gray-400 text-sm mt-1">
                                                    {isRoundTrip
                                                        ? "Departure - Return Date"
                                                        : "Departure Date"}
                                                </p>

                                                <p className="text-gray-500 text-sm mt-1 truncate">
                                                    {isRoundTrip ? (
                                                        displayFrom || displayTo ? (
                                                            <>
                                                                {displayFrom}{" "}
                                                                {displayFrom && displayTo ? "→" : ""}{" "}
                                                                {displayTo}
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
                                                                setFieldValue("date", format(start, "yyyy-MM-dd"));
                                                                setFieldValue(
                                                                    "returnDate",
                                                                    format(end, "yyyy-MM-dd")
                                                                );
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
                                                            date={
                                                                values.date ? new Date(values.date) : new Date()
                                                            }
                                                            onChange={(d) =>
                                                                setFieldValue("date", format(d, "yyyy-MM-dd"))
                                                            }
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

                                        {/* Adults + Class */}
                                        <div className="flex-1 relative min-w-0" ref={travelerRef}>
                                            <div
                                                className={`${fieldShell} px-4 cursor-pointer flex flex-col justify-center`}
                                                onClick={() => setShowTraveler((p) => !p)}
                                            >
                                                <span className="font-bold text-lg">Adults and class</span>
                                                <p className="text-gray-500 text-sm mt-1 truncate">
                                                    {values.adults} Adults - {values.travelClass}
                                                </p>
                                            </div>

                                            {showTraveler && (
                                                <div className="absolute top-[110px] left-0 w-full bg-white border border-gray-300 rounded-lg p-3 shadow-xl z-50">
                                                    <p className="font-semibold mb-2">Adults</p>
                                                    <div className="flex gap-2 mb-3 flex-wrap">
                                                        {[1, 2, 3, 4].map((num) => (
                                                            <button
                                                                type="button"
                                                                key={num}
                                                                onClick={() => setFieldValue("adults", num)}
                                                                className={`px-3 py-1 border rounded ${values.adults === num
                                                                    ? "bg-blue-500 text-white"
                                                                    : ""
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
                                                                className={`px-3 py-1 border rounded ${values.travelClass === cls
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
                                        <div className="w-[100px] min-w-[100px]">
                                            <PrimaryBtn
                                                type="submit"
                                                disabled={loading}
                                                className={`w-full h-[100px] text-white font-bold rounded-lg text-3xl flex items-center justify-center ${loading
                                                    ? "bg-blue-400"
                                                    : "bg-blue-600 hover:bg-blue-700"
                                                    }`}
                                            >
                                                {loading ? "..." : <CiSearch />}
                                            </PrimaryBtn>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* MULTI */}
                            {isMulti && (
                                <div className="flex flex-col gap-3">
                                    {values.segments.map((seg, index) => (
                                        <div
                                            key={suggestedKey(seg, index)}
                                            className="flex items-center gap-2 relative w-full"
                                        >
                                            {/* Left */}
                                            <div className="flex flex-1 w-[70%] gap-2 min-w-0">
                                                {/* From */}
                                                <div className="flex border border-gray-300 rounded-lg flex-1 h-20 overflow-visible min-w-0 relative">
                                                    <div className="bg-blue-500 flex items-center justify-center h-full w-12 shrink-0">
                                                        <img src={pic} alt="Plane" className="w-6 h-6" />
                                                    </div>

                                                    <div className="flex-1 p-3 flex flex-col justify-center min-w-0">
                                                        <span className="font-bold text-lg">{seg.from || ""}</span>

                                                        <input
                                                            value={multiText?.[index]?.fromText || ""}
                                                            onChange={(e) => {
                                                                const v = e.target.value;
                                                                setMultiText((prev) => {
                                                                    const copy = [...prev];
                                                                    const row = copy[index] || { fromText: "", toText: "" };
                                                                    copy[index] = { ...row, fromText: v };
                                                                    return copy;
                                                                });
                                                                setOpenSuggest({ field: "mfrom", index });
                                                                updateSegment(index, "from", "");
                                                            }}
                                                            onFocus={() => setOpenSuggest({ field: "mfrom", index })}
                                                            placeholder="From (City or Airport)"
                                                            className="mt-1 text-sm text-gray-600 outline-none bg-transparent"
                                                        />
                                                    </div>

                                                    {/* Multi From Suggestions */}
                                                    {openSuggest.field === "mfrom" && openSuggest.index === index && (
                                                        <div className="absolute left-0 top-[85px] w-full bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999] overflow-hidden max-h-[320px] overflow-y-auto">
                                                            {sugLoading && (
                                                                <div className="px-4 py-3 text-sm text-gray-500">
                                                                    Loading...
                                                                </div>
                                                            )}

                                                            {!sugLoading && multiSug.length === 0 && (
                                                                <div className="px-4 py-3 text-sm text-gray-500">
                                                                    No airports found
                                                                </div>
                                                            )}

                                                            {multiSug.map((item, i) => (
                                                                <SuggestItem
                                                                    key={`${item.iata || item.icao || "x"}-${i}`}
                                                                    item={item}
                                                                    onPick={(it) => pickMulti(index, "from", it)}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
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
                                                <div className="flex items-center border border-gray-300 rounded-lg flex-1 h-20 overflow-visible min-w-0 relative">
                                                    <div className="flex-1 p-3 flex flex-col justify-center min-w-0">
                                                        <span className="font-bold text-lg">{seg.to || ""}</span>

                                                        <input
                                                            value={multiText?.[index]?.toText || ""}
                                                            onChange={(e) => {
                                                                const v = e.target.value;
                                                                setMultiText((prev) => {
                                                                    const copy = [...prev];
                                                                    const row = copy[index] || { fromText: "", toText: "" };
                                                                    copy[index] = { ...row, toText: v };
                                                                    return copy;
                                                                });
                                                                setOpenSuggest({ field: "mto", index });
                                                                updateSegment(index, "to", "");
                                                            }}
                                                            onFocus={() => setOpenSuggest({ field: "mto", index })}
                                                            placeholder="To (City or Airport)"
                                                            className="mt-1 text-sm text-gray-600 outline-none bg-transparent"
                                                        />
                                                    </div>

                                                    <div className="bg-blue-500 flex items-center justify-center h-full w-12 shrink-0">
                                                        <img src={pic2} alt="Arrival" className="w-6 h-6" />
                                                    </div>

                                                    {/* Multi To Suggestions */}
                                                    {openSuggest.field === "mto" && openSuggest.index === index && (
                                                        <div className="absolute left-0 top-[85px] w-full bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999] overflow-hidden max-h-[320px] overflow-y-auto">
                                                            {sugLoading && (
                                                                <div className="px-4 py-3 text-sm text-gray-500">
                                                                    Loading...
                                                                </div>
                                                            )}

                                                            {!sugLoading && multiSug.length === 0 && (
                                                                <div className="px-4 py-3 text-sm text-gray-500">
                                                                    No airports found
                                                                </div>
                                                            )}

                                                            {multiSug.map((item, i) => (
                                                                <SuggestItem
                                                                    key={`${item.iata || item.icao || "x"}-${i}`}
                                                                    item={item}
                                                                    onPick={(it) => pickMulti(index, "to", it)}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right */}
                                            <div className="flex items-center gap-2 ml-4 w-[30%] justify-end">
                                                <div className="flex-1 border border-gray-300 rounded-lg p-3 relative h-20 flex flex-col justify-center">
                                                    <span className="font-bold text-lg">Select Date</span>

                                                    <p
                                                        className={`text-sm mt-1 cursor-pointer ${seg.date ? "text-gray-600" : "text-gray-400"
                                                            }`}
                                                        onClick={() => setOpenMultiCalIndex(index)}
                                                    >
                                                        {seg.date
                                                            ? format(new Date(seg.date), "dd MMM yyyy")
                                                            : "Departure Date"}
                                                    </p>

                                                    {openMultiCalIndex === index && (
                                                        <div
                                                            ref={multiCalendarRef}
                                                            className="absolute top-[85px] right-0 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 p-3"
                                                        >
                                                            <Calendar
                                                                date={seg.date ? new Date(seg.date) : new Date()}
                                                                onChange={(d) =>
                                                                    updateSegment(index, "date", format(d, "yyyy-MM-dd"))
                                                                }
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

                                                {/* Remove 3rd+ */}
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

                                        {/* Adults & Search */}
                                        <div className="flex gap-3 items-center w-[40%] justify-end">
                                            <div
                                                className="border border-gray-300 rounded-lg p-3 relative flex-1"
                                                ref={travelerRef}
                                            >
                                                <span className="font-bold text-lg">Adults and class</span>
                                                <p
                                                    className="text-gray-500 text-sm mt-1 cursor-pointer"
                                                    onClick={() => setShowTraveler((p) => !p)}
                                                >
                                                    {values.adults} Adults - {values.travelClass}
                                                </p>

                                                {showTraveler && (
                                                    <div className="absolute top-full right-0 w-full bg-white border border-gray-300 rounded-lg mt-2 p-3 shadow-xl z-50">
                                                        <p className="font-semibold mb-2">Adults</p>
                                                        <div className="flex gap-2 mb-3 flex-wrap">
                                                            {[1, 2, 3, 4].map((num) => (
                                                                <button
                                                                    type="button"
                                                                    key={num}
                                                                    onClick={() => setFieldValue("adults", num)}
                                                                    className={`px-3 py-1 border rounded ${values.adults === num
                                                                        ? "bg-blue-500 text-white"
                                                                        : ""
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
                                                                    className={`px-3 py-1 border rounded ${values.travelClass === cls
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

                                            <div className="w-[100px] min-w-[100px]">
                                                <PrimaryBtn
                                                    type="submit"
                                                    disabled={loading}
                                                    className={`w-full h-[80px] text-white font-bold rounded-lg text-3xl flex items-center justify-center ${loading
                                                        ? "bg-blue-400"
                                                        : "bg-blue-600 hover:bg-blue-700"
                                                        }`}
                                                >
                                                    {loading ? "..." : <CiSearch />}
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

function suggestedKey(seg, index) {
    return `${index}-${seg.from}-${seg.to}-${seg.date}`;
}

export default FlightSearch;
