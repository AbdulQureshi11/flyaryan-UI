import { configureStore } from '@reduxjs/toolkit'
import counterReducer from '../features/counter/counterSlice'
import flightSearchReducer from '../features/flightsearch/flightsearchSlice'

export default configureStore({
    reducer: {
        counter: counterReducer,
        flightSearch: flightSearchReducer,
    },
})