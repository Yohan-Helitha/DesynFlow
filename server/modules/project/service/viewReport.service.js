import AuthInspectionReport from '../../auth/model/report.model.js';

export const getSubmittedInspectionReport = async (inspectionRequestId) => {
	
    if(!inspectionRequestId) {

        throw new Error('inspectionRequestId is required');
    }

    const report = await InspectionReport.findOne({
        inspectionRequestId,
        status: 'Submitted'
    });

    return report;

};
