import React, { useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import { carIntakeAPI, vinAPI } from "../utils/api";
import { Form, message, Alert, Card, Modal, Input, Button, Spin } from "antd";
import { useNavigate } from "react-router-dom";
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
  const [stepSaveStatus, setStepSaveStatus] = useState({});
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
    engineNo: "",
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
    carRC: null,
    sellingDate: dayjs(),
    pickUpType: "You Pull",

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
            engineNo: stepData.engineNo,
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
              engineNo: stepData.engineNo,
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
            // individual upload fields (`dlDocument`, `carRC`). This ensures
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
              stepData.carRC &&
              stepData.carRC.uploaded &&
              stepData.carRC.url
            ) {
              documents.carRegistration = stepData.carRC.url;
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
            };
            // If an existing seller was selected, tell backend to attach by id
            if (stepData.sellerId) {
              payload.sellerId = stepData.sellerId;
              // avoid sending sellerData when attaching existing seller
              delete payload.sellerData;
            }
          } else if (step === 6) {
            // Payment component uses form fields named `paidTo` and `finalPrice`.
            // Normalize to backend expected keys: `paymentMethod` and `paidAmount`.
            payload = {
              paymentMethod: stepData.paidTo || stepData.paymentMethod,
              paidAmount:
                // prefer numeric finalPrice, fallback to paymentAmount or paidAmount
                stepData.finalPrice !== undefined && stepData.finalPrice !== ""
                  ? parseFloat(stepData.finalPrice)
                  : stepData.paymentAmount !== undefined
                  ? parseFloat(stepData.paymentAmount)
                  : stepData.paidAmount,
              paymentDescription: stepData.paymentDescription,
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
      const populated = {};
      if (car.carDetails) {
        populated.year = car.carDetails.year || formData.year;
        populated.make = car.carDetails.make || formData.make;
        populated.model = car.carDetails.model || formData.model;
        populated.trim = car.carDetails.trim || formData.trim;
        populated.color = car.carDetails.color || formData.color;
        populated.bodyClass = car.carDetails.bodyClass || formData.bodyClass;
        populated.chassisNo = car.carDetails.chassisNo || formData.chassisNo;
        populated.engineNo = car.carDetails.engineNo || formData.engineNo;
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
        // KYC component shows uploaded status for driver license and RC.
        const docs = car.kyc.documents || {};
        populated.documents = docs || formData.documents;
        if (docs.driversLicense) {
          populated.dlDocument = {
            url: docs.driversLicense,
            uploaded: true,
            name: docs.driversLicense.split("/").pop(),
          };
        }
        if (docs.carRegistration) {
          populated.carRC = {
            url: docs.carRegistration,
            uploaded: true,
            name: docs.carRegistration.split("/").pop(),
          };
        }
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
        message: `Year must be between 1900 and ${
          new Date().getFullYear() + 1
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
        return true;
      }

      message.error("Failed to fetch VIN details");
      return false;
    } catch (error) {
      console.error("VIN fetch error:", error);
      message.error(
        "Error fetching VIN details: " +
          (error.response?.data?.error || error.message)
      );
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
          "carRC",
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
      engineNo: "",
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
      carRC: null,
      sellingDate: dayjs(),
      pickUpType: "You Pull",
      kycDescription: "",

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
      // Force form to show validation errors by scrolling to first error
      form.scrollToField(errorInfo.errorFields[0].name);
      // Ant Design will automatically show the validation errors
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
      if (formData.carRC && formData.carRC.uploaded && formData.carRC.url) {
        documents.carRegistration = formData.carRC.url;
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
        engineNo: formData.engineNo,
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

      // Ensure backend receives status indicating payment step completed
      if (STEP_STATUS_MAP[6]) submitData.status = STEP_STATUS_MAP[6];

      // Attach status for payment step so backend transitions workflow
      if (STEP_STATUS_MAP[6]) {
        submitData.status = STEP_STATUS_MAP[6];
      }

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
      message.error(`Error submitting form: ${error.message}`);
      showAlert("danger", `Error submitting form: ${error.message}`);
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
                }}
              />
            </Form.Item>
          </Form>
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
                    <span className="step-number">05. User KYC & Car Doc</span>
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
