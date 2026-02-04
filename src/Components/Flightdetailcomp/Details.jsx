import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";

// ✅ baggage helper: returns number string like "30" or null
const baggageWeightOnly = (b) => {
  if (!b) return null;

  if (typeof b === "object") {
    const w = b.maxWeight ?? b.weight ?? b.value ?? null;
    if (w === null || w === undefined || w === "") return null;
    const m = String(w).match(/(\d+(\.\d+)?)/);
    return m ? m[1] : null;
  }

  const s = String(b);
  const m = s.match(/(\d+(\.\d+)?)/);
  return m ? m[1] : null;
};

const Details = () => {
  const [activeId, setActiveId] = useState(1);

  const { pricing, pricedFlight, loading, error } = useSelector(
    (state) => state.airPricing
  );

  // ✅ fallback source (listing/selected flight)
  const selectedFlight = useSelector((state) => state.flightSearch?.selectedFlight);

  const currency = pricing?.currency || pricedFlight?.currency || "PKR";

  const money = (n) => {
    const num = Number(n);
    if (!Number.isFinite(num)) return `${currency} --`;
    return `${currency} ${num.toLocaleString()}`;
  };

  const cards = useMemo(() => {
    // ✅ MAIN FIX: try AirPricing baggage, else selectedFlight baggage
    const bagWeight =
      baggageWeightOnly(pricedFlight?.baggage) ||
      baggageWeightOnly(selectedFlight?.baggage);

    const bagText = bagWeight ? `${bagWeight} kg` : "Not Allowed";

    return [
      {
        id: 1,
        heading: "Standard",
        price: pricing ? money(pricing.totalPrice) : `${currency} --`,
        heading1: "Baggage",
        disc1: bagText,
        heading2: "Refund / Change",
        disc2: pricedFlight?.pricing?.refundable
          ? "Refundable (as per fare)"
          : "Non-refundable (as per fare)",
        heading3: "Notes",
        disc3: "Final price is fetched from Travelport AirPrice API.",
      },
    ];
  }, [pricing, pricedFlight, selectedFlight, currency]);

  const tableData = useMemo(() => {
    const base = pricing?.basePrice;
    const taxes = pricing?.taxes;
    const total = pricing?.totalPrice;

    return {
      1: {
        headers: ["Base Fare", "Taxes", "Total"],
        values: [money(base), money(taxes), money(total)],
      },
    };
  }, [pricing]);

  return (
    <div className="w-full flex flex-col items-center mt-10">
      <div className="w-[90%] rounded-xl bg-blue-100 border border-blue-500 relative p-6 mb-6">
        <h1 className="text-2xl font-bold text-[#002C8B] mb-6">Details</h1>

        {loading && (
          <div className="mb-4 p-3 rounded border border-blue-200 bg-blue-50 text-blue-800">
            Loading latest pricing...
          </div>
        )}
        {!loading && error && (
          <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-800">
            {error?.message || error?.error || "Pricing failed"}
          </div>
        )}

        <div className="flex gap-6">
          {cards.map((item) => (
            <div
              key={item.id}
              className="w-[30%] bg-white rounded-xl p-4 shadow-md flex flex-col gap-4 relative cursor-pointer"
            >
              <div
                onClick={() => setActiveId(item.id)}
                className={`absolute -top-3 left-4 w-6 h-6 rounded-full border-2 transition-all duration-200 ${activeId === item.id
                    ? "bg-blue-700 border-blue-700"
                    : "bg-white border-gray-400"
                  }`}
              ></div>

              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-blue-700">{item.heading}</h2>
                <p className="text-lg font-semibold">{item.price}</p>
              </div>

              {item.heading1 && (
                <div>
                  <h3 className="font-semibold">{item.heading1}</h3>
                  <p className="text-sm whitespace-pre-line">{item.disc1}</p>
                </div>
              )}

              {item.heading2 && (
                <div>
                  <h3 className="font-semibold">{item.heading2}</h3>
                  <p className="text-sm whitespace-pre-line">{item.disc2}</p>
                </div>
              )}

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

      <div className="w-[90%] mb-20 p-4 bg-gray-50 border border-gray-300 rounded-lg text-gray-700">
        {activeId === 1 && (
          <p className="mb-4">
            This breakdown is based on the <b>latest price</b> returned by the Air Pricing API.
          </p>
        )}

        <table className="w-full table-auto border-collapse text-center">
          <thead>
            <tr>
              {tableData[activeId]?.headers?.map((header, index) => (
                <th key={index} className="border px-4 py-2 bg-gray-200">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {tableData[activeId]?.values?.map((value, index) => (
                <td key={index} className="border px-4 py-2">
                  {value}
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        {!pricing && !loading && (
          <div className="mt-4 text-sm text-gray-600">
            Note: Pricing not loaded yet. Go to flight detail and wait for pricing to complete.
          </div>
        )}
      </div>
    </div>
  );
};

export default Details;
