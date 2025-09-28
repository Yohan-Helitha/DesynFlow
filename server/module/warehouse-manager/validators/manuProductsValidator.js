// validators/manuProductsValidator.js

export const validateManuProductInsert = (data) => {
  const errors = {}; // object, not array

  // Required fields
  const requiredFields = [
    "materialName",
    "category",
    "type",
    "unit",
    "restockLevel",
    "reorderLevel",
    "warrantyPeriod",
    "inventoryName"
  ];

  requiredFields.forEach((field) => {
    if (!data[field] || data[field].toString().trim() === "") {
      errors[field] = `${field} is required`;
    }
  });

  // Numeric validations
  if (data.restockLevel != null && data.reorderLevel != null) {
    const restock = Number(data.restockLevel);
    const reorder = Number(data.reorderLevel);
    const current = Number(data.currentLevel ?? restock);

    if (isNaN(restock) || restock < 0) {
      errors.restockLevel = "Restock level must be a valid non-negative number";
    }
    if (isNaN(reorder) || reorder < 0) {
      errors.reorderLevel = "Reorder level must be a valid non-negative number";
    }
    if (isNaN(current) || current < 0) {
      errors.currentLevel = "Current level must be a valid non-negative number";
    }

    // Business rules
    if (restock <= reorder) {
      errors.reorderLevel = "Reorder level must be less than restock level";
    }

    if (current <= reorder) {
      errors.reorderLevel = "Reorder level must be less than restock level";
    }
  }

  return errors;
};


export const validateManuProductUpdate = (data) => {
  const errors = {}; // use an object instead of array

  if (data.restockLevel != null && data.reorderLevel != null) {
    const restock = Number(data.restockLevel);
    const reorder = Number(data.reorderLevel);
    const current = Number(data.currentLevel);

    // Business rules
    if (restock <= reorder) {
      errors.reorderLevel = "Reorder level must be less than restock level";
    }

  }

  return errors; // return object
};

