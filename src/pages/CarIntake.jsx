import React, { useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import { carIntakeAPI, vinAPI } from "../utils/api";
import { Form, message, Alert, Card, Modal, Input, Button, Spin } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import CarDetails from "../components/CarIntake/CarDetails";
import CarImages from "../components/CarIntake/CarImages";
import CarDiagnosis from "../components/CarIntake/CarDiagnosis";
import CarPrice from "../components/CarIntake/CarPrice";
import UserKYCAndCarDoc from "../components/CarIntake/UserKYCAndCarDoc";
import Payment from "../components/CarIntake/Payment";
import CarInventory from "../components/CarIntake/CarInventory";

// Map UI steps to backend status enum values
const STEP_STATUS_MAP = {
  0: "vin-fetched",
  1: "details-uploaded",
  2: "images-uploaded",
  3: "parts-uploaded",
  4: "price-uploaded",
  5: "kyc-uploaded",
  6: "payment-done",
};

// Map backend status enum -> UI step number
const STATUS_TO_STEP = {
  "vin-fetched": 1,
  "details-uploaded": 2,
  "images-uploaded": 3,
  "parts-uploaded": 4,
  "price-uploaded": 5,
  "kyc-uploaded": 6,
  "payment-done": 7,
  // fallback
  intake: 1,
};

const getStepForStatus = (status) => {
  if (!status) return 1;
  return STATUS_TO_STEP[status] || 1;
};

const CarIntake = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [serverId, setServerId] = useState(null);
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });
  const [form] = Form.useForm();
  const [vinModalForm] = Form.useForm();
  const [isVinModalVisible, setIsVinModalVisible] = useState(true);
  const [isLoadingVin, setIsLoadingVin] = useState(false);
  const [vinData, setVinData] = useState(null);
  const [vinError, setVinError] = useState(null);
  const [stepSaveStatus, setStepSaveStatus] = useState({});
  const [validationModalVisible, setValidationModalVisible] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [formData, setFormData] = useState({
    // Step 1: Car Details - matching original template
    vin: "",
    year: "",
    make: "",
    model: "",
    trim: "",
    color: "",
    bodyClass: "",
    chassisNo: "",
    engine: "",
    engineVariant: "",
    drive: "",
    transmission: "",
    scrapYardName: "RTX",
    scrapYardLocation: "New Jersey",
    fuelType: "",
    hasKeys: false,
    weight: "",
    dimensions: "",
    description: "",

    // Step 2: Car Images - matching original template
    carImage1: null,
    carImage2: null,
    carImage3: null,
    carImage4: null,
    carImage5: null,
    carImage6: null,
    carImage7: null,
    carImage8: null,
    carEngineImage: null,
    carBootImage: null,
    belowVehicleImage: null,
    fullVehicleImage: null,
    imageDescription: "",

    // Step 3: Car Diagnosis
    diagnosis: {},

    // Step 4: Car Price - matching original template
    rate: "6",
    actualWeight: "0",
    actualPrice: "0",
    ourPrice: "0",
    customerPrice: "0",
    negotiateTo: "",
    finalPrice: "0",
    priceDescription: "",

    // Step 5: User KYC & Car Doc
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerAddress: "",
    dlDocument: null,
    physicalPaper: null,
    titleCertificate: null,
    sellingDate: dayjs(),
    pickUpType: "You Pull",
    sellerSignature: null,

    // Step 6: Payment
    paymentMethod: "",
    paymentAmount: "",
    paymentDate: "",
    receiptNumber: "",

    // Step 7: Car & Parts Inventory
    inventoryItems: [],
  });

  // Normalize pickup value from older numeric values to backend enum strings
  const normalizePickup = (val) => {
    if (val === undefined || val === null) return undefined;
    if (typeof val === "string") {
      const legacyMap = {
        0: "You Pull",
        1: "We Pull",
        2: "Bulk",
        3: "Location",
      };
      if (legacyMap[val]) return legacyMap[val];
      return val;
    }
    if (typeof val === "number") {
      const numMap = ["You Pull", "We Pull", "Bulk", "Location"];
      return numMap[val] || String(val);
    }
    return String(val);
  };

  const updateFormData = useCallback(
    (updates) => {
      setFormData((prev) => ({ ...prev, ...updates }));

      // Update Ant Design form values
      form.setFieldsValue(updates);
    },
    [form]
  );

  // Sync form with formData on mount and when formData changes
  useEffect(() => {
    form.setFieldsValue(formData);
  }, [form, formData]);

  // Save a single step to backend. If no serverId, create draft on first save.
  const saveStep = useCallback(
    async (step, stepData) => {
      console.log(step);
      const setStatus = (s, status, error) => {
        setStepSaveStatus((prev) => ({ ...prev, [s]: { status, error } }));
      };

      try {
        // mark saving
        setStatus(step, "saving", null);
        let res;
        if (!serverId && step === 1) {
          // create with JSON using step1 data + vin
          const payload = {
            vin: stepData.vin,
            year: stepData.year,
            make: stepData.make,
            model: stepData.model,
            trim: stepData.trim,
            color: stepData.color,
            bodyClass: stepData.bodyClass,
            chassisNo: stepData.chassisNo,
            engine: stepData.engine || stepData.engineNo,
            engineVariant: stepData.engineVariant,
            drive: stepData.drive,
            transmission: stepData.transmission,
            scrapYardName: stepData.scrapYardName,
            scrapYardLocation: stepData.scrapYardLocation,
            fuelType: stepData.fuelType,
            keys: stepData.hasKeys,
            dimensions: stepData.dimensions,
            weight: stepData.weight,
            description: stepData.description,
          };

          // include step status so backend can accept/override it
          if (STEP_STATUS_MAP[step]) payload.status = STEP_STATUS_MAP[step];
          res = await carIntakeAPI.createWithJSON(payload);
          if (res?.data?.carIntake?._id) {
            setServerId(res.data.carIntake._id);
          }
        } else if (serverId) {
          // map step to update payload
          let payload = {};
          if (step === 1) {
            payload = {
              year: stepData.year,
              make: stepData.make,
              model: stepData.model,
              trim: stepData.trim,
              color: stepData.color,
              bodyClass: stepData.bodyClass,
              chassisNo: stepData.chassisNo,
              engine: stepData.engine || stepData.engineNo,
              engineVariant: stepData.engineVariant,
              drive: stepData.drive,
              transmission: stepData.transmission,
              scrapYardName: stepData.scrapYardName,
              scrapYardLocation: stepData.scrapYardLocation,
              fuelType: stepData.fuelType,
              keys: stepData.hasKeys,
              weight: stepData.weight,
              dimensions: stepData.dimensions,
              description: stepData.description,
            };
          } else if (step === 2) {
            payload = { carImages: stepData.carImages || stepData };
          } else if (step === 3) {
            const partsPayload = stepData.diagnosis || stepData || {};
            payload = {
              parts: partsPayload,
              partDetails: {
                parts: partsPayload,
                partsDescription: stepData.partsDescription || undefined,
              },
            };
          } else if (step === 4) {
            payload = {
              actualWeight: parseFloat(stepData.actualWeight) || undefined,
              ratePerPound: parseFloat(stepData.rate) || undefined,
              actualPrice: parseFloat(stepData.actualPrice) || undefined,
              ourPrice: parseFloat(stepData.ourPrice) || undefined,
              customerPrice: parseFloat(stepData.customerPrice) || undefined,
              negotiateTo: stepData.negotiateTo,
              finalPrice: parseFloat(stepData.finalPrice) || undefined,
              priceDescription: stepData.priceDescription,
            };
          } else if (step === 5) {
            // Ensure sellingDate is serialized (dayjs -> string) for backend
            let sellingDateValue = stepData.sellingDate;
            if (sellingDateValue && sellingDateValue.format) {
              sellingDateValue = sellingDateValue.format("YYYY-MM-DD");
            }
            // Collect document URLs from either `stepData.documents` or
            // individual upload fields (`dlDocument`, `carRC`, `titleCertificate`). This ensures
            // documents uploaded via the KYC component are included in the
            // payload when saving step 5.
            const documents = { ...(stepData.documents || {}) };
            if (
              stepData.dlDocument &&
              stepData.dlDocument.uploaded &&
              stepData.dlDocument.url
            ) {
              documents.driversLicense = stepData.dlDocument.url;
            }
            if (
              stepData.physicalPaper &&
              stepData.physicalPaper.uploaded &&
              stepData.physicalPaper.url
            ) {
              documents.physicalPaper = stepData.physicalPaper.url;
            }
            if (
              stepData.titleCertificate &&
              stepData.titleCertificate.uploaded &&
              stepData.titleCertificate.url
            ) {
              documents.titleCertificate = stepData.titleCertificate.url;
            }

            payload = {
              sellerData: {
                firstName: stepData.firstName,
                lastName: stepData.lastName,
                email: stepData.email,
                mobileNo: stepData.mobileNo,
                description: stepData.kycDescription,
              },
              documents: documents,
              sellingDate: sellingDateValue,
              pickupType: normalizePickup(stepData.pickUpType),
              kycDescription: stepData.kycDescription,
              sellerSignature: stepData.sellerSignature || undefined,
            };
            console.log("Step 5 payload:", {
              ...payload,
              sellerSignature: payload.sellerSignature ? "Present" : "Missing",
            });
            // If an existing seller was selected, tell backend to attach by id
            if (stepData.sellerId) {
              payload.sellerId = stepData.sellerId;
              // avoid sending sellerData when attaching existing seller
              delete payload.sellerData;
            }
          } else if (step === 6) {
            // Payment component uses form fields named `paidTo` and `finalPrice`.
            // Normalize to backend expected keys: `paymentMethod` and `paidAmount`.
            // Compute tax data locally and include taxRate so backend computes/stores tax
            const _gross =
              stepData.finalPrice !== undefined && stepData.finalPrice !== ""
                ? parseFloat(stepData.finalPrice)
                : stepData.paymentAmount !== undefined
                  ? parseFloat(stepData.paymentAmount)
                  : stepData.paidAmount || 0;
            const TAX_RATE = 0.06625;
            const _taxAmount = Number(Math.abs(_gross * TAX_RATE).toFixed(2));

            payload = {
              paymentMethod: stepData.paidTo || stepData.paymentMethod,
              paidAmount: _gross,
              paymentDescription: stepData.paymentDescription,
              taxRate: TAX_RATE,
              taxAmount: _taxAmount,
            };
          }

          if (Object.keys(payload).length) {
            if (STEP_STATUS_MAP[step]) payload.status = STEP_STATUS_MAP[step];
            res = await carIntakeAPI.update(serverId, payload);
          }
        }
        // If backend returned a carIntake, prefer its status field
        const returnedCar = res?.data?.carIntake || res?.carIntake || null;
        const returnedStatus = returnedCar?.status;
        if (returnedStatus) {
          setStatus(step, returnedStatus, null);
          // navigate UI to step corresponding to backend status
          try {
            setCurrentStep(getStepForStatus(returnedStatus));
          } catch {
            // ignore
          }
        } else {
          // fallback to generic saved marker
          setStatus(step, "saved", null);
        }
        return true;
      } catch (error) {
        console.error("Auto-save step error:", error);
        setStatus(step, "error", error?.message || String(error));
        return false;
      }
    },
    [serverId, setCurrentStep]
  );

  // No auto-save debounce used; saves happen only on explicit actions

  // Persist mapping of VIN -> draft serverId in localStorage
  const DRAFT_KEY = "carIntakeDrafts";

  const saveDraftMapping = (vin, id) => {
    if (!vin || !id) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY) || "{}";
      const map = JSON.parse(raw);
      map[vin] = id;
      localStorage.setItem(DRAFT_KEY, JSON.stringify(map));
    } catch (e) {
      console.warn("Failed to save draft mapping:", e);
    }
  };

  const removeDraftMapping = (vin) => {
    if (!vin) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY) || "{}";
      const map = JSON.parse(raw);
      delete map[vin];
      localStorage.setItem(DRAFT_KEY, JSON.stringify(map));
    } catch (e) {
      console.warn("Failed to remove draft mapping:", e);
    }
  };

  // Helper to populate form state from a CarIntake document
  const populateFormFromCar = useCallback(
    (car) => {
      if (!car) return;
      console.log("Populating form from car:", car);
      const populated = {};
      // Ensure VIN is populated from top-level or carDetails when editing
      populated.vin =
        car.vin || (car.carDetails && car.carDetails.vin) || formData.vin;
      if (car.carDetails) {
        populated.year = car.carDetails.year || formData.year;
        populated.make = car.carDetails.make || formData.make;
        populated.model = car.carDetails.model || formData.model;
        populated.trim = car.carDetails.trim || formData.trim;
        populated.color = car.carDetails.color || formData.color;
        populated.bodyClass = car.carDetails.bodyClass || formData.bodyClass;
        populated.chassisNo = car.carDetails.chassisNo || formData.chassisNo;
        populated.engine =
          car.carDetails.engine ||
          car.vinDetails?.DisplacementL ||
          car.carDetails.engineNo ||
          formData.engine ||
          formData.engineNo ||
          "";
        populated.engineVariant =
          car.carDetails.engineVariant || formData.engineVariant;
        populated.drive = car.carDetails.drive || formData.drive;
        populated.transmission =
          car.carDetails.transmission || formData.transmission;
        populated.scrapYardName =
          car.carDetails.scrapYardName || formData.scrapYardName;
        populated.scrapYardLocation =
          car.carDetails.scrapYardLocation || formData.scrapYardLocation;
        populated.fuelType = car.carDetails.fuelType || formData.fuelType;
        populated.hasKeys = car.carDetails.keys ?? formData.hasKeys;
        populated.weight = car.carDetails.weight || formData.weight;
        populated.dimensions = car.carDetails.dimensions || formData.dimensions;
        populated.description =
          car.carDetails.description || formData.description;
      }
      if (car.imagesStep) {
        const imgs = car.imagesStep;
        populated.carImage1 = imgs.image1
          ? { url: imgs.image1, uploaded: true }
          : formData.carImage1;
        populated.carImage2 = imgs.image2
          ? { url: imgs.image2, uploaded: true }
          : formData.carImage2;
        populated.carImage3 = imgs.image3
          ? { url: imgs.image3, uploaded: true }
          : formData.carImage3;
        populated.carImage4 = imgs.image4
          ? { url: imgs.image4, uploaded: true }
          : formData.carImage4;
        populated.carImage5 = imgs.image5
          ? { url: imgs.image5, uploaded: true }
          : formData.carImage5;
        populated.carImage6 = imgs.image6
          ? { url: imgs.image6, uploaded: true }
          : formData.carImage6;
        populated.carImage7 = imgs.image7
          ? { url: imgs.image7, uploaded: true }
          : formData.carImage7;
        populated.carImage8 = imgs.image8
          ? { url: imgs.image8, uploaded: true }
          : formData.carImage8;
        populated.carEngineImage = imgs.engineImage
          ? { url: imgs.engineImage, uploaded: true }
          : formData.carEngineImage;
        populated.carBootImage = imgs.bootImage
          ? { url: imgs.bootImage, uploaded: true }
          : formData.carBootImage;
        populated.belowVehicleImage = imgs.belowVehicleImage
          ? { url: imgs.belowVehicleImage, uploaded: true }
          : formData.belowVehicleImage;
        populated.fullVehicleImage = imgs.fullVehicleImage
          ? { url: imgs.fullVehicleImage, uploaded: true }
          : formData.fullVehicleImage;
        populated.imageDescription =
          imgs.imageDescription || formData.imageDescription;
      }
      // Prefer grouped `partDetails.parts` when present, fallback to legacy `parts`
      if (car.partDetails?.parts || car.parts) {
        populated.diagnosis =
          car.partDetails?.parts || car.parts || formData.diagnosis;
        // Populate partsDescription if available
        populated.partsDescription =
          car.partDetails?.partsDescription ||
          car.partsDescription ||
          formData.partsDescription;
      }
      if (car.price) {
        populated.actualWeight =
          car.price.actualWeight ??
          populated.actualWeight ??
          formData.actualWeight;
        populated.rate = car.price.ratePerPound ?? formData.rate;
        populated.actualPrice = car.price.actualPrice ?? formData.actualPrice;
        populated.ourPrice = car.price.ourPrice ?? formData.ourPrice;
        populated.customerPrice =
          car.price.customerPrice ?? formData.customerPrice;
        populated.negotiateTo = car.price.negotiateTo ?? formData.negotiateTo;
        populated.finalPrice = car.price.finalPrice ?? formData.finalPrice;
        populated.priceDescription =
          car.price.priceDescription ?? formData.priceDescription;
      }
      if (car.kyc) {
        // Ensure sellingDate is a dayjs instance for Antd DatePicker
        const sd = car.kyc.sellingDate;
        if (sd) {
          populated.sellingDate = sd && sd.format ? sd : dayjs(sd);
        } else {
          populated.sellingDate = formData.sellingDate;
        }
        populated.pickUpType = car.kyc.pickupType ?? formData.pickUpType;
        // Map backend documents object into individual form fields so the
        // KYC component shows uploaded status for driver license, RC, and title certificate.
        const docs = car.kyc.documents || {};
        populated.documents = docs || formData.documents;
        if (docs.driversLicense) {
          populated.dlDocument = {
            url: docs.driversLicense,
            uploaded: true,
            name: docs.driversLicense.split("/").pop(),
          };
        }
        if (docs.physicalPaper) {
          populated.physicalPaper = {
            url: docs.physicalPaper,
            uploaded: true,
            name: docs.physicalPaper.split("/").pop(),
          };
        }
        if (docs.titleCertificate) {
          populated.titleCertificate = {
            url: docs.titleCertificate,
            uploaded: true,
            name: docs.titleCertificate.split("/").pop(),
          };
        }
        // Populate seller signature if exists
        if (car.kyc.sellerSignature) {
          populated.sellerSignature = car.kyc.sellerSignature;
        }
      }
      // Backend may embed the selected seller under car.kyc.seller (full object)
      if (car.kyc && car.kyc.seller) {
        populated.sellerId =
          car.kyc.seller._id || car.kyc.seller.id || populated.sellerId;
        populated.selectedSellerData = car.kyc.seller;
        console.debug(
          "populateFormFromCar: attached car.kyc.seller to populated",
          {
            sellerId: populated.sellerId,
            seller: car.kyc.seller,
          }
        );
      }
      // If the backend returned a linked seller object, attach it so the
      // UserKYC component can show the selected seller card immediately.
      if (car.seller) {
        populated.sellerId =
          car.seller._id || car.seller.id || populated.sellerId;
        populated.selectedSellerData = car.seller;
        console.debug("populateFormFromCar: attached car.seller to populated", {
          sellerId: populated.sellerId,
          seller: car.seller,
        });
      } else if (car.kyc && car.kyc.sellerId) {
        // If only a sellerId was stored in kyc, ensure sellerId is set so the
        // KYC component may fetch the full customer record.
        populated.sellerId = car.kyc.sellerId || populated.sellerId;
        console.debug(
          "populateFormFromCar: attached kyc.sellerId to populated",
          {
            sellerId: populated.sellerId,
          }
        );
      }
      if (car.payment) {
        populated.paidTo = car.payment.paymentMethod || formData.paidTo;
        populated.paymentAmount =
          car.payment.paidAmount || formData.paymentAmount;
        populated.paymentDescription =
          car.payment.paymentDescription || formData.paymentDescription;
      }
      if (car.seller) {
        populated.firstName = car.seller.firstName || formData.firstName;
        populated.lastName = car.seller.lastName || formData.lastName;
        populated.email = car.seller.email || formData.email;
        populated.mobileNo = car.seller.mobileNo || formData.mobileNo;
      }
      setFormData((prev) => ({ ...prev, ...populated }));
      form.setFieldsValue(populated);
    },
    [form, formData]
  );

  // Load draft if mapping exists for current VIN
  useEffect(() => {
    const tryLoad = async () => {
      const vin = formData.vin;
      if (!vin) return;
      if (serverId) return; // already loaded
      try {
        const raw = localStorage.getItem(DRAFT_KEY) || "{}";
        const map = JSON.parse(raw);
        const id = map[vin];
        if (id) {
          // fetch draft and populate form only after successful fetch
          try {
            const res = await carIntakeAPI.getById(id);
            const payload = res.data || res;
            const car = payload.carIntake || payload;
            if (car) {
              // set server id only after fetch success
              setServerId(id);
              saveDraftMapping(vin, id);
              populateFormFromCar(car);
              // Set UI step according to backend status (if available)
              try {
                const backendStatus = car.status;
                if (backendStatus)
                  setCurrentStep(getStepForStatus(backendStatus));
              } catch {
                // ignore
              }
            } else {
              // remove stale mapping
              removeDraftMapping(vin);
            }
          } catch (e) {
            // If not found, remove stale mapping
            if (e?.response?.status === 404) removeDraftMapping(vin);
            console.warn("Failed to load draft:", e);
          }
        }
      } catch (e) {
        console.warn("Failed to load draft:", e);
      }
    };

    tryLoad();
  }, [formData.vin, populateFormFromCar, serverId]);

  // If route contains an `id`, load that CarIntake for editing using the
  // same create form. This hides the VIN modal and sets `serverId` so
  // subsequent saves update the existing record.
  const params = useParams();
  useEffect(() => {
    const tryLoadByRouteId = async () => {
      const routeId = params?.id;
      if (!routeId) return;
      if (serverId) return; // already loaded
      try {
        const res = await carIntakeAPI.getById(routeId);
        const payload = res.data || res;
        const car = payload.carIntake || payload;
        if (car) {
          setServerId(car._id || routeId);
          setIsVinModalVisible(false);
          populateFormFromCar(car);
          try {
            const backendStatus = car.status;
            if (backendStatus) setCurrentStep(getStepForStatus(backendStatus));
          } catch {
            // ignore
          }
        }
      } catch (e) {
        console.warn("Failed to load car by route id:", e);
      }
    };

    tryLoadByRouteId();
  }, [params?.id, populateFormFromCar, serverId]);

  // Whenever serverId is set and we have VIN, persist mapping
  useEffect(() => {
    if (serverId && formData.vin) saveDraftMapping(formData.vin, serverId);
  }, [serverId, formData.vin]);

  // Ant Design validation rules
  const getValidationRules = () => ({
    // Step 1: Car Details
    vin: [
      { required: true, message: "VIN Number is required" },
      { min: 3, message: "VIN must be at least 3 characters" },
    ],
    year: [
      { required: true, message: "Year is required" },
      {
        type: "number",
        min: 1900,
        max: new Date().getFullYear() + 1,
        message: `Year must be between 1900 and ${new Date().getFullYear() + 1
          }`,
      },
    ],
    make: [
      { required: true, message: "Make is required" },
      { min: 2, message: "Make must be at least 2 characters" },
    ],
    model: [
      { required: true, message: "Model is required" },
      { min: 2, message: "Model must be at least 2 characters" },
    ],
    trim: [
      { required: true, message: "Trim is required" },
      { min: 1, message: "Trim is required" },
    ],
    color: [{ required: true, message: "Color is required" }],

    // Weight field (used in both Step 1 and Step 4)
    weight: [
      { required: true, message: "Weight is required" },
      { type: "number", min: 1, message: "Weight must be greater than 0" },
    ],

    rate: [{ required: true, message: "Rate is required" }],
    finalPrice: [
      { required: true, message: "Final Price is required" },
      { type: "number", min: 0, message: "Final Price must be 0 or greater" },
    ],

    // Step 5: KYC
    firstName: [
      { required: true, message: "First Name is required" },
      { min: 2, message: "First Name must be at least 2 characters" },
    ],
    lastName: [
      { required: true, message: "Last Name is required" },
      { min: 2, message: "Last Name must be at least 2 characters" },
    ],
    mobileNo: [
      { required: true, message: "Mobile Number is required" },
      {
        pattern: /^\+?[\d\s\-()]{10,}$/,
        message: "Invalid mobile number format",
      },
    ],
    email: [{ type: "email", message: "Invalid email format" }],
    dlDocument: [{ required: true, message: "Driver's License is required" }],

    // Step 6: Payment
    paidTo: [{ required: true, message: "Payment Method is required" }],
    paymentAmount: [
      { required: true, message: "Payment Amount is required" },
      {
        type: "number",
        min: 0,
        message: "Payment Amount must be 0 or greater",
      },
    ],
  });

  // Show alert function
  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    // Auto-hide alert after 5 seconds
    setTimeout(() => {
      setAlert({ show: false, type: "", message: "" });
    }, 5000);
  };

  // Fetch VIN details from API
  const fetchVinDetails = async (vinNumber) => {
    try {
      setIsLoadingVin(true);
      setVinError(null);
      const response = await vinAPI.getDetails(vinNumber);

      if (response.data && response.data.success) {
        const vinDetails = response.data.data;
        const car =
          response.data.carIntake ||
          response.data.data?.carIntake ||
          response.data;

        setVinData(vinDetails);

        // Do NOT map VIN data into the form on frontend anymore.
        // If a backend CarIntake exists, populate from it and set serverId.
        if (
          car &&
          (car.carDetails ||
            car.imagesStep ||
            car.parts ||
            car.price ||
            car.kyc ||
            car.seller)
        ) {
          if (car._id) {
            setServerId(car._id);
            try {
              saveDraftMapping(vinNumber, car._id);
            } catch (e) {
              console.warn("Failed to persist draft mapping from VIN fetch", e);
            }
          }
          populateFormFromCar(car);
          setCurrentStep(getStepForStatus(car.status));
        }

        message.success("VIN details fetched successfully!");
        setVinError(null);
        return true;
      }

      message.error("Failed to fetch VIN details");
      return false;
    } catch (error) {
      console.error("VIN fetch error:", error);
      const userMsg = error.response?.data?.error || error.message;
      message.error("Error fetching VIN details: " + userMsg);
      setVinError(userMsg);
      return false;
    } finally {
      setIsLoadingVin(false);
    }
  };

  // VIN Modal handlers
  const handleVinModalOk = async () => {
    try {
      const values = await vinModalForm.validateFields();
      const { vin } = values;
      const success = await fetchVinDetails(vin);

      if (success) {
        // Bind VIN into form so it appears in the VIN field
        updateFormData({ vin });
        form.setFieldsValue({ vin });
        setIsVinModalVisible(false);
        message.success("VIN number set and details loaded successfully!");
      }
    } catch (errorInfo) {
      console.warn("VIN validation failed:", errorInfo);
    }
  };

  const navigate = useNavigate();
  const handleVinModalClose = () => {
    setIsVinModalVisible(false);
    navigate("/car-intake-list");
  };

  // Get step field names for validation
  const getStepFields = (step) => {
    switch (step) {
      case 1: // CarDetails - all required fields
        return [
          "vin",
          "year",
          "make",
          "model",
          "trim",
          "color",
          "bodyClass",
          "chassisNo",
          "engineVariant",
          "drive",
          "transmission",
          "scrapYardName",
          "scrapYardLocation",
          "fuelType",
          "hasKeys",
          "weight",
        ];
      case 2: // CarImages - all required image fields
        return [
          "carImage1",
          "carImage2",
          "carImage3",
          "carImage4",
          "carImage5",
          "carImage6",
          "carImage7",
          "carImage8",
          "carEngineImage",
          "carBootImage",
          "belowVehicleImage",
          "fullVehicleImage",
        ];
      case 3: // CarDiagnosis - no required fields (optional step)
        return [];
      case 4: // CarPrice - all required fields
        return [
          "actualWeight",
          "rate",
          "ourPrice",
          "customerPrice",
          "negotiateTo",
          "finalPrice",
        ];
      case 5: // UserKYCAndCarDoc - all required fields
        return [
          "firstName",
          "lastName",
          "mobileNo",
          "email",
          "dlDocument",
          "sellerSignature",
          "physicalPaper",
          "sellingDate",
          "pickUpType",
        ];
      case 6: // Payment - all required fields
        return ["paidTo", "finalPrice"];
      default:
        return [];
    }
  };

  // Clear form function
  const clearForm = () => {
    const initial = {
      // Step 1: Car Details - matching original template
      vin: "",
      year: "",
      make: "",
      model: "",
      trim: "",
      color: "",
      bodyClass: "",
      chassisNo: "",
      engine: "",
      engineVariant: "",
      drive: "",
      transmission: "",
      scrapYardName: "RTX",
      scrapYardLocation: "New Jersey",
      fuelType: "",
      hasKeys: false,
      weight: "",
      dimensions: "",
      description: "",

      // Step 2: Car Images
      carImage1: null,
      carImage2: null,
      carImage3: null,
      carImage4: null,
      carImage5: null,
      carImage6: null,
      carImage7: null,
      carImage8: null,
      carEngineImage: null,
      carBootImage: null,
      belowVehicleImage: null,
      fullVehicleImage: null,
      imageDescription: "",

      // Step 3: Car Diagnosis
      diagnosis: {},
      partsDescription: "",

      // Step 4: Car Price
      rate: "",
      actualWeight: "",
      actualPrice: "",
      ourPrice: "",
      customerPrice: "",
      negotiateTo: "",
      finalPrice: "",
      priceDescription: "",

      // Step 5: User KYC & Car Doc
      firstName: "",
      lastName: "",
      email: "",
      mobileNo: "",
      dlDocument: null,
      physicalPaper: null,
      titleCertificate: null,
      sellingDate: dayjs(),
      pickUpType: "You Pull",
      kycDescription: "",
      sellerSignature: null,

      // Step 6: Payment
      paidTo: "",
      paymentDescription: "",
    };

    setFormData(initial);
    form.setFieldsValue(initial);
    setCurrentStep(1);
  };

  const nextStep = async () => {
    // Validate current step before proceeding using Ant Design validation
    const stepFields = getStepFields(currentStep);

    try {
      await form.validateFields(stepFields);

      // Force immediate save when moving to next step
      try {
        await saveStep(currentStep, formData);
      } catch (e) {
        // ignore save errors while moving forward
        console.error("Step save error on nextStep:", e);
      }

      if (currentStep < 7) {
        setCurrentStep(currentStep + 1);
      }
    } catch (errorInfo) {
      console.warn("Validation failed:", errorInfo);

      // Collect all validation errors
      const errors = errorInfo.errorFields.map((field) => ({
        field: field.name[0],
        message: field.errors[0],
      }));

      // Show validation errors in a modal
      setValidationErrors(errors);
      setValidationModalVisible(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Final validation before submission using Ant Design
      const requiredStepFields = [
        ...getStepFields(1),
        ...getStepFields(4),
        ...getStepFields(5),
        ...getStepFields(6),
      ];

      await form.validateFields(requiredStepFields);

      // Prepare car images URLs
      const carImages = {};
      const imageFields = [
        "carImage1",
        "carImage2",
        "carImage3",
        "carImage4",
        "carImage5",
        "carImage6",
        "carImage7",
        "carImage8",
        "carEngineImage",
        "carBootImage",
        "belowVehicleImage",
        "fullVehicleImage",
      ];

      const imageMapping = {
        carImage1: "image1",
        carImage2: "image2",
        carImage3: "image3",
        carImage4: "image4",
        carImage5: "image5",
        carImage6: "image6",
        carImage7: "image7",
        carImage8: "image8",
        carEngineImage: "engineImage",
        carBootImage: "bootImage",
        belowVehicleImage: "belowVehicleImage",
        fullVehicleImage: "fullVehicleImage",
      };

      // Collect uploaded image URLs
      imageFields.forEach((field) => {
        if (
          formData[field] &&
          formData[field].uploaded &&
          formData[field].url
        ) {
          const backendFieldName = imageMapping[field];
          carImages[backendFieldName] = formData[field].url;
        }
      });

      // Prepare documents URLs
      const documents = {};
      if (
        formData.dlDocument &&
        formData.dlDocument.uploaded &&
        formData.dlDocument.url
      ) {
        documents.driversLicense = formData.dlDocument.url;
      }
      if (
        formData.physicalPaper &&
        formData.physicalPaper.uploaded &&
        formData.physicalPaper.url
      ) {
        documents.physicalPaper = formData.physicalPaper.url;
      }
      if (
        formData.titleCertificate &&
        formData.titleCertificate.uploaded &&
        formData.titleCertificate.url
      ) {
        documents.titleCertificate = formData.titleCertificate.url;
      }

      // Create JSON payload instead of FormData
      const submitData = {
        // Car basic info
        vin: formData.vin,
        year: parseInt(formData.year) || 0,
        make: formData.make,
        model: formData.model,
        trim: formData.trim,
        color: formData.color,
        bodyClass: formData.bodyClass,
        chassisNo: formData.chassisNo,
        engine: formData.engine || formData.engineNo,
        engineVariant: formData.engineVariant,
        drive: formData.drive,
        transmission: formData.transmission,
        scrapYardName: formData.scrapYardName,
        scrapYardLocation: formData.scrapYardLocation,
        fuelType: formData.fuelType,
        keys: formData.hasKeys,
        dimensions: formData.dimensions,
        description: formData.description,

        // Images
        carImages: carImages,
        imageDescription: formData.imageDescription,

        // Parts diagnosis (both legacy `parts` and grouped `partDetails` expected)
        partDetails: {
          parts: formData.diagnosis || {},
          partsDescription: formData.partsDescription || "",
        },

        // Price information
        actualWeight: parseFloat(formData.actualWeight) || 0,
        ratePerPound: parseFloat(formData.rate) || 6,
        actualPrice: parseFloat(formData.actualPrice) || 0,
        ourPrice: parseFloat(formData.ourPrice) || 0,
        customerPrice: parseFloat(formData.customerPrice) || 0,
        negotiateTo: formData.negotiateTo,
        finalPrice: parseFloat(formData.finalPrice) || 0,
        priceDescription: formData.priceDescription,

        // Seller data
        sellerData: {
          firstName: formData.firstName || "",
          lastName: formData.lastName || "",
          email: formData.email || "",
          mobileNo: formData.mobileNo || "",
          description: formData.kycDescription || "",
        },
        // Seller signature - image URL from upload
        sellerSignature: formData.sellerSignature || undefined,
        // If an existing seller was selected, include sellerId instead of sellerData
        ...(formData.sellerId ? { sellerId: formData.sellerId } : {}),

        // Documents
        documents: documents,

        // Required backend fields
        sellingDate:
          formData.sellingDate && formData.sellingDate.format
            ? formData.sellingDate.format("YYYY-MM-DD")
            : formData.sellingDate || new Date().toISOString().split("T")[0],
        pickupType: normalizePickup(formData.pickUpType),
        paymentMethod: formData.paidTo || "Cash",
        kycDescription: formData.kycDescription,
      };

      // Include payment data explicitly for the inventory submit flow
      submitData.paymentMethod = formData.paidTo || submitData.paymentMethod;
      submitData.paidAmount =
        formData.finalPrice !== undefined && formData.finalPrice !== ""
          ? parseFloat(formData.finalPrice)
          : formData.paymentAmount !== undefined
            ? parseFloat(formData.paymentAmount)
            : formData.paidAmount;

      // Include tax info so backend can persist transaction tax fields
      const SUBMIT_GROSS = submitData.paidAmount || 0;
      const SUBMIT_TAX_RATE = 0.06625;
      submitData.taxRate = SUBMIT_TAX_RATE;
      submitData.taxAmount = Number(
        Math.abs(SUBMIT_GROSS * SUBMIT_TAX_RATE).toFixed(2)
      );

      // Ensure backend receives status indicating payment step completed
      if (STEP_STATUS_MAP[6]) submitData.status = STEP_STATUS_MAP[6];

      // Attach status for payment step so backend transitions workflow
      if (STEP_STATUS_MAP[6]) {
        submitData.status = STEP_STATUS_MAP[6];
      }

      // Debug log to verify sellerSignature is in payload
      console.log("Submit payload:", {
        ...submitData,
        sellerSignature: submitData.sellerSignature ? "Present" : "Missing",
      });

      let response;
      if (serverId) {
        response = await carIntakeAPI.update(serverId, submitData);
      } else {
        response = await carIntakeAPI.createWithJSON(submitData);
      }

      if (response.status === 201 || response.status === 200) {
        message.success("Car intake created successfully!");
        showAlert("success", "Car intake created successfully!");
        // Clear form and go back to step 1
        setTimeout(() => {
          removeDraftMapping(formData.vin);
          clearForm();
        }, 2000); // Wait 2 seconds to let user see the success message
      } else {
        throw new Error(response.data.error || "Failed to create car intake");
      }
    } catch (error) {
      console.error("Submit error:", error);

      // Check if it's a validation error
      if (error.errorFields) {
        // Collect all validation errors
        const errors = error.errorFields.map((field) => ({
          field: field.name[0],
          message: field.errors[0],
        }));

        // Show validation errors in a modal
        setValidationErrors(errors);
        setValidationModalVisible(true);
      } else {
        // Show other errors using message and alert
        message.error(`Error submitting form: ${error.message}`);
        showAlert("danger", `Error submitting form: ${error.message}`);
      }
    }
  };

  const renderStepContent = () => {
    const validationRules = getValidationRules();

    switch (currentStep) {
      case 1:
        return (
          <CarDetails
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            form={form}
            validationRules={validationRules}
            vinData={vinData}
          />
        );
      case 2:
        return (
          <CarImages
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
            form={form}
          />
        );
      case 3:
        return (
          <CarDiagnosis
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
            form={form}
          />
        );
      case 4:
        return (
          <CarPrice
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
            form={form}
            validationRules={validationRules}
          />
        );
      case 5:
        return (
          <UserKYCAndCarDoc
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
            form={form}
            validationRules={validationRules}
          />
        );
      case 6:
        return (
          <Payment
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            prevStep={prevStep}
            form={form}
            validationRules={validationRules}
            saveStep={saveStep}
          />
        );
      case 7:
        return (
          <CarInventory
            formData={formData}
            prevStep={prevStep}
            handleSubmit={handleSubmit}
            form={form}
          />
        );
      default:
        return (
          <CarDetails
            formData={formData}
            updateFormData={updateFormData}
            nextStep={nextStep}
            form={form}
            validationRules={validationRules}
          />
        );
    }
  };

  return (
    <>
      <Modal
        title="Enter VIN Number"
        open={isVinModalVisible}
        onOk={handleVinModalOk}
        width={500}
        maskClosable={false}
        closable={false}
        centered
        footer={[
          <Button key="cancel" onClick={handleVinModalClose} size="large">
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleVinModalOk}
            size="large"
            loading={isLoadingVin}
            disabled={isLoadingVin}
          >
            {isLoadingVin ? "Loading VIN Details..." : "Continue"}
          </Button>,
        ]}
      >
        <div style={{ padding: "20px 0" }}>
          {isLoadingVin && (
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <Spin size="large" />
              <p style={{ marginTop: "10px", color: "#d1d5db" }}>
                Fetching VIN details...
              </p>
            </div>
          )}

          <p style={{ marginBottom: "16px", color: "#d1d5db" }}>
            Please enter the Vehicle Identification Number (VIN) to proceed with
            the car intake process.
          </p>
          <Form form={vinModalForm} layout="vertical">
            <Form.Item
              label={<span style={{ color: "white" }}>VIN Number</span>}
              name="vin"
              rules={[
                { required: true, message: "Please enter the VIN number!" },
                {
                  min: 17,
                  max: 17,
                  message: "VIN must be exactly 17 characters!",
                },
                {
                  pattern: /^[A-HJ-NPR-Z0-9]+$/i,
                  message: "Invalid VIN format!",
                },
              ]}
            >
              <Input
                placeholder="Enter 17-character VIN number"
                maxLength={17}
                size="large"
                disabled={isLoadingVin}
                style={{
                  textTransform: "uppercase",
                  backgroundColor: "#1F293D",
                  borderColor: "#1F293D",
                  color: "white",
                }}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  vinModalForm.setFieldsValue({ vin: value });
                  // clear any previous VIN error when user edits the field
                  setVinError(null);
                }}
              />
            </Form.Item>
          </Form>
          {vinError && (
            <div style={{ marginTop: 12 }}>
              <Alert
                message={vinError}
                type="error"
                showIcon
                style={{ backgroundColor: "#2b2730", borderRadius: 4 }}
              />
            </div>
          )}
        </div>
      </Modal>

      {/* Validation Error Modal */}
      <Modal
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "4px 0",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "rgba(255, 77, 79, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
              }}
            >
              ⚠️
            </div>
            <div>
              <div
                style={{
                  color: "#ffffff",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                Validation Failed
              </div>
              <div
                style={{
                  color: "#9ca3af",
                  fontSize: "12px",
                  fontWeight: "400",
                }}
              >
                {validationErrors.length}{" "}
                {validationErrors.length === 1 ? "error" : "errors"} found
              </div>
            </div>
          </div>
        }
        open={validationModalVisible}
        onCancel={() => setValidationModalVisible(false)}
        width={600}
        centered
        footer={null}
        closeIcon={
          <span style={{ color: "#9ca3af", fontSize: "20px" }}>×</span>
        }
        styles={{
          header: {
            backgroundColor: "#1F293D",
            borderBottom: "1px solid #2a3f5f",
            padding: "16px 20px",
          },
          body: {
            backgroundColor: "#1F293D",
            padding: "16px 20px",
          },
          content: {
            backgroundColor: "#1F293D",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
          },
        }}
      >
        <div>
          <div
            style={{
              maxHeight: "280px",
              overflowY: "auto",
              paddingRight: "4px",
            }}
          >
            {validationErrors.map((error, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "8px",
                  padding: "10px 14px",
                  backgroundColor: "#141b2d",
                  borderLeft: "3px solid #ff4d4f",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    minWidth: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(255, 77, 79, 0.15)",
                    border: "1.5px solid #ff4d4f",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    fontWeight: "bold",
                    color: "#ff7875",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  {index + 1}
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: "600",
                      color: "#ffffff",
                      fontSize: "13px",
                      marginBottom: "4px",
                      textTransform: "capitalize",
                    }}
                  >
                    {error.field.replace(/([A-Z])/g, " $1").trim()}
                  </div>
                  <div
                    style={{
                      color: "#ff9c9c",
                      fontSize: "12px",
                      lineHeight: "1.5",
                    }}
                  >
                    {error.message}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer with action button */}
          <div
            style={{
              marginTop: "16px",
              paddingTop: "16px",
              borderTop: "1px solid #2a3f5f",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              onClick={() => setValidationModalVisible(false)}
              size="large"
              style={{
                minWidth: "100px",
                height: "38px",
                fontSize: "14px",
                fontWeight: "500",
                backgroundColor: "#ff4d4f",
                borderColor: "#ff4d4f",
                color: "#ffffff",
              }}
              type="primary"
            >
              Got it
            </Button>
          </div>
        </div>
      </Modal>

      {/* Ant Design Alert */}
      {alert.show && (
        <div style={{ padding: "16px" }}>
          <Alert
            message={alert.type === "success" ? "Success!" : "Error!"}
            description={alert.message}
            type={alert.type === "success" ? "success" : "error"}
            showIcon
            closable
            onClose={() => setAlert({ show: false, type: "", message: "" })}
            style={{ marginBottom: "16px" }}
          />
        </div>
      )}

      {/* start page title */}
      <div className="page-title-box">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-sm-6">
              <div className="page-title">
                <h4>Car Intake</h4>
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item">
                    <a href="javascript: void(0);">Scrap Yard</a>
                  </li>
                  <li className="breadcrumb-item">
                    <a href="javascript: void(0);">Car Intake</a>
                  </li>
                  <li className="breadcrumb-item active">Add New Car</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* end page title */}

      <div className="container-fluid">
        <div className="page-content-wrapper">
          <Card
            title={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Add New Car to Scrap Yard</span>
                <span style={{ fontSize: 12, color: "#9CA3AF" }}>
                  {stepSaveStatus[currentStep]?.status === "saving"
                    ? `Saving step ${currentStep}...`
                    : stepSaveStatus[currentStep]?.status
                      ? `Status: ${stepSaveStatus[currentStep].status}`
                      : null}
                </span>
              </div>
            }
          >
            <div id="progrss-wizard" className="twitter-bs-wizard">
              <ul className="twitter-bs-wizard-nav nav-justified">
                <li className="nav-item">
                  <div
                    className={`nav-link ${currentStep === 1 ? "active" : ""}`}
                  >
                    <span className="step-number">01. Car Details</span>
                  </div>
                </li>
                <li className="nav-item">
                  <div
                    className={`nav-link ${currentStep === 2 ? "active" : ""}`}
                  >
                    <span className="step-number">02. Car Images</span>
                  </div>
                </li>
                <li className="nav-item">
                  <div
                    className={`nav-link ${currentStep === 3 ? "active" : ""}`}
                  >
                    <span className="step-number">03. Car Diagnosis</span>
                  </div>
                </li>
                <li className="nav-item">
                  <div
                    className={`nav-link ${currentStep === 4 ? "active" : ""}`}
                  >
                    <span className="step-number">04. Car Price</span>
                  </div>
                </li>
                <li className="nav-item">
                  <div
                    className={`nav-link ${currentStep === 5 ? "active" : ""}`}
                  >
                    <span className="step-number">05. User Identification & Car Doc</span>
                  </div>
                </li>
                <li className="nav-item">
                  <div
                    className={`nav-link ${currentStep === 6 ? "active" : ""}`}
                  >
                    <span className="step-number">06. Payment</span>
                  </div>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link ${currentStep === 7 ? "active" : ""}`}
                  >
                    <span className="step-number">
                      07. Car & Parts Inventory
                    </span>
                  </a>
                </li>
              </ul>
              <div id="bar" className="progress mt-4">
                <div
                  className="progress-bar bg-success progress-bar-striped progress-bar-animated"
                  style={{
                    width: `${(currentStep / 7) * 100}%`,
                  }}
                ></div>
              </div>
              {/* Car summary shown under the progress bar in a Card */}
              <Card
                size="small"
                bodyStyle={{
                  background: "linear-gradient(90deg,#071426 0%, #071120 100%)",
                  display: "flex",
                  gap: 24,
                  padding: "14px 18px",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                }}
                style={{
                  marginTop: 16,
                  marginBottom: 16,
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                {/* Left: title */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div>
                    <div style={{ color: "#9CA3AF", fontSize: 12 }}>
                      Vehicle Summary
                    </div>
                    <div
                      style={{
                        color: "#ffffff",
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      {formData.vin || vinData?.vin
                        ? formData.vin || vinData?.vin
                        : "No VIN"}
                    </div>
                  </div>
                </div>

                {/* Right: fields grid */}
                <div
                  style={{
                    display: "flex",
                    gap: 28,
                    alignItems: "center",
                    flexWrap: "wrap",
                    marginLeft: 8,
                  }}
                >
                  <div style={{ minWidth: 110 }}>
                    <div style={{ color: "#9CA3AF", fontSize: 12 }}>Make</div>
                    <div
                      style={{
                        color: "#ffffff",
                        fontSize: 16,
                        fontWeight: 700,
                      }}
                    >
                      {formData.make || vinData?.Make || "—"}
                    </div>
                  </div>

                  <div style={{ minWidth: 110 }}>
                    <div style={{ color: "#9CA3AF", fontSize: 12 }}>Model</div>
                    <div
                      style={{
                        color: "#ffffff",
                        fontSize: 16,
                        fontWeight: 700,
                      }}
                    >
                      {formData.model || vinData?.Model || "—"}
                    </div>
                  </div>

                  <div style={{ minWidth: 110 }}>
                    <div style={{ color: "#9CA3AF", fontSize: 12 }}>Trim</div>
                    <div
                      style={{
                        color: "#ffffff",
                        fontSize: 16,
                        fontWeight: 700,
                      }}
                    >
                      {formData.trim || vinData?.Trim || "—"}
                    </div>
                  </div>

                  <div style={{ minWidth: 90 }}>
                    <div style={{ color: "#9CA3AF", fontSize: 12 }}>Year</div>
                    <div
                      style={{
                        color: "#ffffff",
                        fontSize: 16,
                        fontWeight: 700,
                      }}
                    >
                      {formData.year ||
                        vinData?.ModelYear ||
                        vinData?.year ||
                        "—"}
                    </div>
                  </div>
                </div>
              </Card>
              <div className="tab-content twitter-bs-wizard-tab-content custom-tab-content">
                <div className="tab-pane active custom-tab-pane">
                  <Form
                    form={form}
                    layout="vertical"
                    initialValues={formData}
                    onValuesChange={(changedValues) => {
                      // Only update local state on input changes.
                      // Saving to backend happens explicitly on Next/Submit.
                      updateFormData(changedValues);
                    }}
                    onFinish={() => {
                      // form submission
                      nextStep();
                    }}
                    onFinishFailed={(errorInfo) => {
                      console.warn("Form validation failed:", errorInfo);
                    }}
                  >
                    {renderStepContent()}
                  </Form>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

// Step 7: Car & Parts Inventory Component

export default CarIntake;
