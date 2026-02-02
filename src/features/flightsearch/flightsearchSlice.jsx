import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { baseURL } from "../../utlis/baseUrl";

// helper: avoid // in URL
const joinUrl = (base, path) => {
    const b = String(base || "").replace(/\/+$/, "");
    const p = String(path || "").replace(/^\/+/, "");
    return `${b}/${p}`;
};

// normalize payload for backend
const normalizeForBackend = (p) => {
    const payload = { ...(p || {}) };

    // if frontend sends adults, but backend expects travelers object
    if (!payload.travelers) {
        const adults = Number(payload.adults ?? payload?.travelers?.adults ?? 1);
        payload.travelers = {
            adults,
            child: Number(payload.child ?? 0),
            infant: Number(payload.infant ?? 0),
        };
    }

    // keep travelClass default
    if (!payload.travelClass) payload.travelClass = "Economy";

    // normalize tripType values (just in case)
    if (payload.tripType === "roundtrip") payload.tripType = "round";
    if (payload.tripType === "multicity") payload.tripType = "multi";

    // uppercase airport codes
    if (payload.from) payload.from = String(payload.from).toUpperCase();
    if (payload.to) payload.to = String(payload.to).toUpperCase();

    if (Array.isArray(payload.segments)) {
        payload.segments = payload.segments.map((s) => ({
            ...s,
            from: s?.from ? String(s.from).toUpperCase() : s?.from,
            to: s?.to ? String(s.to).toUpperCase() : s?.to,
        }));
    }

    // IMPORTANT: backend may not expect top-level adults, child, infant
    // (it destructures travelers). So remove them to avoid confusion.
    delete payload.adults;
    delete payload.child;
    delete payload.infant;

    return payload;
};

// Flight Search API Call (NO extra mapping)
export const asyncSearchFlights = createAsyncThunk(
    "flightSearch/search",
    async (payloadFromUI, { rejectWithValue }) => {
        try {
            const payload = normalizeForBackend(payloadFromUI);

            // debug (optional)
            console.log("FINAL PAYLOAD SENT =>", payload);

            const url = joinUrl(baseURL, "/api/search");
            const res = await axios.post(url, payload);
            return res?.data;
        } catch (error) {
            // show real error
            console.log("API ERROR =>", error?.response?.data || error?.message);
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
            state.error = null;
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(asyncSearchFlights.pending, (state) => {
            state.loading = true;
            state.error = null;
        });

        builder.addCase(asyncSearchFlights.fulfilled, (state, action) => {
            state.loading = false;
            const data = action.payload;

            state.flights = data?.flights || [];
            state.totalResults = data?.totalResults || 0;

            // store backend-confirmed criteria if provided
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

export const { setSearchCriteria, clearSearchResults } = flightSearchSlice.actions;
export default flightSearchSlice.reducer;
