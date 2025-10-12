import path from "path";
import fs from "fs";

// Returns { html, text, attachments }
export function buildBrandedEmail(
    { bodyHtml = "", bodyText = "" } = {},
    company = {},
    opts = {}
) {
    const name =
        company?.company_name || process.env.MAIL_FROM_NAME || "Ambulo PMS";
    const phone = company?.phone_number || company?.alt_phone_number || "";
    const email =
        company?.email || process.env.MAIL_FROM || process.env.GMAIL_USER || "";
    const addressParts = [
        company?.house_no,
        company?.street_address,
        company?.city,
        company?.province,
        company?.zip_code,
        company?.country,
    ].filter(Boolean);
    const address = addressParts.join(", ");
    const businessDesc = company?.business_desc || company?.businessDesc || "";
    const headerInfo = businessDesc || address;

    const logoPath = company?.icon_logo_url || company?.alt_logo_url || "";
    const isUrl = /^https?:\/\//i.test(logoPath);

    const attachments = [];
    let logoImgHtml = "";
    if (logoPath) {
        if (isUrl) {
            logoImgHtml = `<img src="${logoPath}" alt="${name} Logo" style="max-height:56px; display:block;" />`;
        } else {
            try {
                if (fs.existsSync(logoPath)) {
                    const cid = "company_logo";
                    const filename = path.basename(logoPath);
                    attachments.push({
                        filename: filename || "logo.png",
                        path: logoPath,
                        cid,
                    });
                    logoImgHtml = `<img src="cid:${cid}" alt="${name} Logo" style="max-height:56px; display:block;" />`;
                }
            } catch {
                /* ignore missing file */
            }
        }
    }

    const brandColor = opts.brandColor || "#0ea5e9";
    const brandDark = opts.brandDark || "#0284c7";
    const textColor = "#1f2937";
    const subtleText = "#6b7280";
    const lightText = "#9ca3af";
    const bg = "#ffffff";
    const accentBg = "#f0f9ff";

    const containerStyles =
        "max-width:900px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 25px rgba(0,0,0,0.08); border:1px solid #e5e7eb;";
    const headerStyles = `background:linear-gradient(135deg, ${brandColor} 0%, ${brandDark} 100%); padding:16px 28px 18px 28px; position:relative;`;
    const footerStyles = `background:#f8fafc; padding:20px 28px; text-align:center;`;
    const bodyStyles = `padding:28px 28px; color:${textColor}; line-height:1.6; font-size:14px; font-family:'Poppins', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;`;

    const headerHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${headerStyles}">
      <tr>
        <td style="font-family:'Poppins', -apple-system, BlinkMacSystemFont, system-ui, sans-serif; position:relative;">
          <!-- Decorative gradient overlay -->
          <div style="position:absolute; top:0; right:0; width:120px; height:120px; background:radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%); border-radius:50%; transform:translate(40px, -40px);"></div>
          
          <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%; position:relative; z-index:2;">
            <tr>
              <td style="vertical-align:middle; width:auto;">
                ${logoImgHtml
            ? `<div style="margin-bottom:16px;">${logoImgHtml}</div>`
            : ""
        }
                <div style="font-size:23px; font-weight:800; color:white; margin-bottom:4px; letter-spacing:-0.5px;">${escapeHtml(
            name
        )}</div>
                ${headerInfo
            ? `<div style="font-size:12px; color:rgba(255,255,255,0.9); font-weight:500;">${escapeHtml(
                headerInfo
            )}</div>`
            : ""
        }
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;

    const footerHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${footerStyles}">
      <tr>
        <td style="font-family:'Poppins', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;">
          <div style="border-top:2px solid #e5e7eb; padding-top:24px; margin-bottom:16px;"></div>
          <div style="font-size:11px; color:${lightText}; margin-bottom:8px; font-weight:500;">This message was sent by</div>
          <div style="font-size:13px; font-weight:700; color:${textColor}; margin-bottom:12px;">${escapeHtml(
        name
    )}</div>
          ${address
            ? `<div style="font-size:12px; color:${subtleText}; margin-bottom:8px; line-height:1.4;">${escapeHtml(
                address
            )}</div>`
            : ""
        }
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px;">
            <tr>
              <td style="text-align:center; font-size:11px; color:${subtleText}; font-weight:500;">
                ${phone
            ? `<span style="display:inline-block; margin-right:12px; vertical-align:middle;"><span style="display:inline-block; width:18px; height:18px; vertical-align:middle;">${phoneSvg(
                brandColor
            )}</span>&nbsp;<span style="vertical-align:middle;">${escapeHtml(
                phone
            )}</span></span>`
            : ""
        }
                ${phone && email
            ? `<span style="color:${subtleText}; margin:0 8px; vertical-align:middle;">•</span>`
            : ""
        }
                ${email
            ? `<span style="display:inline-block; margin-left:12px; vertical-align:middle;"><span style="display:inline-block; width:18px; height:18px; vertical-align:middle;">${envelopeSvg(
                brandColor
            )}</span>&nbsp;<span style="vertical-align:middle;">${escapeHtml(
                email
            )}</span></span>`
            : ""
        }
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;

    const modernCss = `<style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
    /* Prevent dark-mode inversion in aggressive email clients (iOS Mail/Apple Mail) */
    /* Force light backgrounds and text for the email content */
    body, .email-container, .email-body, .email-header, .email-footer {
      background-color: #ffffff !important;
      color: ${textColor} !important;
    }
    a { color: ${brandColor} !important; }
    @media (prefers-color-scheme: dark){ 
      /* Keep the email appearing in light mode even when client is in dark mode */
      body{ background:#ffffff !important; color: ${textColor} !important; } 
      .email-container{ background:#ffffff !important; border-color:#e5e7eb !important; }
    }
    @media (max-width: 720px) {
      .email-container { margin: 12px 8px !important; }
      .email-header { padding: 20px 18px 18px 18px !important; }
      .email-body { padding: 28px 18px !important; }
      .email-footer { padding: 16px !important; }
    }
  </style>`;
    const faLink = "";

    const html = `<!doctype html>
  <html lang="en">
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
      <title>${escapeHtml(name)} - Email Notification</title>
  ${faLink}
  ${modernCss}
    </head>
    <body style="background:#f8fafc; margin:0; padding:16px 16px; font-family:'Poppins', -apple-system, BlinkMacSystemFont, system-ui, sans-serif; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%;">
      <div class="email-container" style="${containerStyles}">
        <div class="email-header">${headerHtml}</div>
        <div class="email-body" style="${bodyStyles}">
          ${bodyHtml || ""}
        </div>
        <div class="email-footer">${footerHtml}</div>
      </div>
      <div style="text-align:center; margin-top:20px; color:${lightText}; font-size:12px; font-weight:500;">
        If you were not expecting this email, you can safely ignore it.
      </div>
    </body>
  </html>`;

    const plain = [
        bodyText || "",
        "",
        "--",
        name,
        address ? `Address: ${address}` : null,
        phone ? `Phone: ${phone}` : null,
        email ? `Email: ${email}` : null,
    ]
        .filter(Boolean)
        .join("\n");

    return { html, text: plain, attachments };
}

function phoneSvg(color = "#0ea5e9") {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.08 4.18 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.72c.12 1.05.38 2.07.78 3.03a2 2 0 0 1-.45 2.11L8.91 10.91a16 16 0 0 0 6 6l1.05-1.05a2 2 0 0 1 2.11-.45c.96.4 1.98.66 3.03.78A2 2 0 0 1 22 16.92z" fill="${color}"/>
  </svg>`;
}

function envelopeSvg(color = "#0ea5e9") {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" fill="${color}"/>
  </svg>`;
}

function escapeHtml(str = "") {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

export default { buildBrandedEmail };
