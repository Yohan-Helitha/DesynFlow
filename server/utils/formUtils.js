
// Example: Validate required fields in a form object
export function validateRequiredFields(formData, requiredFields) {
	for (const field of requiredFields) {
		if (!formData.hasOwnProperty(field) || formData[field] === undefined || formData[field] === null || formData[field] === '') {
			return { valid: false, missing: field };
		}
	}
	return { valid: true };
}

// Example: Sanitize form data (basic)
export function sanitizeFormData(formData) {
	const sanitized = {};
	for (const key in formData) {
		if (typeof formData[key] === 'string') {
			sanitized[key] = formData[key].trim();
		} else {
			sanitized[key] = formData[key];
		}
	}
	return sanitized;
}

// Example: Compare two forms for changes
export function diffForms(oldForm, newForm) {
	const changes = {};
	for (const key in newForm) {
		if (oldForm[key] !== newForm[key]) {
			changes[key] = { from: oldForm[key], to: newForm[key] };
		}
	}
	return changes;
}
