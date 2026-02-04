import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import FlightCard from "./FlightCard";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import {
    asyncValidatePassengers,
    asyncCreateBooking,
} from "../../features/booking/bookingSlice";

const BooknowComp = () => {
    const location = useLocation();
    const fareData = location.state?.fareData;

    const dispatch = useDispatch();

    // selectedFlight from flight search slice (must include travelportData)
    const selectedFlight = useSelector((s) => s.flightSearch?.selectedFlight);

    // booking slice state
    const {
        validating,
        validationErrors,
        bookingLoading,
        bookingError,
        pnr,
        bookingId,
        status,
        ticketingDeadline,
    } = useSelector((s) => s.booking);

    const [activeTraveler, setActiveTraveler] = useState("Adult 1");

    // --- IMPORTANT: keep your UI list as-is, but build dynamically from fareData counts ---
    const travelers = useMemo(() => {
        const a = Number(fareData?.travelerCounts?.adults ?? fareData?.adults ?? 2);
        const c = Number(fareData?.travelerCounts?.children ?? fareData?.children ?? 1);

        const list = [];
        for (let i = 1; i <= a; i++) list.push(`Adult ${i}`);
        for (let i = 1; i <= c; i++) list.push(`Child ${i}`);
        // infants optional if you have
        const inf = Number(fareData?.travelerCounts?.infants ?? fareData?.infants ?? 0);
        for (let i = 1; i <= inf; i++) list.push(`Infant ${i}`);

        // fallback to old list if empty
        return list.length ? list : ["Adult 1", "Adult 2", "Child 1"];
    }, [fareData]);

    const toggleTraveler = (traveler) => {
        setActiveTraveler((prev) => (prev === traveler ? null : traveler));
    };

    // Map UI keys => form keys
    const travelerKeyMap = useMemo(() => {
        const map = {};
        travelers.forEach((t) => {
            const k = t.toLowerCase().replace(" ", ""); // "Adult 1" => "adult1"
            map[t] = k;
        });
        return map;
    }, [travelers]);

    // initialValues build dynamically (keeps your fields)
    const initialValues = useMemo(() => {
        const travelersObj = {};
        travelers.forEach((t) => {
            const k = t.toLowerCase().replace(" ", "");
            travelersObj[k] = {
                title: "",
                fullName: "",
                dob: "",
                nationality: "",
                documentType: "",
                documentNumber: "",
                expiryDate: "",
            };
        });

        return {
            travelers: travelersObj,
            additionalServices: {
                mealOption: "",
                specialService: "",
            },
            contact: {
                phoneCode: "+92",
                phoneNumber: "",
                email: "",
                otp: "",
            },
        };
    }, [travelers]);

    // validation schema (Adult 1 required, others optional like your current logic)
    const validationSchema = useMemo(() => {
        const shape = {
            travelers: Yup.object().shape({}),
            additionalServices: Yup.object().shape({
                mealOption: Yup.string(),
                specialService: Yup.string(),
            }),
            contact: Yup.object().shape({
                phoneCode: Yup.string().required("Required*"),
                phoneNumber: Yup.string().required("Required*"),
                email: Yup.string().email("Invalid email").required("Required*"),
                otp: Yup.string(),
            }),
        };

        const travelerShape = {};
        travelers.forEach((t) => {
            const k = t.toLowerCase().replace(" ", "");
            const isAdult1 = t === "Adult 1";

            travelerShape[k] = Yup.object().shape({
                title: isAdult1 ? Yup.string().required("Required*") : Yup.string(),
                fullName: isAdult1 ? Yup.string().required("Required*") : Yup.string(),
                dob: isAdult1 ? Yup.string().required("Required*") : Yup.string(),
                nationality: isAdult1 ? Yup.string().required("Required*") : Yup.string(),
                documentType: isAdult1 ? Yup.string().required("Required*") : Yup.string(),
                documentNumber: isAdult1 ? Yup.string().required("Required*") : Yup.string(),
                expiryDate: isAdult1 ? Yup.string().required("Required*") : Yup.string(),
            });
        });

        shape.travelers = Yup.object().shape(travelerShape);
        return Yup.object().shape(shape);
    }, [travelers]);

    // Convert formik travelers => backend passengers array
    const buildPassengersPayload = (values) => {
        const pax = [];

        travelers.forEach((label) => {
            const key = travelerKeyMap[label];
            const t = values.travelers[key];

            // If traveler not filled (optional), skip
            const hasAny =
                t?.fullName ||
                t?.dob ||
                t?.documentNumber ||
                t?.nationality ||
                t?.title;

            if (!hasAny) return;

            const [firstNameRaw, ...rest] = String(t.fullName || "").trim().split(" ");
            const firstName = firstNameRaw || "";
            const lastName = rest.join(" ") || "NA";

            let type = "ADT";
            if (label.toLowerCase().startsWith("child")) type = "CNN";
            if (label.toLowerCase().startsWith("infant")) type = "INF";

            pax.push({
                type,
                firstName,
                lastName,
                gender: t?.title === "Mr" ? "M" : t?.title === "Ms" ? "F" : "",
                dob: t?.dob || "",
                nationality: t?.nationality || "",
                passportNumber: t?.documentNumber || "",
                passportExpiry: t?.expiryDate || "",
            });
        });

        return pax;
    };

    const handleSubmit = async (values) => {
        // 1) Make sure selectedFlight exists
        if (!selectedFlight?.travelportData) {
            alert("Selected flight missing. Please go back and select a flight again.");
            return;
        }

        // 2) Build passengers payload for backend
        const passengers = buildPassengersPayload(values);

        // 3) contactInfo payload
        const contactInfo = {
            email: values?.contact?.email || "",
            phone: `${values?.contact?.phoneCode || ""}${values?.contact?.phoneNumber || ""}`,
        };

        // 4) optional formOfPayment (you can enhance later)
        const formOfPayment = null;

        // 5) Validate passengers first
        const vRes = await dispatch(asyncValidatePassengers({ passengers }));
        if (asyncValidatePassengers.rejected.match(vRes)) {
            return; // errors will show in UI
        }

        // 6) Create booking (PNR)
        await dispatch(
            asyncCreateBooking({
                selectedFlight,
                passengers,
                contactInfo,
                formOfPayment,
            })
        );
    };

    return (
        <div>
            {/* Session Warning */}
            <div className="bg-[#FFF9E3] w-[90%] h-[50px] flex justify-center items-center mx-auto rounded-md text-[#7C6A00] text-lg font-medium mb-15">
                Your session will be expire in 01:56
            </div>

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ values, setFieldValue }) => (
                    <Form>
                        <div className="w-[100%] flex">
                            {/* Left side */}
                            <div className="w-[60%] p-4 pl-15">
                                <h1 className="font-bold text-blue-800 text-xl mb-4">
                                    Traveler Information
                                </h1>

                                {/* Backend errors (validation + booking) */}
                                {(Array.isArray(validationErrors) && validationErrors.length > 0) && (
                                    <div className="bg-red-50 border border-red-300 text-red-800 p-3 rounded-md mb-4">
                                        <div className="font-semibold mb-1">Please fix these:</div>
                                        <ul className="list-disc pl-5 text-sm">
                                            {validationErrors.map((e, i) => (
                                                <li key={i}>{e}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {bookingError?.error && (
                                    <div className="bg-red-50 border border-red-300 text-red-800 p-3 rounded-md mb-4">
                                        <div className="font-semibold">Booking Failed</div>
                                        <div className="text-sm">{bookingError?.message || bookingError?.error}</div>
                                    </div>
                                )}

                                {/* Accordion */}
                                <div className="flex flex-col gap-6">
                                    {travelers.map((traveler) => {
                                        const tKey = travelerKeyMap[traveler];
                                        const base = `travelers.${tKey}`;

                                        return (
                                            <div key={traveler}>
                                                <div
                                                    className="cursor-pointer bg-white p-2 rounded-md border border-gray-300 font-medium w-[20%] text-center"
                                                    onClick={() => toggleTraveler(traveler)}
                                                >
                                                    {traveler}
                                                </div>

                                                {activeTraveler === traveler && (
                                                    <div className="mt-2 p-4 bg-white rounded-md shadow-md">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-sm font-medium mb-1">
                                                                    TITLE
                                                                </label>
                                                                <select
                                                                    className="w-full p-2 border border-gray-300 rounded"
                                                                    value={values.travelers[tKey].title}
                                                                    onChange={(e) =>
                                                                        setFieldValue(`${base}.title`, e.target.value)
                                                                    }
                                                                >
                                                                    <option value="">Select</option>
                                                                    <option value="Mr">Mr</option>
                                                                    <option value="Ms">Ms</option>
                                                                </select>
                                                                <ErrorMessage
                                                                    name={`${base}.title`}
                                                                    component="div"
                                                                    className="font-semibold text-red-800 text-sm mt-1"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-sm font-medium mb-1">
                                                                    Full Name
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Full Name"
                                                                    className="w-full p-2 border border-gray-300 rounded"
                                                                    value={values.travelers[tKey].fullName}
                                                                    onChange={(e) =>
                                                                        setFieldValue(`${base}.fullName`, e.target.value)
                                                                    }
                                                                />
                                                                <ErrorMessage
                                                                    name={`${base}.fullName`}
                                                                    component="div"
                                                                    className="font-semibold text-red-800 text-sm mt-1"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-sm font-medium mb-1">
                                                                    Date of Birth
                                                                </label>
                                                                <input
                                                                    type="date"
                                                                    className="w-full p-2 border border-gray-300 rounded"
                                                                    value={values.travelers[tKey].dob}
                                                                    onChange={(e) =>
                                                                        setFieldValue(`${base}.dob`, e.target.value)
                                                                    }
                                                                />
                                                                <ErrorMessage
                                                                    name={`${base}.dob`}
                                                                    component="div"
                                                                    className="font-semibold text-red-800 text-sm mt-1"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-sm font-medium mb-1">
                                                                    Nationality
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Nationality"
                                                                    className="w-full p-2 border border-gray-300 rounded"
                                                                    value={values.travelers[tKey].nationality}
                                                                    onChange={(e) =>
                                                                        setFieldValue(`${base}.nationality`, e.target.value)
                                                                    }
                                                                />
                                                                <ErrorMessage
                                                                    name={`${base}.nationality`}
                                                                    component="div"
                                                                    className="font-semibold text-red-800 text-sm mt-1"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-sm font-medium mb-1">
                                                                    Document Type
                                                                </label>
                                                                <select
                                                                    className="w-full p-2 border border-gray-300 rounded"
                                                                    value={values.travelers[tKey].documentType}
                                                                    onChange={(e) =>
                                                                        setFieldValue(`${base}.documentType`, e.target.value)
                                                                    }
                                                                >
                                                                    <option value="">Select</option>
                                                                    <option value="Passport">Passport</option>
                                                                    <option value="CNIC">CNIC</option>
                                                                </select>
                                                                <ErrorMessage
                                                                    name={`${base}.documentType`}
                                                                    component="div"
                                                                    className="font-semibold text-red-800 text-sm mt-1"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-sm font-medium mb-1">
                                                                    Passport/CNIC
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Passport/CNIC"
                                                                    className="w-full p-2 border border-gray-300 rounded"
                                                                    value={values.travelers[tKey].documentNumber}
                                                                    onChange={(e) =>
                                                                        setFieldValue(`${base}.documentNumber`, e.target.value)
                                                                    }
                                                                />
                                                                <ErrorMessage
                                                                    name={`${base}.documentNumber`}
                                                                    component="div"
                                                                    className="font-semibold text-red-800 text-sm mt-1"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="block text-sm font-medium mb-1">
                                                                    Expiry Date
                                                                </label>
                                                                <input
                                                                    type="date"
                                                                    className="w-full p-2 border border-gray-300 rounded"
                                                                    value={values.travelers[tKey].expiryDate}
                                                                    onChange={(e) =>
                                                                        setFieldValue(`${base}.expiryDate`, e.target.value)
                                                                    }
                                                                />
                                                                <ErrorMessage
                                                                    name={`${base}.expiryDate`}
                                                                    component="div"
                                                                    className="font-semibold text-red-800 text-sm mt-1"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Additional Services */}
                                <h1 className="font-bold text-blue-900 text-xl mt-8 mb-4">
                                    Additional Services
                                </h1>
                                <div className="flex gap-4 mb-6">
                                    <div className="flex flex-col w-1/2">
                                        <label className="font-medium mb-1">Any Meals Options</label>
                                        <select
                                            className="w-full p-2 border border-gray-300 rounded mt-2"
                                            value={values.additionalServices.mealOption}
                                            onChange={(e) =>
                                                setFieldValue("additionalServices.mealOption", e.target.value)
                                            }
                                        >
                                            <option value="">Select</option>
                                            <option value="Asian Vegetarian">Asian Vegetarian</option>
                                            <option value="Vegan">Vegan</option>
                                            <option value="Non-Veg">Non-Veg</option>
                                        </select>
                                    </div>

                                    <div className="flex flex-col w-1/2">
                                        <label className="font-medium mb-1">Any Special Services</label>
                                        <select
                                            className="w-full p-2 border border-gray-300 rounded mt-2"
                                            value={values.additionalServices.specialService}
                                            onChange={(e) =>
                                                setFieldValue("additionalServices.specialService", e.target.value)
                                            }
                                        >
                                            <option value="">Select</option>
                                            <option value="Wheel Chair">Wheel Chair</option>
                                            <option value="Assistance">Assistance</option>
                                            <option value="Extra Baggage">Extra Baggage</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <h1 className="font-bold text-blue-900 text-xl mt-8 mb-4">
                                    Contact Information
                                </h1>

                                {/* Phone */}
                                <div className="flex gap-4 mb-4">
                                    <div className="flex flex-col w-1/2">
                                        <label className="font-medium mb-1">Phone</label>

                                        <div className="flex gap-2 mt-2">
                                            <input
                                                type="tel"
                                                placeholder="+92"
                                                className="w-1/4 p-2 border border-gray-300 rounded"
                                                maxLength={3}
                                                value={values.contact.phoneCode}
                                                onInput={(e) => {
                                                    e.target.value = e.target.value
                                                        .replace(/[^0-9+]/g, "")
                                                        .replace(/(.{1,3}).*/, "$1");
                                                    if (e.target.value.length > 0 && e.target.value[0] !== "+") {
                                                        e.target.value = "+" + e.target.value.replace(/\+/g, "");
                                                    }
                                                    setFieldValue("contact.phoneCode", e.target.value);
                                                }}
                                                onChange={() => { }}
                                            />

                                            <input
                                                type="tel"
                                                placeholder="xxxxxxxxx"
                                                className="w-3/4 p-2 border border-gray-300 rounded"
                                                pattern="[0-9]*"
                                                value={values.contact.phoneNumber}
                                                onInput={(e) => {
                                                    e.target.value = e.target.value.replace(/[^0-9]/g, "");
                                                    setFieldValue("contact.phoneNumber", e.target.value);
                                                }}
                                                onChange={() => { }}
                                            />
                                        </div>

                                        <div className="mt-2">
                                            <ErrorMessage
                                                name="contact.phoneCode"
                                                component="div"
                                                className="font-semibold text-red-800 text-sm"
                                            />
                                            <ErrorMessage
                                                name="contact.phoneNumber"
                                                component="div"
                                                className="font-semibold text-red-800 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="flex gap-4 mb-4">
                                    <div className="flex flex-col w-1/2">
                                        <label className="font-medium mb-1">Email</label>

                                        <div className="flex gap-2 mt-2">
                                            <input
                                                type="email"
                                                placeholder="email@example.com"
                                                className="w-full p-2 border border-gray-300 rounded"
                                                value={values.contact.email}
                                                onChange={(e) => setFieldValue("contact.email", e.target.value)}
                                            />

                                            <button
                                                type="button"
                                                className="bg-blue-600 text-white px-4 py-2 rounded-md mt-0"
                                                onClick={() => {
                                                    console.log("Generate OTP clicked for:", values.contact.email);
                                                }}
                                            >
                                                Generate OTP
                                            </button>
                                        </div>

                                        <ErrorMessage
                                            name="contact.email"
                                            component="div"
                                            className="font-semibold text-red-800 text-sm mt-1"
                                        />

                                        <h1 className="pt-4 text-gray-800 text-sm font-semibold">
                                            PLEASE ENTER OTP TO VERIFY EMAIL
                                        </h1>

                                        <input
                                            type="text"
                                            placeholder="Enter OTP"
                                            className="w-full p-2 border border-gray-300 rounded mt-2"
                                            value={values.contact.otp}
                                            onChange={(e) => setFieldValue("contact.otp", e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Submit */}
                                <div className="mt-6">
                                    <button
                                        type="submit"
                                        disabled={validating || bookingLoading}
                                        className="bg-green-600 hover:bg-green-500 transition-all text-white px-6 py-2 rounded-md disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {bookingLoading
                                            ? "Booking..."
                                            : validating
                                                ? "Validating..."
                                                : "Submit / Book Now"}
                                    </button>
                                </div>
                            </div>

                            {/* Right side */}
                            <div className="w-[35%] bg-[#E7F0FF] p-4 mr-3 rounded-xl border border-blue-600 mb-20">
                                {/* PNR Success Box (no design break) */}
                                {pnr && (
                                    <div className="bg-white border border-green-300 rounded-md p-3 mb-4">
                                        <div className="text-green-700 font-bold text-lg">
                                            Booking Confirmed ✅
                                        </div>
                                        <div className="text-sm mt-1">
                                            <span className="font-semibold">PNR:</span>{" "}
                                            <span className="font-bold">{pnr}</span>
                                        </div>
                                        {bookingId && (
                                            <div className="text-sm">
                                                <span className="font-semibold">Booking ID:</span>{" "}
                                                {bookingId}
                                            </div>
                                        )}
                                        {status && (
                                            <div className="text-sm">
                                                <span className="font-semibold">Status:</span> {status}
                                            </div>
                                        )}
                                        {ticketingDeadline && (
                                            <div className="text-sm">
                                                <span className="font-semibold">Ticketing Deadline:</span>{" "}
                                                {ticketingDeadline}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <FlightCard fareData={fareData} />
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default BooknowComp;
