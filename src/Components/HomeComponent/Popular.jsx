import React from 'react';
import { popularutlis } from '../../utlis/Popularutlis';

const Popular = () => {
  return (
   <div>  
<h1 className="group font-teko text-center text-5xl pb-3 cursor-pointer">
  <span className="text-blue-600 group-hover:drop-shadow-[0_0_12px_black] transition-all duration-300">
    POPULAR
  </span>{" "}
  <span className="text-black group-hover:drop-shadow-[0_0_12px_#2563eb] transition-all duration-300">
    GROUPS
  </span>
</h1>

        
    <div className="px-19 py-7">
      {/* Grid container: 4 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 justify-items-center ">
        {popularutlis.map((items) => (
          <div
            key={items.id}
            className="w-[260px] h-[250px] border-1 p-3 border-gray-300 rounded-lg hover:scale-105 duration-300 box-shadow-lg cursor-pointer"
          >
            <img
              src={items.img}
              alt=""
              className="w-[300px] h-[130px] rounded-lg object-cover"
            />
            <div className="">
              <h1 className="text-gray-400 text-xs pt-2">{items.preheading}</h1>
              <div className='flex justify-between pt-1'>
              <h1 className="font-teko   text-2xl ">{items.heading}</h1>
              <h1 className="font-teko text-2xl text-blue-600">{items.amount}</h1>
              </div>
              <h1 className="text-sm  text-black pt-3">{items.subheading}</h1>
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className='flex justify-center'>
<button className="
  font-teko
  bg-blue-600
  px-12 py-2
  text-white
  rounded
  mt-5
  hover:bg-blue-700
  hover:scale-105
  hover:shadow-lg
  transition-all
  duration-300
  ease-in-out
  
">
    VIEW ALL GROUPS
</button>
</div>
      </div>
  );
};

export default Popular;
