// // validators/validate.js

// const validatorMiddleware = (validatorFn) => {
//   return async (req, res, next) => {
//     try {
//       // Call the validator function with request body and wait for result
//       const errors = await validatorFn(req.body);

//       // If there are validation errors, return 400 response
//       if (errors && errors.length > 0) {
//         return res.status(400).json({ errors });
//       }

//       // Otherwise, continue to the next middleware/controller
//       next();
//     } catch (err) {
//       console.error("Validation middleware error:", err);
//       return res.status(500).json({ message: "Validation error" });
//     }
//   };
// };

// export default validatorMiddleware;
