// validators/stockMovementValidator.js

export const validateStockMovementInsert = (data, availableLocations = []) => {
  const errors = {};

  // Required fields
  const requiredFields = [
    "materialId",
    "fromLocation",
    "toLocation",
    "unit",
    "quantity",
    "reason",
    "employeeId",
    "vehicleInfo",
    "dispatchedDate",
  ];

  requiredFields.forEach((field) => {
    if (!data[field] || data[field].toString().trim() === "") {
      errors[field] = `${field} is required`;
    }
  });

  // Quantity must be a number > 0
  if (data.quantity && (isNaN(Number(data.quantity)) || Number(data.quantity) <= 0)) {
    errors.quantity = "Quantity must be a positive number";
  }

  // FromLocation must have materialId available
  if (data.materialId && data.fromLocation) {
    const validLocations = availableLocations.filter((loc) =>
      loc.materials?.includes(data.materialId)
    );

    const locationExists = validLocations.some(
      (loc) => loc.inventoryName === data.fromLocation
    );

    if (!locationExists) {
      errors.fromLocation = "Selected From Location does not have this material";
    }
  }

  // ToLocation cannot be same as FromLocation
  if (data.fromLocation && data.toLocation && data.fromLocation === data.toLocation) {
    errors.toLocation = "From and To locations cannot be the same";
  }

  // Unit validation
  const allowedUnits = ["pcs", "kg", "m"];
  if (data.unit && !allowedUnits.includes(data.unit)) {
    errors.unit = "Invalid unit selected";
  }

  // Date validation → only today or past 3 days allowed
  if (data.dispatchedDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const inputDate = new Date(data.dispatchedDate);
    inputDate.setHours(0, 0, 0, 0);

    const diffDays = (today - inputDate) / (1000 * 60 * 60 * 24);

    if (inputDate > today) {
      errors.dispatchedDate = "Future dates are not allowed";
    } else if (diffDays > 3) {
      errors.dispatchedDate = "Only today and up to 3 days before today are allowed";
    }
  }

  return errors;
};


export const validateStockMovementUpdate = (data) => {
  const errors = {};

  // Required fields
  const requiredFields = [
    "materialId",
    "fromLocation",
    "toLocation",
    "unit",
    "quantity",
    "reason",
    "employeeId",
    "vehicleInfo",
    "dispatchedDate",
  ];

  requiredFields.forEach((field) => {
    if (!data[field] || data[field].toString().trim() === "") {
      errors[field] = `${field} is required`;
    }
  });

  // Quantity must be a number > 0
  if (data.quantity !== undefined) {
    if (isNaN(data.quantity) || Number(data.quantity) <= 0) {
      errors.quantity = "Quantity must be a positive number";
    }
  }

  // From and To location cannot be the same
  if (data.fromLocation && data.toLocation && data.fromLocation === data.toLocation) {
    errors.toLocation = "From Location and To Location cannot be the same";
  }

  // Dispatched Date validation: only today or last 3 days allowed
  if (data.dispatchedDate && data.isDispatchedDateChanged) {
    const selectedDate = new Date(data.dispatchedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const minDate = new Date(today);
    minDate.setDate(today.getDate() - 3);

    if (selectedDate < minDate || selectedDate > today) {
      errors.dispatchedDate = "Dispatched Date must be today or within the last 3 days";
    }
  }

  return errors;
};