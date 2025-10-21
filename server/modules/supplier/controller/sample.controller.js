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

// Get single sample by ID
export const getSampleById = async (req, res) => {
  try {
    const sample = await SampleService.getSampleById(req.params.id);
    if (!sample) {
      return res.status(404).json({ error: 'Sample not found' });
    }
    res.status(200).json(sample);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get samples for the currently authenticated supplier
export const getMySamples = async (req, res) => {
  try {
    // Get current user from JWT token, session, or headers
    let userId = req.user?.id || req.session?.user?.id;
    let userEmail = req.user?.email || req.session?.user?.email;
    
    // Try to get from headers (sent by frontend)
    let supplierId = null;
    if (!userId && !userEmail) {
      const userDataHeader = req.headers['x-user-data'];
      if (userDataHeader) {
        try {
          const userData = JSON.parse(userDataHeader);
          console.log('User data from header:', userData);
        
          // Check if this is a supplier ID based on userType
          if (userData.userType === 'supplier' && userData.id) {
            console.log('User data indicates this is a supplier, using ID directly:', userData.id);
            supplierId = userData.id;
          } else {
            // Store for traditional user lookup
            userId = userData.id;
            userEmail = userData.email;
          }
        } catch (parseErr) {
          console.error('Error parsing user data header:', parseErr);
        }
      }
    }

    // Only proceed with user lookup if we don't already have supplierId
    if (!supplierId) {
      if (!userId && !userEmail) {
        console.log('No user authentication found');
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // Dynamic import for User model and Supplier model
      const User = (await import('../../auth/model/user.model.js')).default;
      const Supplier = (await import('../model/supplier.model.js')).default;
      
      let user = null;
      if (userId) {
        user = await User.findById(userId);
      } else if (userEmail) {
        user = await User.findOne({ email: userEmail });
      }
      
      console.log('Found user:', user);
      
      if (!user) {
        // If no user found, try to find supplier directly by email
        console.log('No user found, trying to find supplier by email:', userEmail);
        const supplier = await Supplier.findOne({ email: userEmail });
        console.log('Found supplier by email:', supplier ? 'Yes' : 'No');
        
        if (supplier) {
          supplierId = supplier._id;
        } else {
          return res.status(404).json({ error: 'Supplier not found' });
        }
      } else {
        // Find supplier associated with this user
        const supplier = await Supplier.findOne({ email: user.email });
        if (!supplier) {
          return res.status(404).json({ error: 'No supplier associated with this user' });
        }
        supplierId = supplier._id;
      }
    }

    console.log('Getting samples for supplier ID:', supplierId);
    
    // Get samples for this supplier
    const samples = await SampleService.getSamples(supplierId);
    res.status(200).json(samples);
  } catch (err) {
    console.error('Error in getMySamples:', err);
    res.status(400).json({ error: err.message });
  }
};
