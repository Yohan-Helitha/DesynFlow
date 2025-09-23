import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyDetailsForm from '../components/forms/PropertyDetailsForm';
import FloorManagement from '../components/forms/FloorManagement';
import DocumentUpload from '../components/forms/DocumentUpload';
import ProgressBar from '../components/ui/ProgressBar';
import './InspectionRequestForm.css';

const InspectionRequestForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Details
    clientName: '',
    email: '',
    phone: '',
    propertyLocation: {
      address: '',
      city: '',
      state: '',
      zipCode: '',
      coordinates: { lat: null, lng: null }
    },
    propertyType: '',
    numberOfFloors: 1,
    
    // Floor & Room Details
    floors: [],
    
    // Inspection Preferences
    preferredInspectionDate: '',
    alternativeDate1: '',
    alternativeDate2: '',
    
    // Documents
    documents: [],
    
    // Additional Info
    specialInstructions: '',
    urgency: 'normal'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const totalSteps = 3; // Property Details, Floor Management, Document Upload

  // Calculate form progress
  const getCompletionPercentage = () => {
    let completed = 0;
    let total = 4;

    // Step 1: Basic Details
    if (formData.clientName && formData.email && formData.phone && 
        formData.propertyLocation.address && formData.propertyType && 
        formData.preferredInspectionDate) {
      completed++;
    }

    // Step 2: Floor Details
    if (formData.floors.length > 0) {
      completed++;
    }

    // Step 3: Documents
    if (formData.documents.length > 0) {
      completed++;
    }

    // Step 4: Rooms (if multi-floor)
    if (formData.numberOfFloors === 1 || 
        formData.floors.some(floor => floor.rooms && floor.rooms.length > 0)) {
      completed++;
    }

    return Math.round((completed / total) * 100);
  };

  // Navigation handlers
  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const goToStep = (step) => {
    if (step <= currentStep + 1) { // Allow going to next step or any previous step
      setCurrentStep(step);
    }
  };

  // Validation
  const validateCurrentStep = () => {
    const stepErrors = {};
    
    if (currentStep === 1) {
      // Basic Details Validation
      if (!formData.clientName.trim()) stepErrors.clientName = 'Client name is required';
      if (!formData.email.trim()) stepErrors.email = 'Email is required';
      if (!formData.email.includes('@')) stepErrors.email = 'Invalid email format';
      if (!formData.phone.trim()) stepErrors.phone = 'Phone number is required';
      if (!formData.propertyLocation.address.trim()) stepErrors.address = 'Property address is required';
      if (!formData.propertyType) stepErrors.propertyType = 'Property type is required';
      if (!formData.preferredInspectionDate) stepErrors.preferredInspectionDate = 'Preferred inspection date is required';
      
      // Date validation
      const selectedDate = new Date(formData.preferredInspectionDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        stepErrors.preferredInspectionDate = 'Inspection date cannot be in the past';
      }
    }

    if (currentStep === 2) {
      // Floor Management Validation
      if (formData.floors.length === 0) {
        stepErrors.floors = 'At least one floor must be defined';
      }
      
      // Validate each floor has at least one room for multi-room properties
      if (['house', 'hotel', 'office'].includes(formData.propertyType)) {
        const floorsWithoutRooms = formData.floors.filter(floor => !floor.rooms || floor.rooms.length === 0);
        if (floorsWithoutRooms.length > 0) {
          stepErrors.rooms = `Please add rooms to all floors`;
        }
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  // Form submission
  const submitForm = async () => {
    if (!validateCurrentStep()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/inspection-request/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // Success - redirect to dashboard or confirmation
        navigate(`/inspection-request/confirmation/${data.request._id}`, {
          state: { requestData: data.request }
        });
      } else {
        setErrors({ submit: data.message || 'Failed to submit request' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Auto-save draft (optional)
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      // Save to localStorage as draft
      localStorage.setItem('inspectionFormDraft', JSON.stringify(formData));
    }, 2000);

    return () => clearTimeout(saveTimer);
  }, [formData]);

  // Load draft on component mount
  useEffect(() => {
    const draft = localStorage.getItem('inspectionFormDraft');
    if (draft) {
      try {
        const draftData = JSON.parse(draft);
        setFormData(draftData);
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, []);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PropertyDetailsForm
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
          />
        );
      case 2:
        return (
          <FloorManagement
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
          />
        );
      case 3:
        return (
          <DocumentUpload
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            setErrors={setErrors}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="inspection-request-form">
      <div className="form-container">
        {/* Header */}
        <div className="form-header">
          <h1>Property Inspection Request</h1>
          <p>Complete the form below to request a professional property inspection</p>
        </div>

        {/* Progress Bar */}
        <ProgressBar
          currentStep={currentStep}
          totalSteps={totalSteps}
          completionPercentage={getCompletionPercentage()}
          onStepClick={goToStep}
          steps={[
            'Property Details',
            'Floor & Room Layout',
            'Documents & Photos'
          ]}
        />

        {/* Form Content */}
        <div className="form-content">
          {renderCurrentStep()}
        </div>

        {/* Form Navigation */}
        <div className="form-navigation">
          <div className="nav-buttons">
            {currentStep > 1 && (
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={prevStep}
                disabled={loading}
              >
                Previous
              </button>
            )}
            
            <div className="nav-right">
              {currentStep < totalSteps ? (
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={nextStep}
                  disabled={loading}
                >
                  Next Step
                </button>
              ) : (
                <button 
                  type="button" 
                  className="btn btn-success"
                  onClick={submitForm}
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              )}
            </div>
          </div>

          {/* Error Display */}
          {errors.submit && (
            <div className="error-message">
              {errors.submit}
            </div>
          )}

          {/* Draft Save Indicator */}
          <div className="draft-indicator">
            <small>✓ Draft saved automatically</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionRequestForm;
