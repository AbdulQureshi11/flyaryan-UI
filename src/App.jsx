import React from 'react'
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

import Home from "./Pages/Home";
import Navigation from './Pages/Navigation/Navigation';
import Career from './Pages/Career';
import Grouptickets from './Pages/Grouptickets';
import Cheapflights from './Pages/Cheapflights';
import About from './Pages/About';
import Contactus from './Pages/Contactus';
import RoundtripDetails from './Pages/RoundtripDetails';
import OnewayDetails from './Pages/OnewayDetails';
import Flightdetailpage from './Pages/Flightdetailpage';
const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Navigation />}>
        <Route index element={<Home />} />
        <Route path="career" element={<Career />} />
        <Route path="grouptickets" element={<Grouptickets />} />
        <Route path="cheapflights" element={<Cheapflights />} />
        <Route path="about" element={<About />} />
        <Route path="contact-us" element={<Contactus />} />
        <Route path="roundtrip-details" element={<RoundtripDetails />} />
        <Route path="flight-detail" element={<Flightdetailpage />} />

    <Route path="oneway-details" element={<OnewayDetails />} />
        

      </Route>
    )
  );

  return <RouterProvider router={router} />;
};

export default App;
