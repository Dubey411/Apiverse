import type { AlertSeverity } from '@/lib/api-monitoring/types';

interface AlertMessage {
  title: string;
  body: string;
  severity: AlertSeverity;
}

export async function sendAlertEmail(to: string, apiName: string, alerts: AlertMessage[]) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`[APIverse Alerts] RESEND_API_KEY is not configured. Suppressing email for ${apiName}.`);
    return false;
  }

  const hasCritical = alerts.some((a) => a.severity === 'critical');
  const subjectStatus = hasCritical ? 'CRITICAL' : 'WARNING';
  const subject = `[APIverse] ${subjectStatus}: ${apiName} monitoring alert`;

  const htmlBody = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: ${hasCritical ? '#d85f43' : '#d68d2e'}; border-bottom: 1px solid #eee; padding-bottom: 10px;">
        APIverse Monitoring Alert
      </h2>
      <p>The automated monitoring check for <strong>${apiName}</strong> has flagged the following issues:</p>
      
      <ul style="padding-left: 20px;">
        ${alerts.map(alert => `
          <li style="margin-bottom: 15px;">
            <strong><span style="color: ${alert.severity === 'critical' ? '#d85f43' : '#d68d2e'}">[${alert.severity.toUpperCase()}]</span> ${alert.title}</strong><br/>
            ${alert.body}
          </li>
        `).join('')}
      </ul>

      <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="font-size: 12px; color: #888;">
        Sent automatically by your APIverse workspace.<br/>
        To stop these alerts, disable monitoring or remove the email address from your API configuration.
      </p>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // You can change this to a verified domain you own in Resend
        from: 'APIverse Alerts <onboarding@resend.dev>',
        to,
        subject,
        html: htmlBody,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[APIverse Alerts] Failed to send email to ${to}: ${response.status} ${errorText}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`[APIverse Alerts] Exception sending email to ${to}:`, error);
    return false;
  }
}
