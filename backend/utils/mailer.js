const nodemailer = require('nodemailer');

const buildTransportOptions = () => {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
    EMAIL_SERVICE,
    EMAIL_USER,
    EMAIL_PASS,
  } = process.env;

  const normalizedSmtpPass = typeof SMTP_PASS === 'string' ? SMTP_PASS.replace(/\s+/g, '') : SMTP_PASS;
  const normalizedEmailPass = typeof EMAIL_PASS === 'string' ? EMAIL_PASS.replace(/\s+/g, '') : EMAIL_PASS;

  if (SMTP_HOST) {
    return {
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: String(SMTP_SECURE || '').toLowerCase() === 'true',
      auth: SMTP_USER && normalizedSmtpPass ? { user: SMTP_USER, pass: normalizedSmtpPass } : undefined,
    };
  }

  if (EMAIL_SERVICE) {
    return {
      service: EMAIL_SERVICE,
      auth: EMAIL_USER && normalizedEmailPass ? { user: EMAIL_USER, pass: normalizedEmailPass } : undefined,
    };
  }

  // Convenience: if user provided EMAIL_USER/EMAIL_PASS but forgot EMAIL_SERVICE, assume Gmail.
  if (EMAIL_USER && normalizedEmailPass) {
    return {
      service: 'gmail',
      auth: { user: EMAIL_USER, pass: normalizedEmailPass },
    };
  }

  return null;
};

const isMailerConfigured = () => {
  const transport = buildTransportOptions();
  if (!transport) return false;

  // Must have auth for typical providers.
  const hasAuth = Boolean(transport?.auth?.user && transport?.auth?.pass);
  return hasAuth;
};

let transporter = null;
const getTransporter = () => {
  if (transporter) return transporter;
  const options = buildTransportOptions();
  if (!options) return null;
  transporter = nodemailer.createTransport(options);
  return transporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
  if (!isMailerConfigured()) {
    return { ok: false, error: 'Email is not configured (missing SMTP/EMAIL credentials).' };
  }

  const resolvedTo = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean);
  if (resolvedTo.length === 0) return { ok: false, error: 'No recipients provided.' };

  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER || process.env.SMTP_USER;
  if (!from) return { ok: false, error: 'Missing EMAIL_FROM/EMAIL_USER/SMTP_USER.' };

  try {
    const tx = getTransporter();
    if (!tx) return { ok: false, error: 'Email transport is not configured.' };

    const info = await tx.sendMail({
      from,
      to: resolvedTo.join(', '),
      subject,
      html,
      text,
    });

    return { ok: true, info };
  } catch (error) {
    console.error('Email send failed:', error);
    return { ok: false, error: error?.message || 'Email send failed.' };
  }
};

module.exports = {
  sendEmail,
  isMailerConfigured,
};
