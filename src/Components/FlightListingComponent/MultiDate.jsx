import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { baseURL } from "../../utlis/baseUrl";
import { asyncSearchFlights } from "../../features/flightsearch/flightsearchSlice";

// ---------- helpers ----------
const pad2 = (n) => String(n).padStart(2, "0");

const toISODate = (d) =>
    `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

const addDays = (isoDate, days) => {
    if (!isoDate) return "";
    const d = new Date(isoDate + "T00:00:00");
    if (Number.isNaN(d.getTime())) return "";
    d.setDate(d.getDate() + days);
    return toISODate(d);
};

const formatDayMonth = (iso) => {
    if (!iso) return "--";
    const d = new Date(iso + "T00:00:00");
    if (Number.isNaN(d.getTime())) return "--";
    return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(d);
};

const moneyPKR = (n) => {
    if (n === null || n === undefined) return "PKR --";
    const num = Number(n);
    if (!Number.isFinite(num) || num <= 0) return "PKR --";
    return `PKR ${num.toLocaleString()}`;
};

const pickISODateFromDT = (dt) => {
    if (!dt) return "";
    const s = String(dt);
    if (s.length >= 10) return s.slice(0, 10);
    return "";
};

// normalize payload for backend (same logic as slice)
const normalizeForBackend = (p) => {
    const payload = { ...(p || {}) };

    if (!payload.travelers) {
        const adults = Number(payload.adults ?? payload?.travelers?.adults ?? 1);
        payload.travelers = {
            adults,
            child: Number(payload.child ?? 0),
            infant: Number(payload.infant ?? 0),
        };
    }

    if (!payload.travelClass) payload.travelClass = "Economy";

    if (payload.tripType === "roundtrip") payload.tripType = "round";
    if (payload.tripType === "multicity") payload.tripType = "multi";

    if (payload.from) payload.from = String(payload.from).toUpperCase();
    if (payload.to) payload.to = String(payload.to).toUpperCase();

    if (Array.isArray(payload.segments)) {
        payload.segments = payload.segments.map((s) => ({
            ...s,
            from: s?.from ? String(s.from).toUpperCase() : s?.from,
            to: s?.to ? String(s.to).toUpperCase() : s?.to,
        }));
    }

    delete payload.adults;
    delete payload.child;
    delete payload.infant;

    return payload;
};

const extractPrice = (f) => {
    const candidates = [
        f?.displayPrice,
        f?.totalPrice,
        f?.price,
        f?.total,
        f?.pricing?.totalPrice,
        f?.pricing?.grandTotal,
        f?.pricing?.displayPrice,
    ];

    for (const c of candidates) {
        if (typeof c === "string") {
            const m = c.replace(/,/g, "").match(/(\d+(\.\d+)?)/);
            if (m?.[1]) {
                const n = Number(m[1]);
                if (Number.isFinite(n) && n > 0) return n;
            }
            continue;
        }

        const n = Number(c);
        if (Number.isFinite(n) && n > 0) return n;
    }
    return null;
};

const getCheapestFromFlights = (flightsArr) => {
    if (!Array.isArray(flightsArr) || flightsArr.length === 0) return null;

    let min = Infinity;
    for (const f of flightsArr) {
        const p = extractPrice(f);
        if (p !== null) min = Math.min(min, p);
    }
    return min === Infinity ? null : min;
};

const pickFlightsArray = (json) => {
    if (Array.isArray(json?.flights)) return json.flights;
    if (Array.isArray(json?.data?.flights)) return json.data.flights;
    if (Array.isArray(json?.result?.flights)) return json.result.flights;
    if (Array.isArray(json?.results)) return json.results;
    if (Array.isArray(json?.data)) return json.data;
    if (Array.isArray(json)) return json;
    if (json && typeof json === "object" && json.id && json.displayPrice) return [json];
    return [];
};

// ---------- component ----------
const MultiDate = ({
    resultsCount = 0,
    nextDatesCount = 6,
    apiUrl = "/api/search",
}) => {
    const dispatch = useDispatch();
    const { flights, totalResults, criteria, multiDatePrices } = useSelector((state) => state.flightSearch);

    const fullApiUrl = `${baseURL}${apiUrl}`;
    const listFlights = Array.isArray(flights) ? flights : [];

    // small in-memory cache so same boxes don't refetch repeatedly
    const cacheRef = useRef(new Map());

    const tripType =
        criteria?.tripType ||
        (criteria?.returnDate ? "round" : "oneway") ||
        "oneway";

    const fromCriteria = criteria?.from || criteria?.origin || criteria?.fromCode;
    const toCriteria = criteria?.to || criteria?.destination || criteria?.toCode;

    const depCriteria =
        criteria?.date ||
        criteria?.departureDate ||
        criteria?.departDate ||
        criteria?.depart ||
        "";

    const retCriteria =
        criteria?.returnDate ||
        criteria?.return ||
        criteria?.return_date ||
        criteria?.inboundDate ||
        "";

    const fallback = useMemo(() => {
        const f0 = listFlights[0];
        if (!f0) return { from: "", to: "", dep: "", ret: "" };

        const segs = Array.isArray(f0?.segments) ? f0.segments : [];
        const outSegs = segs.filter((s) => String(s.group) === "0");
        const inSegs = segs.filter((s) => String(s.group) === "1");

        const outFirst = outSegs[0] || segs[0];
        const outLast = outSegs[outSegs.length - 1] || segs[segs.length - 1];
        const inFirst = inSegs[0] || null;

        return {
            from: outFirst?.from || "",
            to: outLast?.to || outFirst?.to || "",
            dep: pickISODateFromDT(outFirst?.departure),
            ret: pickISODateFromDT(inFirst?.departure),
        };
    }, [listFlights]);

    const from = fromCriteria || fallback.from;
    const to = toCriteria || fallback.to;
    const depDate = depCriteria || fallback.dep;
    const retDate = retCriteria || fallback.ret;

    const canShow = Boolean(from && to && depDate);

    const travelers = criteria?.travelers || { adults: 1, child: 0, infant: 0 };
    const travelClass = criteria?.travelClass || "Economy";

    const datePairs = useMemo(() => {
        if (!canShow) return [];
        const arr = [];
        for (let i = 0; i <= nextDatesCount; i++) {
            if (tripType === "round" && retDate) {
                arr.push({ dep: addDays(depDate, i), ret: addDays(retDate, i) });
            } else {
                arr.push({ dep: addDays(depDate, i) });
            }
        }
        return arr;
    }, [canShow, tripType, depDate, retDate, nextDatesCount]);

    const [loading, setLoading] = useState(false);
    const [boxes, setBoxes] = useState([]);
    const [selectedKey, setSelectedKey] = useState("");

    // If multiDatePrices are available from store, use them
    useEffect(() => {
        if (multiDatePrices.length > 0) {
            setBoxes(multiDatePrices);
            setSelectedKey(multiDatePrices[0]?.key || "");
            setLoading(false);
            return;
        }
    }, [multiDatePrices]);

    // CLICK handler: MultiDate selection -> Dispatch search for that date
    const handleSelectDate = (b) => {
        setSelectedKey(b.key);

        let newDep = "";
        let newRet = "";
        if (b.key.includes("|")) {
            const [d1, d2] = b.key.split("|");
            newDep = d1;
            newRet = d2;
        } else {
            newDep = b.key;
        }

        const payload = {
            tripType: tripType === "round" ? "round" : "oneway",
            from,
            to,
            date: newDep,
            travelers,
            travelClass,
        };

        if (tripType === "round" && newRet) payload.returnDate = newRet;

        dispatch(asyncSearchFlights(payload));
    };

    useEffect(() => {
        // If already have prices from store, skip fetching
        if (multiDatePrices.length > 0) return;

        if (!canShow || datePairs.length === 0) {
            setBoxes([]);
            return;
        }

        let cancelled = false;
        const controller = new AbortController();

        // build a stable cache key
        const cacheKey = JSON.stringify({
            tripType,
            from,
            to,
            depDate,
            retDate,
            nextDatesCount,
            travelers,
            travelClass,
        });

        // if cached, show instantly
        const cached = cacheRef.current.get(cacheKey);
        if (cached?.length) {
            setBoxes(cached);
            setSelectedKey(cached?.[0]?.key || "");
            setLoading(false);
            return () => {
                cancelled = true;
                controller.abort();
            };
        }

        // show loading (but DO NOT progressively update)
        setLoading(true);

        // show skeleton titles (prices as PKR --) so UI doesn't feel blank
        const initial = datePairs.map((pair) => {
            const key = pair.ret ? `${pair.dep}|${pair.ret}` : pair.dep;
            const title = pair.ret
                ? `${formatDayMonth(pair.dep)} - ${formatDayMonth(pair.ret)}`
                : `${formatDayMonth(pair.dep)}`;
            return { key, title, cheapest: null };
        });

        setBoxes(initial);
        setSelectedKey(initial?.[0]?.key || "");

        const reqBody = (pair) => {
            if (tripType === "round" && pair.ret) {
                return {
                    tripType: "round",
                    from,
                    to,
                    date: pair.dep,
                    returnDate: pair.ret,
                    travelers,
                    travelClass,
                };
            }
            return {
                tripType: "oneway",
                from,
                to,
                date: pair.dep,
                travelers,
                travelClass,
            };
        };

        // ONE-SHOT: wait for all, then setBoxes once
        (async () => {
            try {
                const resArr = await Promise.all(
                    datePairs.map(async (pair) => {
                        const key = pair.ret ? `${pair.dep}|${pair.ret}` : pair.dep;
                        const title = pair.ret
                            ? `${formatDayMonth(pair.dep)} - ${formatDayMonth(pair.ret)}`
                            : `${formatDayMonth(pair.dep)}`;

                        try {
                            const res = await fetch(fullApiUrl, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(normalizeForBackend(reqBody(pair))),
                                signal: controller.signal,
                            });

                            const json = await res.json().catch(() => ({}));
                            const flightsArr = pickFlightsArray(json);
                            const cheapest = getCheapestFromFlights(flightsArr);

                            return { key, title, cheapest };
                        } catch (e) {
                            return { key, title, cheapest: null };
                        }
                    })
                );

                if (!cancelled) {
                    setBoxes(resArr);                 // all at once
                    cacheRef.current.set(cacheKey, resArr); // cache it
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
            controller.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canShow, datePairs, apiUrl, tripType, from, to, travelers, travelClass, retDate, depDate, nextDatesCount, multiDatePrices]);

    if (!canShow) return null;

    return (
        <div className="mt-7 mb-10 pl-20 pr-20  border-y border-blue-600">
            <div className="flex items-stretch gap-2 px-3">
                {/* Showing box */}
                <div
                    className="bg-blue-600 text-white px-4 py-4  min-w-[170px] flex flex-col justify-center"
                    style={{
                        clipPath: "polygon(0 0, 100% 0, 80% 100%, 0% 100%)",
                    }}
                >
                    <p className="text-[11px] leading-tight">Total Result</p>
                    <p className="text-[11px] font-bold leading-tight mt-1">
                        {`Showing ${totalResults || resultsCount} Fligths`}
                    </p>
                </div>

                {/* Dates row */}
                <div className="flex-1 overflow-x-auto no-scrollbar relative">
                    <div className="flex flex-nowrap items-center gap-3">
                        {boxes.map((b) => {
                            const isSelected = b.key === selectedKey;

                            return (
                                <button
                                    key={b.key}
                                    type="button"
                                    onClick={() => handleSelectDate(b)}
                                    className={[
                                        "min-w-[120px] px-3 py-2 rounded-md transition-all",
                                        "flex flex-col items-center justify-center text-center", // MAIN FIX
                                        isSelected
                                            ? "bg-white text-blue-600 font-bold h-[70px] shadow-sm"
                                            : "bg-transparent text-black",
                                    ].join(" ")}
                                >
                                    <p className="text-[11px] leading-tight">
                                        {b.title}
                                        {loading ? <span className="text-gray-500"> ...</span> : null}
                                    </p>

                                    <p className="text-[12px] font-bold mt-2 leading-tight">
                                        {moneyPKR(b.cheapest)}
                                    </p>
                                </button>

                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MultiDate;
