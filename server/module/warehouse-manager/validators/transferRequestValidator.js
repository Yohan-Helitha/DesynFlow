// validators/transferRequestValidator.js

export const validateTransferRequestInsert = (data) => {
  const errors = {};

  // Required fields
  const requiredFields = ["materialId", "fromLocation", "toLocation", "quantity", "reason", "requiredBy"];
  requiredFields.forEach((field) => {
    if (!data[field] || data[field].toString().trim() === "") {
      errors[field] = `${field} is required`;
    }
  });

  // Quantity validation
  if (data.quantity && (isNaN(data.quantity) || Number(data.quantity) <= 0)) {
    errors.quantity = "Quantity must be a positive number";
  }

  // Required By date validation (must be future date)
  if (data.requiredBy) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // reset time
    const reqDate = new Date(data.requiredBy);

    if (reqDate <= today) {
      errors.requiredBy = "Required By date must be a future date";
    }
  }

  return errors;
};

export const validateTransferRequestUpdate = (data) => {
  const errors = {};

  // All required fields
  const requiredFields = [
    "materialId",
    "fromLocation",
    "toLocation",
    "quantity",
    "reason",
    "requiredBy",
  ];

  requiredFields.forEach((field) => {
    if (!data[field] || data[field].toString().trim() === "") {
      errors[field] = `${field} is required`;
    }
  });

  // Quantity validation
  if (data.quantity && (isNaN(data.quantity) || Number(data.quantity) <= 0)) {
    errors.quantity = "Quantity must be a positive number";
  }

  // Required By date validation (must be future date)
  if (data.requiredBy) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // reset time
    const reqDate = new Date(data.requiredBy);

    if (reqDate <= today) {
      errors.requiredBy = "Required By date must be a future date";
    }
  }

  return errors;
};