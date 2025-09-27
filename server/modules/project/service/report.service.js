import Report from '../model/report.model.js';
import Project from '../model/project.model.js';
import Task from '../model/task.model.js';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

// Get project data with tasks
const getProjectWithTasks = async (projectId) => {
  try {
    const project = await Project.findById(projectId);
    const tasks = await Task.find({ projectId: projectId });
    
    return { project, tasks };
  } catch (error) {
    console.error('Error fetching project data:', error);
    return { project: null, tasks: [] };
  }
};

// Calculate project completion
const calculateProjectCompletion = (tasks) => {
  if (tasks.length === 0) return 0;
  const completedTasks = tasks.filter(task => task.status === 'Done').length;
  return Math.round((completedTasks / tasks.length) * 100);
};

// Generate PDF content based on report type
const generateReportHTML = (data, projectData, tasks) => {
  const { project } = projectData;
  const completion = calculateProjectCompletion(tasks);
  const completedTasks = tasks.filter(task => task.status === 'Done');
  const currentDate = new Date().toLocaleDateString();
  
  let taskSection = '';
  if (data.reportType === 'Weekly Progress Report') {
    // Filter tasks completed in the last week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyTasks = completedTasks.filter(task => 
      new Date(task.updatedAt) >= weekAgo
    );
    
    taskSection = `
      <h3>Tasks Completed This Week</h3>
      ${weeklyTasks.length > 0 ? 
        weeklyTasks.map(task => `
          <div class="task-item">
            <strong>${task.name}</strong>
            <p>Assigned to: ${task.assignedTo}</p>
            <p>Completed on: ${new Date(task.updatedAt).toLocaleDateString()}</p>
            ${task.description ? `<p>Description: ${task.description}</p>` : ''}
          </div>
        `).join('') : 
        '<p>No tasks completed this week.</p>'
      }
    `;
  } else {
    taskSection = `
      <h3>All Completed Tasks</h3>
      ${completedTasks.map(task => `
        <div class="task-item">
          <strong>${task.name}</strong>
          <p>Assigned to: ${task.assignedTo}</p>
          <p>Completed on: ${new Date(task.updatedAt).toLocaleDateString()}</p>
          ${task.description ? `<p>Description: ${task.description}</p>` : ''}
        </div>
      `).join('')}
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #8B4513; padding-bottom: 20px; margin-bottom: 30px; }
        .project-info { background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .completion-bar { width: 100%; height: 20px; background-color: #ddd; border-radius: 10px; overflow: hidden; margin: 10px 0; }
        .completion-fill { height: 100%; background-color: #4CAF50; transition: width 0.3s ease; }
        .task-item { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; background-color: #f9f9f9; }
        .summary-section { margin: 20px 0; padding: 15px; border-left: 4px solid #8B4513; background-color: #f8f8f8; }
        h1 { color: #8B4513; }
        h2, h3 { color: #654321; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${data.reportType}</h1>
        <p>Generated on: ${currentDate}</p>
      </div>
      
      <div class="project-info">
        <h2>Project Information</h2>
        <p><strong>Project Name:</strong> ${project?.projectName || 'Unknown Project'}</p>
        <p><strong>Leader:</strong> Team Leader</p>
        <p><strong>Report Period:</strong> ${data.dateStart || 'N/A'} to ${data.dateEnd || 'N/A'}</p>
        
        <h3>Project Completion Status</h3>
        <div class="completion-bar">
          <div class="completion-fill" style="width: ${completion}%"></div>
        </div>
        <p><strong>${completion}% Complete</strong> (${completedTasks.length} of ${tasks.length} tasks completed)</p>
      </div>

      ${data.includeProgress ? `
        <div class="summary-section">
          <h3>Progress Updates</h3>
          <p>${data.summary || 'No progress summary provided.'}</p>
        </div>
      ` : ''}

      ${data.includeIssues ? `
        <div class="summary-section">
          <h3>Issues & Delays</h3>
          <p>Any issues or delays would be documented here based on project status.</p>
        </div>
      ` : ''}

      ${data.includeResourceUsage ? `
        <div class="summary-section">
          <h3>Resource Usage</h3>
          <p>Resource allocation and usage metrics would be included here.</p>
        </div>
      ` : ''}

      ${taskSection}
    </body>
    </html>
  `;
};

// Generate PDF report
export const generatePDFReport = async (data) => {
  try {
    console.log('Starting PDF generation with data:', data);
    
    // Fetch project and tasks data
    const projectData = await getProjectWithTasks(data.projectId);
    const tasks = projectData.tasks || [];
    
    console.log('Project data fetched:', projectData.project?.projectName || 'No project name');
    console.log('Tasks count:', tasks.length);

    // Generate HTML content
    const htmlContent = generateReportHTML(data, projectData, tasks);

    // Create reports directory if it doesn't exist
    const reportsDir = path.join(process.cwd(), 'public', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Generate filename
    const projectName = projectData.project?.projectName?.replace(/\s+/g, '_') || 'Project';
    const reportTypeShort = data.reportType.includes('Weekly') ? 'Weekly' : 'Final';
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `${projectName}_${reportTypeShort}_Report_${dateStr}.pdf`;
    const filePath = path.join(reportsDir, fileName);

    console.log('Starting Puppeteer...');
    // Launch puppeteer and generate PDF
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    const page = await browser.newPage();
    console.log('Setting HTML content...');
    await page.setContent(htmlContent);
    console.log('Generating PDF at path:', filePath);
    await page.pdf({
      path: filePath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });
    await browser.close();
    console.log('PDF generated successfully');

    // Save report metadata to database
    const report = new Report({
      ...data,
      filePath: `/reports/${fileName}`,
      fileName: fileName,
      status: 'completed'
    });
    await report.save();

    return {
      success: true,
      report,
      filePath: `/reports/${fileName}`,
      fileName
    };
  } catch (error) {
    console.error('Error generating PDF report:', error);
    console.error('Error stack:', error.stack);
    throw new Error(`Failed to generate PDF report: ${error.message}`);
  }
};

export const upsertReport = async (data) => {
  if (data._id) {
    return Report.findByIdAndUpdate(data._id, data, { new: true, upsert: true });
  }
  const report = new Report(data);
  return report.save();
};

export const getReportsByProject = async (projectId) => {
  return Report.find({ projectId });
};

export const deleteReport = async (id) => {
  return Report.findByIdAndDelete(id);
};

export default {
  upsertReport,
  getReportsByProject,
  deleteReport,
  generatePDFReport
};
