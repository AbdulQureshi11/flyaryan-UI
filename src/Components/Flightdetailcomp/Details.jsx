import React, { useState } from "react";
import { Detaildata } from "../../Common/DetailUtlis";

const Details = () => {
  const [activeId, setActiveId] = useState(1); // default active

  // Table data for each sticker
  const tableData = {
    1: {
      headers: ["Base Fare", "Taxes", "Discount/PSF", "Service Charges", "Total"],
      values: ["PKR 66,150.00", "PKR 48,750.00", "PKR 500.00", "PKR 100", "PKR 115,500"],
    },
    2: {
      headers: ["Base Fare", "Taxes", "Discount/PSF", "Service Charges", "Total"],
      values: ["PKR 70,000", "PKR 50,000", "PKR 400", "PKR 150", "PKR 120,550"],
    },
    3: {
      headers: ["Base Fare", "Taxes", "Discount/PSF", "Service Charges", "Total"],
      values: ["PKR 80,000", "PKR 55,000", "PKR 300", "PKR 200", "PKR 135,500"],
    },
  };

  return (
    <div className="w-full flex flex-col items-center mt-10">
      <div className="w-[90%] rounded-xl bg-blue-100 border border-blue-500 relative p-6 mb-6">
        <h1 className="text-2xl font-bold text-[#002C8B] mb-6">Details</h1>

        <div className="flex gap-6">
          {Detaildata.map((item) => (
            <div
              key={item.id}
              className="w-[30%] bg-white rounded-xl p-4 shadow-md flex flex-col gap-4 relative cursor-pointer"
            >
              {/* Circle for each sticker */}
              <div
                onClick={() => setActiveId(item.id)}
                className={`absolute -top-3 left-4 w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                  activeId === item.id
                    ? "bg-blue-700 border-blue-700"
                    : "bg-white border-gray-400"
                }`}
              ></div>

              {/* Heading and Price */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-blue-700">{item.heading}</h2>
                <p className="text-lg font-semibold">{item.price}</p>
              </div>

              {/* Baggage */}
              {item.heading1 && (
                <div>
                  <h3 className="font-semibold">{item.heading1}</h3>
                  <p className="text-sm whitespace-pre-line">{item.disc1}</p>
                </div>
              )}

              {/* Cancel/Change */}
              {item.heading2 && (
                <div>
                  <h3 className="font-semibold">{item.heading2}</h3>
                  <p className="text-sm whitespace-pre-line">{item.disc2}</p>
                </div>
              )}

              {/* Additional Cost */}
              {item.heading3 && (
                <div>
                  <h3 className="font-semibold">{item.heading3}</h3>
                  <p className="text-sm whitespace-pre-line">{item.disc3}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Extra text and table for active sticker */}
      <div className="w-[90%] mb-20 p-4 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
        {/* Extra text */}
        {activeId === 1 && <p className="mb-4">This is extra text for Value (Sticker 1)</p>}
        {activeId === 2 && <p className="mb-4">Extra info for Flexi (Sticker 2)</p>}
        {activeId === 3 && <p className="mb-4">Details for Extra (Sticker 3)</p>}

        {/* Table */}
        <table className="w-full table-auto border-collapse text-center">
          <thead>
            <tr>
              {tableData[activeId].headers.map((header, index) => (
                <th key={index} className="border px-4 py-2 bg-gray-200">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {tableData[activeId].values.map((value, index) => (
                <td key={index} className="border px-4 py-2">
                  {value}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Details;
