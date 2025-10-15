import SampleService from '../service/sample.service.js';

// Supplier uploads sample
export const uploadSample = async (req, res) => {
  try {
    const sample = await SampleService.uploadSample(req.body);
    res.status(201).json(sample);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Management reviews sample
export const reviewSample = async (req, res) => {
  try {
    const sample = await SampleService.reviewSample(req.params.id, req.body);
    res.status(200).json(sample);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get samples for a supplier
export const getSamples = async (req, res) => {
  try {
    const samples = await SampleService.getSamples(req.params.supplierId);
    res.status(200).json(samples);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all samples (for procurement officer view)
export const getAllSamples = async (req, res) => {
  try {
    const samples = await SampleService.getAllSamples();
    res.status(200).json(samples);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
