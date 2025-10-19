export const validateSubmitReportInsertMW = (req, res, next) => {
  const errors = {};

  if (!req.body.reportTitle || req.body.reportTitle.trim() === "") {
    errors.reportTitle = "Report title is required";
  } else if (req.body.reportTitle.length > 100) {
    errors.reportTitle = "Report title should not exceed 100 characters";
  }

  if (!req.file) errors.reportFileUrl = "Report file is required";

  if (Object.keys(errors).length > 0) return res.status(400).json({ errors });
  next();
};

export const validateSubmitReportUpdateMW = (req, res, next) => {
  const errors = {};
  if (req.body.reportTitle && req.body.reportTitle.length > 100) {
    errors.reportTitle = "Report title should not exceed 100 characters";
  }
  next();
};
