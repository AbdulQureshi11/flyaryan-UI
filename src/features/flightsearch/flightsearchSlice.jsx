import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { baseURL } from "../../utlis/baseUrl";

// ---------- helpers for multi-date ----------
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

// normalize payload for backend
const normalizeForBackend = (p) => {
    const payload = { ...(p || {}) };

    // backend expects travelers object
    if (!payload.travelers) {
        const adults = Number(payload.adults ?? payload?.travelers?.adults ?? 1);
        payload.travelers = {
            adults,
            child: Number(payload.child ?? 0),
            infant: Number(payload.infant ?? 0),
        };
    }

    if (!payload.travelClass) payload.travelClass = "Economy";

    // normalize tripType
    if (payload.tripType === "roundtrip") payload.tripType = "round";
    if (payload.tripType === "multicity") payload.tripType = "multi";

    // uppercase
    if (payload.from) payload.from = String(payload.from).toUpperCase();
    if (payload.to) payload.to = String(payload.to).toUpperCase();

    if (Array.isArray(payload.segments)) {
        payload.segments = payload.segments.map((s) => ({
            ...s,
            from: s?.from ? String(s.from).toUpperCase() : s?.from,
            to: s?.to ? String(s.to).toUpperCase() : s?.to,
        }));
    }

    // remove top-level pax fields
    delete payload.adults;
    delete payload.child;
    delete payload.infant;

    return payload;
};

export const asyncSearchFlights = createAsyncThunk(
    "flightSearch/search",
    async (payload, { rejectWithValue }) => {
        try {
            const body = normalizeForBackend(payload);

            // Prepare main search promise
            const mainPromise = axios.post(`${baseURL}/api/search`, body);

            // Prepare multi-date promises
            const nextDatesCount = 6;
            const tripType = body.tripType || "oneway";
            const from = body.from;
            const to = body.to;
            const depDate = body.date;
            const retDate = body.returnDate;
            const travelers = body.travelers;
            const travelClass = body.travelClass;

            const datePairs = [];
            for (let i = 0; i <= nextDatesCount; i++) {
                if (tripType === "round" && retDate) {
                    datePairs.push({ dep: addDays(depDate, i), ret: addDays(retDate, i) });
                } else {
                    datePairs.push({ dep: addDays(depDate, i) });
                }
            }

            const multiDatePromises = datePairs.map(async (pair) => {
                const key = pair.ret ? `${pair.dep}|${pair.ret}` : pair.dep;
                const title = pair.ret
                    ? `${formatDayMonth(pair.dep)} - ${formatDayMonth(pair.ret)}`
                    : `${formatDayMonth(pair.dep)}`;

                try {
                    const reqBody = tripType === "round" && pair.ret
                        ? { tripType: "round", from, to, date: pair.dep, returnDate: pair.ret, travelers, travelClass }
                        : { tripType: "oneway", from, to, date: pair.dep, travelers, travelClass };

                    const res = await axios.post(`${baseURL}/api/search`, normalizeForBackend(reqBody));
                    const json = res.data;
                    const flightsArr = pickFlightsArray(json);
                    const cheapest = getCheapestFromFlights(flightsArr);

                    return { key, title, cheapest };
                } catch (e) {
                    return { key, title, cheapest: null };
                }
            });

            // Run main and multi-date in parallel
            const [mainRes, multiDatePrices] = await Promise.all([
                mainPromise,
                Promise.all(multiDatePromises)
            ]);

            const data = mainRes.data;

            return { ...data, multiDatePrices };
        } catch (error) {
            return rejectWithValue(
                error?.response?.data || { error: "Flight search failed" }
            );
        }
    }
);

const initialState = {
    criteria: {
        tripType: "oneway",
        from: "",
        to: "",
        date: "",
        returnDate: "",
        segments: [],
        travelers: { adults: 1, child: 0, infant: 0 },
        travelClass: "Economy",
    },

    flights: [],
    totalResults: 0,

    // new: for details page
    selectedFlight: null,

    // new: for multi-date prices
    multiDatePrices: [],

    loading: false,
    error: null,
};

export const flightSearchSlice = createSlice({
    name: "flightSearch",
    initialState,
    reducers: {
        setSearchCriteria: (state, action) => {
            state.criteria = { ...state.criteria, ...action.payload };
        },
        clearSearchResults: (state) => {
            state.flights = [];
            state.totalResults = 0;
            state.multiDatePrices = [];
            state.error = null;
            state.loading = false;
        },

        // new
        setSelectedFlight: (state, action) => {
            state.selectedFlight = action.payload || null;
        },
        clearSelectedFlight: (state) => {
            state.selectedFlight = null;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(asyncSearchFlights.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.multiDatePrices = []; // clear previous
        });

        builder.addCase(asyncSearchFlights.fulfilled, (state, action) => {
            state.loading = false;
            const data = action.payload;

            state.flights = data?.flights || [];
            state.totalResults = data?.totalResults || 0;

            // store multi-date prices
            state.multiDatePrices = data?.multiDatePrices || [];

            // criteria store
            state.criteria.tripType = data?.tripType || state.criteria.tripType;
            state.criteria.travelers = data?.travelers || state.criteria.travelers;
            state.criteria.travelClass = data?.travelClass || state.criteria.travelClass;

            if (data?.from) state.criteria.from = data.from;
            if (data?.to) state.criteria.to = data.to;
            if (data?.date) state.criteria.date = data.date;
            if (data?.returnDate) state.criteria.returnDate = data.returnDate;
            if (data?.segments) state.criteria.segments = data.segments;
        });

        builder.addCase(asyncSearchFlights.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || { error: "Something went wrong" };
        });
    },
});

export const {
    setSearchCriteria,
    clearSearchResults,
    setSelectedFlight,
    clearSelectedFlight,
} = flightSearchSlice.actions;

export default flightSearchSlice.reducer;