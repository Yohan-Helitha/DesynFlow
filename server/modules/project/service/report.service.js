import Report from '../model/report.model.js';
import Project from '../model/project.model.js';
import Task from '../model/task.model.js';
import MaterialRequest from '../model/material.model.js';
import User from '../../auth/model/user.model.js';
import { getTasksByProjectService } from './task.service.js';
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

// Get project data with tasks
const getProjectWithTasks = async (projectId) => {
  try {
    // populate project manager details
    const project = await Project.findById(projectId).populate('projectManagerId', 'name username firstName lastName');
    // Use existing service to fetch tasks to keep behavior consistent
    const tasks = await Task.find({ projectId: projectId })
      .populate('assignedTo', 'name username firstName lastName')
      .populate('blockDetails.blockedBy', 'name username firstName lastName')
      .sort({ createdAt: -1 });

    // Try to fetch latest material request for project to include items in report
    let materials = [];
    try {
      const mr = await MaterialRequest.findOne({ projectId }).sort({ createdAt: -1 }).lean();
      if (mr && Array.isArray(mr.items) && mr.items.length > 0) materials = mr.items.map(i => ({ name: i.itemName, quantity: i.qty, unit: '' }));
    } catch (e) {
      // ignore if material request not available
    }

    return { project, tasks, materials };
  } catch (error) {
    console.error('Error fetching project data:', error);
    return { project: null, tasks: [] };
  }
};

