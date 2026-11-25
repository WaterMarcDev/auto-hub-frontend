// Persons entering the yard with a check-in's customer (Number of Persons).
import { US_PHONE_REGEX } from "./phone";

export const emptyPerson = () => ({ fullName: "", mobileNo: "", signature: "" });

// True when every detail of a person is filled in and valid.
export const isPersonComplete = (p) =>
  Boolean(
    p &&
      String(p.fullName || "").trim() &&
      US_PHONE_REGEX.test(String(p.mobileNo || "")) &&
      String(p.signature || "").trim()
  );

// The persons' details saved on a check-in.
export const personsList = (checkIn) =>
  Array.isArray(checkIn?.persons) ? checkIn.persons : [];
