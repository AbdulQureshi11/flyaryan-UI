import React, { useState, useRef, useEffect } from "react";
import logo from "../../pictures/logo (1).png";
import toggler from "../../pictures/toggler (1).svg";
import pakFlag from "../../pictures/pakistan.png";
import uaeFlag from "../../pictures/uae.png";
import usFlag from "../../pictures/us.png";
import { IoIosArrowDown } from "react-icons/io";
import { FaArrowRight } from "react-icons/fa6";
import { IoCloseOutline } from "react-icons/io5";
import { Link } from "react-router-dom";

const HeaderComponent = () => {
  const [selectedCountry, setSelectedCountry] = useState(pakFlag);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const countries = [
    { name: "Pakistan", flag: pakFlag },
    { name: "UAE", flag: uaeFlag },
    { name: "US", flag: usFlag },
  ];

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll when menu is open + ESC to close
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const onKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <header className="flex relative justify-between items-center px-14 py-3 relative">
      {/* Logo */}
      <div className="flex items-center gap-4 ml-9">
        <Link to="/" onClick={() => window.scrollTo(0, 0)}>
          <img src={logo} alt="Logo" className="w-24 h-auto cursor-pointer" />
        </Link>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-8">
        {/* Toggler */}
        <img
          src={toggler}
          alt="Menu"
          className="w-6 h-6 cursor-pointer"
          onClick={() => setMenuOpen(true)}
        />

        {/* Flag dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1 rounded transition"
          >
            <img src={selectedCountry} alt="Flag" className="w-9 h-6 cursor-pointer" />
            <IoIosArrowDown className="cursor-pointer" />
          </button>
          {dropdownOpen && (
            <ul className="absolute right-[-30px] mt-3 w-30 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[60]">
              {countries.map((country) => (
                <li
                  key={country.name}
                  onClick={() => {
                    setSelectedCountry(country.flag);
                    setDropdownOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition"
                >
                  <img
                    src={country.flag}
                    alt={country.name}
                    className="w-7 h-5 rounded-sm object-cover ring-1 ring-gray-200"
                  />
                  <span className="text-sm font-medium">{country.name}</span>
                </li>
              ))}
            </ul>
          )}

        </div>

        {/* Login button */}
        <button className="flex items-center px-5 mr-8 py-2 rounded-full font-medium text-white bg-gradient-to-r from-[#65C4F0] to-blue-800 hover:from-blue-700 hover:to-gray-100 transition">
          Login
          <FaArrowRight className="ml-2" />
        </button>
      </div>

      {/* ===== Overlay + Drawer (TOP MOST) ===== */}
      {/* Overlay: blur + dim + blocks clicks behind */}
      <div
        className={`fixed inset-0 z-[9998] transition-all duration-300 ${menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          } bg-black/30 backdrop-blur-sm`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-[9999] overflow-hidden ${menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        aria-hidden={!menuOpen}
      >
        <div className="flex justify-end p-4">
          <button
            className="text-gray-700 text-2xl font-bold cursor-pointer"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <IoCloseOutline />
          </button>
        </div>

        <nav className="flex flex-col gap-6 px-6 mt-4">
          <a href="#" className="text-gray-800 hover:text-blue-600">
            Home
          </a>
          <a href="#" className="text-gray-800 hover:text-blue-600">
            About
          </a>
          <a href="#" className="text-gray-800 hover:text-blue-600">
            Services
          </a>
          <a href="#" className="text-gray-800 hover:text-blue-600">
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
};

export default HeaderComponent;
