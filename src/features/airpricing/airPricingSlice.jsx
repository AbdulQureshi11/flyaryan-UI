import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { baseURL } from "../../utlis/baseUrl";


export const asyncAirPricing = createAsyncThunk(
    "airPricing/price",
    async (payload, { rejectWithValue }) => {
        try {
            const body = payload || {};

            // Basic validation (frontend side)
            if (!body.selectedFlight || !Array.isArray(body.selectedFlight.segments)) {
                return rejectWithValue({
                    success: false,
                    error: "Missing selectedFlight or segments",
                });
            }

            // Default passengers if not provided
            const passengers =
                Array.isArray(body.passengers) && body.passengers.length > 0
                    ? body.passengers
                    : [{ type: "ADT", quantity: 1 }];

            const requestBody = {
                selectedFlight: body.selectedFlight,
                passengers,
                allFlights: Array.isArray(body.allFlights) ? body.allFlights : [],
                searchContext: body.searchContext || null,
            };

            const res = await axios.post(`${baseURL}/api/air-pricing`, requestBody);
            return res.data;
        } catch (error) {
            // Handle 409 (000276) properly (backend sends useful JSON)
            if (error?.response?.status === 409) {
                return rejectWithValue(error.response.data);
            }

            return rejectWithValue(
                error?.response?.data || {
                    success: false,
                    error: "Pricing failed",
                    message: error?.message || "Unknown error",
                }
            );
        }
    }
);

const initialState = {
    loading: false,
    error: null,

    // backend success response
    pricing: null,
    pricedFlight: null,

    // special fallback case
    suggestedFlight: null,
    errorCode: null,

    // optional helper flag so UI can show "fare refreshed"
    success: false,
};

export const airPricingSlice = createSlice({
    name: "airPricing",
    initialState,
    reducers: {
        clearAirPricing: (state) => {
            state.loading = false;
            state.error = null;
            state.pricing = null;
            state.pricedFlight = null;
            state.suggestedFlight = null;
            state.errorCode = null;
            state.success = false;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(asyncAirPricing.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.pricing = null;
            state.pricedFlight = null;
            state.suggestedFlight = null;
            state.errorCode = null;
            state.success = false;
        });

        builder.addCase(asyncAirPricing.fulfilled, (state, action) => {
            state.loading = false;
            state.error = null;

            const data = action.payload;

            state.success = !!data?.success;

            // backend returns both:
            //  - flight (enriched)
            //  - pricing (clean numeric)
            state.pricing = data?.pricing || null;
            state.pricedFlight = data?.flight || null;

            state.suggestedFlight = null;
            state.errorCode = null;
        });

        builder.addCase(asyncAirPricing.rejected, (state, action) => {
            state.loading = false;

            const err = action.payload || { success: false, error: "Pricing failed" };

            // If 000276 comes, backend gives:
            // { success:false, errorCode:"000276", suggestedFlight, message }
            state.error = err;
            state.success = false;

            state.errorCode = err?.errorCode || null;
            state.suggestedFlight = err?.suggestedFlight || null;

            state.pricing = null;
            state.pricedFlight = null;
        });
    },
});

export const { clearAirPricing } = airPricingSlice.actions;
export default airPricingSlice.reducer;
