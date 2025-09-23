import React from 'react';

const ProgressBar = ({ currentStep, totalSteps, steps }) => {
  return (
    <div className="my-5 px-5">
      <div className="flex justify-between relative">
        {steps.map((step, index) => (
          <div key={index} className="text-center flex-1">
            <div className={`w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center font-bold transition-all duration-300 ${
              index + 1 <= currentStep 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {index + 1}
            </div>
            <div className={`text-sm font-medium ${
              index + 1 <= currentStep ? 'text-blue-600' : 'text-gray-500'
            }`}>
              {step}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
