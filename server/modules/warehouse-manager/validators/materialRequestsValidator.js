export const validateMaterialRequestUpdate = (data) => {
  const errors = {};
  // For updates, only status or warehouseNote may be updated
  if (data.status && !["Pending", "Approved", "Rejected", "PartiallyApproved", "Fulfilled"].includes(data.status)) {
    errors.status = "Invalid status";
  }
  return errors;
};