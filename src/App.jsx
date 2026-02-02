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
import OnewayDetails from './Pages/OnewayDetails';
import Flightdetailpage from './Pages/Flightdetailpage';
import Flightlisting from './Pages/Flightlisting';
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
        <Route path="flight-detail" element={<Flightdetailpage />} />
        <Route path="flight-listing" element={<Flightlisting />} />

        <Route path="oneway-details" element={<OnewayDetails />} />


      </Route>
    )
  );

  return <RouterProvider router={router} />;
};

export default App;
