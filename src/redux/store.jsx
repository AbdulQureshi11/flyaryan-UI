import { configureStore } from '@reduxjs/toolkit'
import counterReducer from '../features/counter/counterSlice'
import flightSearchReducer from '../features/flightsearch/flightsearchSlice'
import airPricingReducer from '../features/airpricing/airPricingSlice'
import bookingReducer from '../features/booking/BookingSlice'

export default configureStore({
    reducer: {
        counter: counterReducer,
        flightSearch: flightSearchReducer,
        airPricing: airPricingReducer,
        booking: bookingReducer,
    },
})