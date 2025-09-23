import React from 'react';

const ProgressBar = ({ currentStep, totalSteps, steps }) => {
  return (
    <div className="progress-container">
      <div className="progress-bar">
        {steps.map((step, index) => (
          <div key={index} className={`progress-step ${index + 1 <= currentStep ? 'active' : ''}`}>
            <div className="step-number">{index + 1}</div>
            <div className="step-label">{step}</div>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .progress-container {
          margin: 20px 0;
          padding: 20px;
        }
        
        .progress-bar {
          display: flex;
          justify-content: space-between;
          position: relative;
        }
        
        .progress-step {
          text-align: center;
          flex: 1;
        }
        
        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e0e0e0;
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 8px;
          font-weight: bold;
        }
        
        .progress-step.active .step-number {
          background: #007bff;
          color: white;
        }
        
        .step-label {
          font-size: 14px;
          color: #666;
        }
        
        .progress-step.active .step-label {
          color: #007bff;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default ProgressBar;