// Calculate project completion
const calculateProjectCompletion = (tasks) => {
  if (!tasks || tasks.length === 0) return 0;
  const completedTasks = tasks.filter(task => (task.status === 'Done' || task.status === 'Completed')).length;
  return Math.round((completedTasks / tasks.length) * 100);
};
// Generate PDF content based on report type
const generateReportHTML = (data, projectData, tasks) => {
  const { project, materials: projectMaterials } = projectData || {};
  const completion = calculateProjectCompletion(tasks);
  const completedTasks = tasks.filter(task => task.status === 'Done');
  const currentDate = new Date().toLocaleDateString();

  // safe name formatter handles different user shapes
  const safeName = (user) => {
    if (!user) return '—';
    if (typeof user === 'string') return user;
    return user.name || (user.firstName && user.lastName && `${user.firstName} ${user.lastName}`) || user.username || '—';
  };

  const leaderName = project?.projectManagerId ? safeName(project.projectManagerId) : (project?.leaderName || '—');

  // Categorize tasks
  const pending = tasks.filter(t => t.status === 'Pending' || t.status === 'To Do' || !t.status);
  const inProgress = tasks.filter(t => t.status === 'In Progress' || t.status === 'Ongoing');
  const completed = tasks.filter(t => t.status === 'Done' || t.status === 'Completed');
  const blocked = tasks.filter(t => t.status === 'Blocked' || (t.blockDetails && t.blockDetails.isBlocked));

  const rowFor = (t) => {
    const assigneeName = t.assignedTo ? safeName(t.assignedTo) : 'Unassigned';
    return `
      <tr>
        <td>${t.name || '-'}</td>
        <td>${assigneeName}</td>
        <td>${t.status || '-'}</td>
        <td>${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : (t.updatedAt ? new Date(t.updatedAt).toLocaleDateString() : '-')}</td>
      </tr>
    `;
  };

  const pendingRows = pending.map(rowFor).join('') || '<tr><td colspan="4">No pending tasks</td></tr>';
  const inProgressRows = inProgress.map(rowFor).join('') || '<tr><td colspan="4">No in-progress tasks</td></tr>';
  const completedRows = completed.map(rowFor).join('') || '<tr><td colspan="4">No completed tasks</td></tr>';

  // Materials list: prefer projectMaterials (latest material request), fallback to data.materials
  const materialsList = Array.isArray(projectMaterials) && projectMaterials.length > 0
    ? projectMaterials
    : (Array.isArray(data.materials) ? data.materials : []);
  const materialsRows = materialsList.length > 0 ? materialsList.map(m => `
    <tr>
      <td>${m.name}</td>
      <td style="text-align:right">${m.quantity ?? '-'}</td>
      <td>${m.unit ?? '-'}</td>
    </tr>
  `).join('') : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        :root{ --brand-brown:#6b4423; --brand-cream:#f7efdd; --brand-green:#4CAF50; }
        body{ font-family: 'Arial', Helvetica, sans-serif; color:#333; margin:0; padding:0; }
        .page{ padding: 15mm 12mm 12mm 12mm; box-sizing:border-box; }
        .report-header{ display:flex; align-items:center; gap:12px; padding:8px 0; border-bottom:3px solid var(--brand-brown); margin-bottom:12px; }
        .logo { height:50px; }
        .title { flex:1; text-align:center; }
        h1{ margin:0; color:var(--brand-brown); font-size:18px; }
        .project-card{ background:var(--brand-cream); padding:10px; border-radius:4px; margin:8px 0; }
        .project-grid{ display:flex; gap:10px; flex-wrap:wrap; }
        .project-item{ flex:1; min-width:150px; font-size:12px; }
        table{ width:100%; border-collapse:collapse; margin:6px 0; }
        th, td{ border:1px solid #e4e4e4; padding:4px 6px; font-size:11px; }
        th{ background:#fbf7f2; color:var(--brand-brown); text-align:left; font-weight:bold; }
        .section-title{ color:var(--brand-brown); margin:8px 0 4px 0; font-size:14px; font-weight:bold; }
        .subsection-title{ color:var(--brand-brown); margin:6px 0 3px 0; font-size:12px; font-weight:bold; }
        .summary{ background:#fff; padding:8px; border-radius:3px; border:1px solid #eee; margin:4px 0; font-size:11px; }
        .footer-note{ font-size:10px; color:#666; margin-top:12px; }
        .task-section{ margin:4px 0; }
        .blocked-tasks{ margin:6px 0; }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="report-header">
          <div><img src="/logo/pdf_logo.png" alt="Logo" class="logo"/></div>
          <div class="title">
            <h1>${data.reportType}</h1>
            <div style="font-size:12px;color:#555">Generated on: ${currentDate}</div>
          </div>
          <div style="width:140px; text-align:right; font-size:12px; color:#555">${project?.projectName || ''}</div>
        </div>

        <div class="project-card">
          <div class="project-grid">
            <div class="project-item"><strong>Project:</strong> ${project?.projectName || 'Unknown'}</div>
            <div class="project-item"><strong>Leader:</strong> ${leaderName}</div>
            <div class="project-item"><strong>Report Period:</strong> ${data.dateStart || 'N/A'} — ${data.dateEnd || 'N/A'}</div>
            <div class="project-item"><strong>Completion:</strong> ${completion}%</div>
          </div>
        </div>

        ${data.includeProgress ? `
          <div>
            <div class="section-title">Progress Summary</div>
            <div class="summary">${data.summary || 'No summary provided.'}</div>
          </div>
        ` : ''}

        ${data.includeIssues ? `
          <div>
            <div class="section-title">Issues & Delays</div>
            ${data.summary && data.summary.toLowerCase().includes('issue') ? `
              <div class="summary">${data.summary}</div>
            ` : `
              <div class="summary">No general issues reported for this period.</div>
            `}
            ${blocked.length > 0 ? `
              <div class="blocked-tasks">
                <div class="subsection-title">Blocked Tasks</div>
                <table>
                  <thead><tr><th>Task</th><th>Assigned To</th><th>Blocked By</th><th>Blocked Date</th><th>Issue Description</th></tr></thead>
                  <tbody>
                    ${blocked.map(b => {
                      const assigneeName = b.assignedTo ? safeName(b.assignedTo) : 'Unassigned';
                      const blockedByName = b.blockDetails?.blockedBy ? safeName(b.blockDetails.blockedBy) : 'System';
                      return `
                        <tr>
                          <td>${b.name || '-'}</td>
                          <td>${assigneeName}</td>
                          <td>${blockedByName}</td>
                          <td>${b.blockDetails?.blockedAt ? new Date(b.blockDetails.blockedAt).toLocaleDateString() : '-'}</td>
                          <td>${b.blockDetails?.issueDescription || 'No description provided'}</td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            ` : `
              <div class="summary">No blocked tasks in this period.</div>
            `}
          </div>
        ` : ''}        ${data.includeMaterialList ? `
          <div>
            <div class="section-title">Material List</div>
            ${materialsList.length > 0 ? `
              <table>
                <thead><tr><th>Material</th><th style="text-align:right">Quantity</th><th>Unit</th></tr></thead>
                <tbody>${materialsRows}</tbody>
              </table>
            ` : `<div class="summary">No material list provided.</div>`}
          </div>
        ` : ''}

        <div>
          <div class="section-title">Tasks Overview</div>

          <div class="task-section">
            <div class="subsection-title">Pending Tasks</div>
            <table>
              <thead><tr><th>Task</th><th>Assigned To</th><th>Status</th><th>Due / Updated</th></tr></thead>
              <tbody>${pendingRows}</tbody>
            </table>
          </div>

          <div class="task-section">
            <div class="subsection-title">In Progress Tasks</div>
            <table>
              <thead><tr><th>Task</th><th>Assigned To</th><th>Status</th><th>Due / Updated</th></tr></thead>
              <tbody>${inProgressRows}</tbody>
            </table>
          </div>

          <div class="task-section">
            <div class="subsection-title">Completed Tasks</div>
            <table>
              <thead><tr><th>Task</th><th>Assigned To</th><th>Status</th><th>Due / Completed</th></tr></thead>
              <tbody>${completedRows}</tbody>
            </table>
          </div>
        </div>

        <div class="footer-note">This report was generated by DesynFlow. For questions about the report content contact your project administrator.</div>
      </div>
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
    
    // Enhanced Chrome detection and configuration
    const launchOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-gpu',
        '--no-first-run'
      ]
    };

    // Try multiple Chrome paths (Windows-specific)
    const possibleChromePaths = [
      process.env.CHROME_PATH, // User-specified path
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Users\\' + process.env.USERNAME + '\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files\\Chromium\\Application\\chromium.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
    ].filter(Boolean);

    // Find first available Chrome/Chromium executable
    let chromeFound = false;
    for (const chromePath of possibleChromePaths) {
      try {
        if (fs.existsSync(chromePath)) {
          launchOptions.executablePath = chromePath;
          console.log('Using Chrome at:', chromePath);
          chromeFound = true;
          break;
        }
      } catch (err) {
        continue;
      }
    }

    if (!chromeFound) {
      console.log('No system Chrome found, using Puppeteer bundled Chromium...');
      // Remove executablePath to use bundled Chromium
      delete launchOptions.executablePath;
    }

    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    // Ensure styles render as on-screen
    await page.emulateMediaType('screen');
    console.log('Setting HTML content...');
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // PDF options with header/footer templates for a professional look
    const pdfOptions = {
      path: filePath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '18mm', // smaller header margin
        right: '12mm',
        bottom: '18mm', // smaller footer margin
        left: '12mm'
      },
      displayHeaderFooter: true,
      headerTemplate: `<div style="font-family: Arial, Helvetica, sans-serif; font-size:11px; width:100%; text-align:center; color:#6b4423; padding:4px 0;"><strong>${data.reportType}</strong> &nbsp; - &nbsp; <span style="font-weight:600;">${projectData.project?.projectName || ''}</span></div>`,
      footerTemplate: `<div style="font-family: Arial, Helvetica, sans-serif; font-size:9px; width:100%; color:#666; padding:2px 8px; box-sizing:border-box;"><span style="float:left">Generated: ${new Date().toLocaleDateString()}</span><span style="float:right">Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>`
    };

    console.log('Generating PDF at path:', filePath);
    await page.pdf(pdfOptions);
    await browser.close();
    console.log('PDF generated successfully');

    // Use relative path - frontend will normalize to correct origin
    const relativePath = `/reports/${fileName}`;

    // Save report metadata to database (save relative path)
    const report = new Report({
      ...data,
      filePath: relativePath,
      fileUrl: relativePath, // Use relative path for both
      fileName: fileName,
      status: 'completed'
    });
    await report.save();

    return {
      success: true,
      report,
      filePath: relativePath, // Return relative path
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
