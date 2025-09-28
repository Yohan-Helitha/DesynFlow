// formValidation.js - Simple validation helpers

// Email validation
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return "Email is required";
  if (!regex.test(email)) return "Invalid email address";
  return "";
};

// Phone validation
export const validatePhone = (phone) => {
  const regex = /^[0-9]{7,15}$/;
  if (!phone) return "Phone number is required";
  if (!regex.test(phone)) return "Invalid phone number";
  return "";
};

// Required field validation
export const validateRequired = (value, fieldName) => {
  if (!value || value.toString().trim() === "") {
    return `${fieldName} is required`;
  }
  return "";
};

// Main form validation
export const validateInspectionRequestForm = (formData) => {
  const errors = {};

  errors.client_name = validateRequired(formData.client_name, "Full name");
  errors.email = validateEmail(formData.email);
  errors.phone_number = validatePhone(formData.phone_number);
  errors.propertyLocation_address = validateRequired(formData.propertyLocation_address, "Property address");
  errors.propertyLocation_city = validateRequired(formData.propertyLocation_city, "City");

  if (!formData.propertyType) {
    errors.propertyType = "Property type is required";
  }

  if (!formData.number_of_room || formData.number_of_room < 1) {
    errors.number_of_room = "Number of rooms must be at least 1";
  }

  if (!formData.number_of_floor || formData.number_of_floor < 1) {
    errors.number_of_floor = "Number of floors must be at least 1";
  }

  // remove empty errors
  Object.keys(errors).forEach((key) => {
    if (!errors[key]) delete errors[key];
  });

  return errors;
};

// Helper to check if form has any error
export const hasFormErrors = (errors) => {
  return Object.values(errors).some(msg => msg);
};
