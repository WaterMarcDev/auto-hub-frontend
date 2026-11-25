// Every free-text description a Car Intake can hold, with the step it was
// entered in, so lists and the details page can show them all.
const INTAKE_DESCRIPTION_FIELDS = [
  { label: "Car Description", get: (c) => c?.carDetails?.description },
  { label: "Images Description", get: (c) => c?.imagesStep?.imageDescription },
  { label: "Parts Description", get: (c) => c?.partDetails?.partsDescription },
  { label: "Price Description", get: (c) => c?.price?.priceDescription },
  { label: "KYC Description", get: (c) => c?.kyc?.kycDescription },
  { label: "Payment Description", get: (c) => c?.payment?.paymentDescription },
  { label: "Scrap Remarks", get: (c) => c?.scrapRemarks },
];

const text = (v) => (typeof v === "string" ? v.trim() : v ? String(v) : "");

// [{ label, value }] for every description field ("" when empty).
export const getIntakeDescriptions = (car) =>
  INTAKE_DESCRIPTION_FIELDS.map((f) => ({ label: f.label, value: text(f.get(car)) }));

// Only the descriptions that were filled in.
export const getFilledIntakeDescriptions = (car) =>
  getIntakeDescriptions(car).filter((d) => d.value);
