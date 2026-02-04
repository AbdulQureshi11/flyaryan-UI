// src/redux/slices/bookingSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { baseURL } from "../../utlis/baseUrl";

// ---------- helpers ----------
const safeUpper = (v) => (v ? String(v).toUpperCase() : v);

// booking payload normalize for backend
const normalizeBookingForBackend = (p) => {
    const payload = { ...(p || {}) };

    // selectedFlight is required + must include travelportData
    if (!payload.selectedFlight) payload.selectedFlight = null;

    // passengers array
    if (!Array.isArray(payload.passengers)) payload.passengers = [];

    // contactInfo object
    if (!payload.contactInfo) {
        payload.contactInfo = { email: "", phone: "" };
    } else {
        payload.contactInfo = {
            email: payload.contactInfo.email || "",
            phone: payload.contactInfo.phone || "",
        };
    }

    // formOfPayment optional (backend can handle)
    if (!payload.formOfPayment) payload.formOfPayment = null;

    // normalize passenger fields a bit (optional)
    payload.passengers = payload.passengers.map((x) => ({
        ...x,
        type: x?.type ? String(x.type).toUpperCase() : x?.type, // ADT/CNN/INF
        gender: x?.gender ? String(x.gender).toUpperCase() : x?.gender,
        nationality: x?.nationality ? safeUpper(x.nationality) : x?.nationality,
    }));

    return payload;
};

// ---------- THUNKS ----------

// 1) Validate Passengers
export const asyncValidatePassengers = createAsyncThunk(
    "booking/validatePassengers",
    async (payload, { rejectWithValue }) => {
        try {
            const passengers = Array.isArray(payload?.passengers)
                ? payload.passengers
                : [];

            const res = await axios.post(`${baseURL}/api/validate-passengers`, {
                passengers,
            });

            return res.data; // { valid:true, message } OR backend may return something else
        } catch (error) {
            return rejectWithValue(
                error?.response?.data || { errors: ["Passenger validation failed"] }
            );
        }
    }
);

// 2) Create Booking (PNR generate)
export const asyncCreateBooking = createAsyncThunk(
    "booking/createBooking",
    async (payload, { rejectWithValue }) => {
        try {
            const body = normalizeBookingForBackend(payload);

            const res = await axios.post(`${baseURL}/api/bookings`, body);

            // expected backend response:
            // { success, bookingId, pnr, airlineConfirmation, status, ticketingDeadline, details }
            return res.data;
        } catch (error) {
            return rejectWithValue(
                error?.response?.data || { error: "Booking failed" }
            );
        }
    }
);

const initialState = {
    // form state (you will bind in booking form)
    form: {
        passengers: [],
        contactInfo: { email: "", phone: "" },
        formOfPayment: null,
    },

    // selectedFlight should come from flightSearchSlice.selectedFlight
    // but keeping here also if you want to store locally
    selectedFlight: null,

    // validate
    validating: false,
    validationResult: null, // { valid:true } OR null
    validationErrors: [],

    // booking
    bookingLoading: false,
    bookingError: null,

    // booking success data
    booking: null, // full response
    pnr: null,
    bookingId: null,
    status: null,
    ticketingDeadline: null,
};

export const bookingSlice = createSlice({
    name: "booking",
    initialState,
    reducers: {
        setBookingSelectedFlight: (state, action) => {
            state.selectedFlight = action.payload || null;
        },

        setBookingForm: (state, action) => {
            state.form = { ...state.form, ...(action.payload || {}) };
        },

        setPassengers: (state, action) => {
            state.form.passengers = Array.isArray(action.payload)
                ? action.payload
                : [];
        },

        setContactInfo: (state, action) => {
            state.form.contactInfo = {
                ...state.form.contactInfo,
                ...(action.payload || {}),
            };
        },

        setFormOfPayment: (state, action) => {
            state.form.formOfPayment = action.payload ?? null;
        },

        clearBookingState: (state) => {
            state.validating = false;
            state.validationResult = null;
            state.validationErrors = [];

            state.bookingLoading = false;
            state.bookingError = null;

            state.booking = null;
            state.pnr = null;
            state.bookingId = null;
            state.status = null;
            state.ticketingDeadline = null;
        },
    },

    extraReducers: (builder) => {
        // ---------- validate passengers ----------
        builder.addCase(asyncValidatePassengers.pending, (state) => {
            state.validating = true;
            state.validationResult = null;
            state.validationErrors = [];
        });

        builder.addCase(asyncValidatePassengers.fulfilled, (state, action) => {
            state.validating = false;

            // backend success: { valid: true, message: "All passengers valid" }
            state.validationResult = action.payload || null;
            state.validationErrors = [];
        });

        builder.addCase(asyncValidatePassengers.rejected, (state, action) => {
            state.validating = false;

            // backend error: { errors: [...] }
            const payload = action.payload || {};
            state.validationResult = null;
            state.validationErrors = Array.isArray(payload?.errors)
                ? payload.errors
                : [payload?.error || "Validation failed"];
        });

        // ---------- create booking ----------
        builder.addCase(asyncCreateBooking.pending, (state) => {
            state.bookingLoading = true;
            state.bookingError = null;

            // clear previous success
            state.booking = null;
            state.pnr = null;
            state.bookingId = null;
            state.status = null;
            state.ticketingDeadline = null;
        });

        builder.addCase(asyncCreateBooking.fulfilled, (state, action) => {
            state.bookingLoading = false;

            const data = action.payload || null;
            state.booking = data;

            state.pnr = data?.pnr || null;
            state.bookingId = data?.bookingId || null;
            state.status = data?.status || null;
            state.ticketingDeadline = data?.ticketingDeadline || null;
        });

        builder.addCase(asyncCreateBooking.rejected, (state, action) => {
            state.bookingLoading = false;
            state.bookingError = action.payload || { error: "Booking failed" };
        });
    },
});

export const {
    setBookingSelectedFlight,
    setBookingForm,
    setPassengers,
    setContactInfo,
    setFormOfPayment,
    clearBookingState,
} = bookingSlice.actions;

export default bookingSlice.reducer;
