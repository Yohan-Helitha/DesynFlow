// validators/invLocationValidator.js

// Example country codes mapping
const countryCodes = {
  "Sri Lanka": { code: "+94", digits: 11 },    // e.g., +94712345678
  "USA": { code: "+1", digits: 11 },           // e.g., +11234567890
  "UK": { code: "+44", digits: 12 },           // e.g., +447123456789
  "India": { code: "+91", digits: 12 },        // e.g., +911234567890
  "Canada": { code: "+1", digits: 11 },        // e.g., +11234567890
  "Australia": { code: "+61", digits: 11 } ,
  "Germany": {code: "+49", digits: 12}    // e.g., +61123456789
};

// Pass `existingInventories` as array of objects from DB to check uniqueness
export const validateInvLocationsInsert = (data, existingInventories = []) => {
  const errors = {};

  // Required fields
  const requiredFields = [
    "inventoryName",
    "inventoryAddress",
    "country",
    "capacity",
    "inventoryContact",
    "warehouseManagerName",
  ];

  requiredFields.forEach((field) => {
    if (!data[field] || data[field].toString().trim() === "") {
      errors[field] = `${field} is required`;
    }
  });

  // Numeric validations
  if (data.capacity && isNaN(Number(data.capacity))) {
    errors.capacity = "Capacity must be a number";
  }

  // Contact number validations
  if (data.country && data.inventoryContact) {
    const country = countryCodes[data.country];
    if (country) {
      // Remove '+' if user typed it
      const contactNumber = data.inventoryContact.replace(/^\+/, "");

      // Check starts with country code
      if (!contactNumber.startsWith(country.code.replace("+", ""))) {
        errors.inventoryContact = `Contact must start with ${country.code}`;
      }

      // Check total length
      if (contactNumber.length !== country.digits) {
        errors.inventoryContact = `Contact number must be ${country.digits} digits including country code`;
      }

      // Only numbers allowed
      if (!/^\d+$/.test(contactNumber)) {
        errors.inventoryContact = "Contact must contain only numbers";
      }
    } else {
      errors.country = "Country not supported";
    }
  }

  // Uniqueness check
  if (existingInventories.length > 0) {
    const nameExists = existingInventories.some(
      (inv) =>
        inv.inventoryName.toLowerCase() === data.inventoryName.toLowerCase()
    );
    if (nameExists) errors.inventoryName = "Inventory name already exists";

    const addressExists = existingInventories.some(
      (inv) =>
        inv.inventoryAddress.toLowerCase() ===
        data.inventoryAddress.toLowerCase()
    );
    if (addressExists) errors.inventoryAddress = "Address already exists";

    const contactExists = existingInventories.some(
      (inv) => inv.inventoryContact === data.inventoryContact
    );
    if (contactExists) errors.inventoryContact = "Contact already exists";
  }

  return errors;
};


export const validateInvLocationsUpdate = (data, existingInventories = [], currentId) => {
  const errors = {};

  // Required fields
  const requiredFields = [
    "inventoryName",
    "inventoryAddress",
    "country",
    "capacity",
    "inventoryContact",
    "warehouseManagerName",
  ];

  requiredFields.forEach((field) => {
    if (!data[field] || data[field].toString().trim() === "") {
      errors[field] = `${field} is required`;
    }
  });

  // Numeric validation
  if (data.capacity && isNaN(Number(data.capacity))) {
    errors.capacity = "Capacity must be a number";
  }

  // Contact number validations
  if (data.country && data.inventoryContact) {
    const country = countryCodes[data.country];
    if (country) {
      const contactNumber = data.inventoryContact.replace(/^\+/, "");

      if (!contactNumber.startsWith(country.code.replace("+", ""))) {
        errors.inventoryContact = `Contact must start with ${country.code}`;
      }

      if (contactNumber.length !== country.digits) {
        errors.inventoryContact = `Contact number must be ${country.digits} digits including country code`;
      }

      if (!/^\d+$/.test(contactNumber)) {
        errors.inventoryContact = "Contact must contain only numbers";
      }
    } else {
      errors.country = "Country not supported";
    }
  }

  existingInventories.forEach(inv => {
    if (inv._id === currentId) return; // skip self

    // Instance 1: same name, address, country, capacity, same manager → check contact
    if (
      inv.inventoryName === inventoryName &&
      inv.inventoryAddress === inventoryAddress &&
      inv.country === country &&
      inv.capacity === capacity &&
      inv.warehouseManagerName === warehouseManagerName &&
      inv.inventoryContact !== inventoryContact
    ) {
      if (existingInventories.some(i => i.inventoryContact === inventoryContact)) {
        errors.inventoryContact = "Contact must be unique in this scenario";
      }
    }

    // Instance 4: different name, same address, country, capacity, contact, manager → check name
    if (
      inv.inventoryAddress === inventoryAddress &&
      inv.country === country &&
      inv.capacity === capacity &&
      inv.inventoryContact === inventoryContact &&
      inv.warehouseManagerName === warehouseManagerName &&
      inv.inventoryName !== inventoryName
    ) {
      if (existingInventories.some(i => i.inventoryName === inventoryName)) {
        errors.inventoryName = "Inventory name must be unique";
      }
    }

    // Instance 5: same name, different address, same country, same capacity, different contact, same manager → check address
    if (
      inv.inventoryName === inventoryName &&
      inv.country === country &&
      inv.capacity === capacity &&
      inv.warehouseManagerName === warehouseManagerName &&
      inv.inventoryAddress !== inventoryAddress
    ) {
      if (existingInventories.some(i => i.inventoryAddress === inventoryAddress)) {
        errors.inventoryAddress = "Inventory address must be unique";
      }
    }
  });

   
  

  return errors;
};