// validators/disposalMaterialsValidator.js

export const validateDisposalMaterialInsert = (data) => {
  const errors = {};

  const requiredFields = [
    "materialId",
    "materialName",
    "inventoryName",
    "quantity",
    "unit",
    "reasonOfDisposal",
  ];

  // Required field validation
  requiredFields.forEach((field) => {
    if (!data[field] || data[field].toString().trim() === "") {
      errors[field] = `${field} is required`;
    }
  });

  // Numeric validation for quantity
  if (data.quantity != null) {
    const qty = Number(data.quantity);
    if (isNaN(qty) || qty <= 0) {
      errors.quantity = "Quantity must be a positive number";
    }
  }

  return errors;
};

export const validateDisposalMaterialUpdate = (data) => {
  const errors = {};

  // Similar rules can apply for update
  if (data.quantity != null) {
    const quantity = Number(data.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      errors.quantity = "Quantity must be a positive number";
    }
  }

  return errors;
};