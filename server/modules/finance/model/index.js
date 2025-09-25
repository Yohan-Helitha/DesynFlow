// This file is intentionally left blank to resolve module import errors.// Central finance model loader to guarantee registration order

import './project.js';
import './material.js';
import './expenses.js';
import './finance_summary.js';
import './notification.js';
import './quotation_estimation.js';
import './payment.js';
import './project_estimation.js';
import './inspection_estimation.js';
import './warrenty.js';
import './warrenty_claim.js';
import './purchase_order.js';
import './supplier_material_catalog.js';
import './user.js';

// No exports needed; side-effect imports register models with mongoose.
// Import this index once (e.g., in app.js) before routes.