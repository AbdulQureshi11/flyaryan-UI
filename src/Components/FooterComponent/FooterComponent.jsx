import React from "react";
import img from "../../pictures/logo.png";
import { CiLocationOn } from "react-icons/ci";
import { MdAccessTime, MdMailOutline } from "react-icons/md";
import { LuPhoneCall } from "react-icons/lu";
import { links } from "../../Common/links";
import { servicesdata } from "../../Common/Services";
import { NavLink } from "react-router-dom";
import { FaFacebookF } from "react-icons/fa";
import { FaLinkedinIn } from "react-icons/fa";
import { FiYoutube } from "react-icons/fi";
import { FaInstagram } from "react-icons/fa";
import img2 from '../../pictures/f.png'

const FooterComponent = () => {
  const contacts = [
    { icon: <CiLocationOn className="text-3xl font-bold pt-3" />, text: "Office# LG 105, Deans trade center Peshawar Pakistan" },
    { icon: <MdAccessTime className="text-3xl font-bold pt-3" />, text: "MON to SUN 9am to 9pm" },
    { icon: <MdMailOutline className="text-3xl font-bold pt-3" />, text: "info@flyaryan.pk" },
    { icon: <LuPhoneCall className="text-3xl font-bold pt-3" />, text: "+92 152 2456 223" },
  ];

      return (
        <div> 
    <div className="w-full h-[530px] bg-[#2E2E2E] flex">

      {/* LEFT */}
      <div className="w-[34%] pl-22 pt-10 text-white">
        <img src={img} alt="" className="w-[200px]" />
        <h1 className="text-sm pt-8">
          Enjoy unbeatable fares, exclusive benefits, and stress-free journeys tailored just for you.
        </h1>

        <div className="text-xs leading-[50px] pt-8">
          {contacts.map((c, i) => (
            <div key={i} className="flex gap-3">
              {c.icon}
              <span>{c.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* MIDDLE */}
      <div className="w-[33%] flex">

        {/* Quick Links */}
        <div className="w-[50%] pl-16 pt-30">
          <h1 className="font-teko text-3xl text-white">QUICK LINKS</h1>
          {links.map((data) => (
            <NavLink to={data.path} key={data.name}>
            <p
              key={data.name}
              className="text-xs font-semibold pt-8 text-white cursor-pointer hover:text-blue-600"
            >
              {data.name}
            </p>
            </NavLink>
          ))}
        </div>

        {/* Services */}
        <div className="w-[50%] pt-30 pl-13">
          <h1 className="font-teko text-3xl text-white">SERVICES</h1>
          {servicesdata.map((data) => (
            <p
              key={data.id}
              className="text-xs font-semibold pt-8 text-white cursor-pointer hover:text-blue-600"
            >
              {data.name}
            </p>
          ))}
        </div>

      </div>

      {/* RIGHT */}
      <div className="w-[33%] text-white pt-30 px-10">
 <h1 className="font-teko text-3xl">NEWSLETTER</h1>
 <input
  type="email"
  placeholder="Your Email Address"
  className="w-full px-5 py-4 rounded mt-5 bg-[rgba(0,0,0,0.23)] text-[#767373]"
/>
  <button className=" font-teko mt-6 px-6 py-2 bg-blue-600 rounded-xl text-white hover:bg-blue-700">
      SUBSCRIBE NOW 
  </button>

     <div className="flex gap-3 mt-10 text-2xl  ">
  <h1 className="hover:text-blue-600"><FaFacebookF /> </h1>
 <h1 className="hover:text-blue-600"> <FaLinkedinIn /></h1>
<h1 className="hover:text-blue-600"><FiYoutube /></h1>
<h1 className="hover:text-blue-600"><FaInstagram /></h1>
      </div>
    
    <h1 className="font-teko text-xl ml-1 mt-8  ">DOWNLOAD OUR APP </h1>
<img src={img2} alt="" className="w-[280px] pt-1" />


     </div> 


    </div>
      <div>
    <h1 className="bg-black text-center text-white py-5 ">Copyrights © 2026 Fly Aryan. All Rights Reserved</h1>
  </div>
      </div>
  );
};

export default FooterComponent;
