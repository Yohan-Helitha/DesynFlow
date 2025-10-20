export const validateWarehouseNotification = (data) => {
  const errors = {};
  if (!data.type) errors.type = "Type is required";
  if (!data.title) errors.title = "Title is required";
  return errors;
};
