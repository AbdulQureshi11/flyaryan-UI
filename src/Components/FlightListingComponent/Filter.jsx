import { FiChevronDown } from "react-icons/fi";
import { useEffect, useState } from "react";

const DEFAULT_FILTERS = {
    TIME: "TIME",
    PRICE: "PRICE",
    STOPS: "STOPS",
    CLASS: "CLASS",
    REFUNDABLE: "REFUNDABLE",
    AIRLINE: "AIRLINE",
};

const Filter = ({ options = {}, onChange, resetKey }) => {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [selectedFilter, setSelectedFilter] = useState(DEFAULT_FILTERS);


    useEffect(() => {
        setSelectedFilter(DEFAULT_FILTERS);
        setOpenDropdown(null);
        onChange?.(DEFAULT_FILTERS);
    }, [resetKey]);

    const handleSelect = (key, value) => {
        const updated = { ...selectedFilter, [key]: value };
        setSelectedFilter(updated);
        setOpenDropdown(null);
        onChange?.(updated);
    };

    const handleResetAll = () => {
        setSelectedFilter(DEFAULT_FILTERS);
        setOpenDropdown(null);
        onChange?.(DEFAULT_FILTERS);
    };

    return (
        <div className="flex flex-wrap items-center justify-center gap-3 w-[87%]">
            {/* ALL / Reset button */}
            <button
                type="button"
                onClick={handleResetAll}
                className="h-[42px] border border-blue-600 text-blue-600 font-semibold px-6 rounded bg-white hover:bg-blue-50"
            >
                ALL
            </button>

            {Object.keys(DEFAULT_FILTERS).map((key) => {
                const list = Array.isArray(options[key]) ? options[key] : [];

                return (
                    <div key={key} className="relative w-39">
                        <div
                            className="h-[42px] flex justify-between items-center border border-blue-300 font-semibold rounded px-3 cursor-pointer bg-white"
                            onClick={() =>
                                setOpenDropdown(openDropdown === key ? null : key)
                            }
                        >
                            <span>{selectedFilter[key]}</span>
                            <FiChevronDown />
                        </div>

                        {openDropdown === key && (
                            <div className="absolute top-full left-0 w-full border border-gray-300 rounded bg-white mt-1 shadow-lg z-20 max-h-64 overflow-auto">
                                {list.length > 0 ? (
                                    list.map((option) => (
                                        <div
                                            key={option}
                                            className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                                            onClick={() => handleSelect(key, option)}
                                        >
                                            {option}
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-3 py-2 text-gray-400 cursor-not-allowed">
                                        Data not available
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default Filter;
