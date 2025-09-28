// validators/sReorderRequestValidator.js

export const validateSReorderRequestInsert = (data) => {
  const errors = {};

  // Required fields
  const requiredFields = [
    "inventoryId",
    "inventoryName",
    "inventoryAddress",
    "inventoryContact",
    "materialId",
    "materialName",
    "quantity",
    "type",
    "unit",
    "expectedDate",
    "warehouseManagerName"
  ];

  requiredFields.forEach((field) => {
    if (!data[field] || data[field].toString().trim() === "") {
      errors[field] = `${field} is required`;
    }
  });

  // Quantity validation (positive number)
  if (data.quantity && (isNaN(data.quantity) || Number(data.quantity) <= 0)) {
    errors.quantity = "Quantity must be a positive number";
  }

  // Expected date validation (must be future date)
  if (data.expectedDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(data.expectedDate);

    if (expDate <= today) {
      errors.expectedDate = "Expected date must be a future date";
    }
  }

  return errors;
};

export const validateSReorderRequestUpdate = (data) => {
  // For update, same rules
  return validateSReorderRequestInsert(data);
};
