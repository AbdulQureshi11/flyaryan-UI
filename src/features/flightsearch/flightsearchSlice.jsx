import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { baseURL } from "../../utlis/baseUrl";

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
            const res = await axios.post(`${baseURL}/api/search`, body);
            return res.data;
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

    // ✅ new: for details page
    selectedFlight: null,

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

        // ✅ new
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
        });

        builder.addCase(asyncSearchFlights.fulfilled, (state, action) => {
            state.loading = false;
            const data = action.payload;

            state.flights = data?.flights || [];
            state.totalResults = data?.totalResults || 0;

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
