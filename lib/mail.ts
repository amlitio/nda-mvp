import sgMail from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const SENDGRID_FROM = process.env.SENDGRID_FROM || '';

sgMail.setApiKey(SENDGRID_API_KEY);

export async function sendEmail(to: string, signUrl: string, isConfirmation = false) {
  const subject = isConfirmation ? 'NDA Signed Confirmation' : 'Please Sign the NDA';
  const html = isConfirmation
    ? `<p>The NDA has been signed. <a href="${signUrl}">View signed NDA</a></p>`
    : `<p>You have been invited to sign an NDA. <a href="${signUrl}">Click here to sign</a></p>`;

  const msg = {
    to,
    from: SENDGRID_FROM,
    subject,
    html,
  };

  await sgMail.send(msg);
}
