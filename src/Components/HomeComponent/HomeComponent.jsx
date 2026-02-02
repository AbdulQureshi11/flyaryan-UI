import React from 'react';
import Banner from '../../Common/Banner.jsx';
import Superairline from './Superairline.jsx';
import Popular from './Popular.jsx';
import Hotdeals from './Hotdeals.jsx';
import Clients from './Clients.jsx';
import FlightSearch from './FlightSearch.jsx';

const HomeComponent = () => {
  return (
    <div className="relative ">
      {/* Banner */}
      <Banner />

      {/* Form pulled up over Banner using negative margin */}
      <div className="-mt-68 relative z-40 w-[87%] mx-auto">
        <div className="bg-white rounded-xl pt-5 pb-1 px-6 shadow-[0_0_15px_0_rgba(0,0,0,0.5)]">
          <FlightSearch />

        </div>
      </div>

      {/* Other sections */}
      <Superairline />
      <Popular />
      <Hotdeals />
      <Clients />
    </div>
  );
};

export default HomeComponent;
