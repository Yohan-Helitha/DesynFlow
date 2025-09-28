// FormValidation.jsx - Simple reusable form helpers
import React from "react";

// ✅ Error message component
export const ErrorMessage = ({ error }) => {
  if (!error) return null;
  return (
    <p className="text-red-500 text-sm mt-1">
      ⚠️ {error}
    </p>
  );
};

// ✅ Success message component
export const SuccessMessage = ({ message }) => {
  if (!message) return null;
  return (
    <p className="text-green-500 text-sm mt-1">
      ✅ {message}
    </p>
  );
};

// ✅ Generic form field wrapper
export const FormField = ({
  type = "text",
  name,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  options = [] // for dropdowns
}) => {
  const inputClasses = `w-full p-2 border rounded ${
    error ? "border-red-500" : "border-gray-300"
  } focus:outline-none focus:border-blue-500`;

  return (
    <div className="mb-4">
      {type === "select" ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={inputClasses}
          required={required}
        >
          <option value="">Select...</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={inputClasses}
          required={required}
          rows={3}
        />
      ) : (
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={inputClasses}
          required={required}
        />
      )}
      <ErrorMessage error={error} />
    </div>
  );
};
