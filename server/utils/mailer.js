import nodemailer from "nodemailer";

// Gmail SMTP transporter. Prefer OAuth2 in production; for simplicity use app password here.
// Required env vars:
// - GMAIL_USER: your Gmail address
// - GMAIL_PASSWORD: your Gmail App Password (NOT your normal password)
// - MAIL_FROM_NAME (optional): display name for From header
// - MAIL_FROM (optional): override from email
// - MAIL_REPLY_TO (optional)

function buildTransporter() {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_PASSWORD;

    if (!user || !pass) {
        throw new Error(
            "Missing GMAIL_USER/GMAIL_PASSWORD in environment. Create a Gmail App Password and set env vars."
        );
    }

    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user,
            pass,
        },
    });
}

export async function sendMail({
    to,
    subject,
    text,
    html,
    cc,
    bcc,
    replyTo,
    attachments,
} = {}) {
    const transporter = buildTransporter();
    const fromEmail = process.env.MAIL_FROM || process.env.GMAIL_USER;
    const fromName = process.env.MAIL_FROM_NAME || "Ambulo PMS";

    const mailOptions = {
        from: `${fromName} <${fromEmail}>`,
        to,
        subject,
        text: text || undefined,
        html: html || undefined,
        cc: cc || undefined,
        bcc: bcc || undefined,
        replyTo: replyTo || process.env.MAIL_REPLY_TO || undefined,
        attachments: attachments || undefined,
    };

    const info = await transporter.sendMail(mailOptions);
    return {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
        response: info.response,
    };
}

export default { sendMail };
