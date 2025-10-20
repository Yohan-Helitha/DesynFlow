import nodemailer from "nodemailer";

// Check if SMTP is configured, otherwise use development mode
const isProduction = process.env.NODE_ENV === 'production';
const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

let transporter;

if (hasSmtpConfig) {
  // Production/Real email configuration
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === "true", 
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
} else {
  // Development/Demo mode - use test account
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'ethereal.user@ethereal.email',
      pass: 'ethereal.pass'
    }
  });
}

export async function sendEmail({ to, subject, html }) {
  try {
    if (!hasSmtpConfig) {
      // Development mode - just log the email instead of actually sending
      console.log('📧 EMAIL SIMULATION (Development Mode):');
      console.log(`   To: ${to}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   Content: ${html.replace(/<[^>]*>/g, '')}`); // Strip HTML for console
      console.log('   ✅ Email "sent" successfully (simulated)');
      return; // Don't actually send email in development
    }

    // Production mode - actually send email
    const info = await transporter.sendMail({
      from: `"DesynFlow" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    
    console.log('📧 Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    // Don't throw error in development mode to prevent breaking the flow
    if (hasSmtpConfig) {
      throw error; // Only throw in production when email is expected to work
    }
  }
}
