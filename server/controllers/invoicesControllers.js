import PDFDocument from 'pdfkit';
import { getInvoiceByPaymentId } from "../services/invoicesServices.js";
import companyDetailsService from "../services/companyDetailsServices.js";

function formatMoney(n) {
  const num = Number(n || 0);
  return `PHP ${num.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: '2-digit' });
}

export async function streamInvoicePdf(req, res, next) {
  const paymentId = req.params.id;
  let data;
  let company = null;
  try {
    data = await getInvoiceByPaymentId(paymentId);
    if (!data) {
      return res.status(404).json({ message: 'Invoice not found for this payment.' });
    }
    const rows = await companyDetailsService.getCompanyDetails();
    company = Array.isArray(rows) && rows.length ? rows[0] : null;
  } catch (preErr) {
    return next(preErr);
  }

  const { invoice, tenant, lease, property, charge, payment, items = [] } = data;

  const margin = 50;
  const doc = new PDFDocument({ margin, size: 'A4' });
  const filename = `invoice-${invoice.id || paymentId}.pdf`;

  
  const chunks = [];
  doc.on('data', (c) => chunks.push(c));
  doc.on('error', (e) => {
    try { console.error('PDF generation error:', e); } catch {}
    
    if (!res.headersSent) {
      return next(e);
    }
  });
  doc.on('end', () => {
    try {
      const pdfBuffer = Buffer.concat(chunks);
      res.status(200);
      res.setHeader('Content-Type', 'application/pdf');
      const dispType = String(req.query.download || '') === '1' ? 'attachment' : 'inline';
      res.setHeader('Content-Disposition', `${dispType}; filename="${filename}"`);
      res.setHeader('Content-Length', String(pdfBuffer.length));
      res.end(pdfBuffer);
    } catch (sendErr) {
      try { if (!res.headersSent) next(sendErr); } catch {}
    }
  });
  try {

    
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const contentWidth = pageWidth - margin * 2;
    let cursorY = margin;
    const leftX = margin;
    const leftColWidth = Math.floor(contentWidth * 0.6) - 12; 
    const rightColX = margin + leftColWidth + 24; 

  const drawFooter = () => {
      
      const footerTop = pageHeight - margin - 24; 
      doc.save();
      doc.strokeColor('#E5E7EB').moveTo(margin, footerTop).lineTo(pageWidth - margin, footerTop).stroke();
  const leftText = company?.company_name ? `${company.company_name}` : '';
  const pageNo = (doc.page && typeof doc.page.number === 'number' && !Number.isNaN(doc.page.number)) ? doc.page.number : 1;
  const rightText = `Page ${pageNo}`;
      doc.fontSize(8).fillColor('#6B7280');
      doc.text(leftText, margin, footerTop + 6, { width: contentWidth / 2, lineBreak: false });
      doc.text(rightText, margin + contentWidth / 2, footerTop + 6, { width: contentWidth / 2, align: 'right', lineBreak: false });
      doc.fillColor('#000000');
      doc.restore();
    };
    doc.on('pageAdded', () => {
      drawFooter();
    });

    
    let blockBottomLeft = cursorY;
    let blockBottomRight = cursorY;
    
    if (company && (company.icon_logo_url || company.alt_logo_url)) {
      const logoUrl = company.icon_logo_url || company.alt_logo_url;
      try {
        const fetchFn = typeof fetch !== 'undefined' ? fetch : null;
        if (fetchFn) {
          const resp = await fetchFn(logoUrl);
          if (resp.ok) {
            const ctype = (resp.headers.get('content-type') || '').toLowerCase();
            if (ctype.includes('image/png') || ctype.includes('image/jpeg') || ctype.includes('image/jpg')) {
              const arrayBuf = await resp.arrayBuffer();
              const buf = Buffer.from(arrayBuf);
              try {
                doc.image(buf, leftX, cursorY, { width: 60, height: 60, fit: [60, 60] });
                const textX = leftX + 70;
                doc.fontSize(16).text(company?.company_name || 'Company', textX, cursorY, { width: leftColWidth - 70 });
                doc.fontSize(10);
                const lines = [
                  [company.house_no, company.street_address].filter(Boolean).join(' ').trim(),
                  [company.city, company.province, company.zip_code].filter(Boolean).join(', ').trim(),
                  company.country,
                  company.email,
                  company.phone_number,
                ].filter(Boolean);
                lines.forEach((ln) => doc.text(ln, textX, undefined, { width: leftColWidth - 70 }));
                blockBottomLeft = Math.max(blockBottomLeft, doc.y);
              } catch (imgErr) {
                
                doc.fontSize(16).text(company?.company_name || 'Company', leftX, cursorY, { width: leftColWidth });
                doc.fontSize(10);
                const lines = [
                  [company.house_no, company.street_address].filter(Boolean).join(' ').trim(),
                  [company.city, company.province, company.zip_code].filter(Boolean).join(', ').trim(),
                  company.country,
                  company.email,
                  company.phone_number,
                ].filter(Boolean);
                lines.forEach((ln) => doc.text(ln, leftX, undefined, { width: leftColWidth }));
                blockBottomLeft = Math.max(blockBottomLeft, doc.y);
              }
            } else {
              
              doc.fontSize(16).text(company?.company_name || 'Company', leftX, cursorY, { width: leftColWidth });
              doc.fontSize(10);
              const lines = [
                [company.house_no, company.street_address].filter(Boolean).join(' ').trim(),
                [company.city, company.province, company.zip_code].filter(Boolean).join(', ').trim(),
                company.country,
                company.email,
                company.phone_number,
              ].filter(Boolean);
              lines.forEach((ln) => doc.text(ln, leftX, undefined, { width: leftColWidth }));
              blockBottomLeft = Math.max(blockBottomLeft, doc.y);
            }
          } else {
            
            doc.fontSize(16).text(company?.company_name || 'Company', leftX, cursorY, { width: leftColWidth });
            doc.fontSize(10);
            const lines = [
              [company.house_no, company.street_address].filter(Boolean).join(' ').trim(),
              [company.city, company.province, company.zip_code].filter(Boolean).join(', ').trim(),
              company.country,
              company.email,
              company.phone_number,
            ].filter(Boolean);
            lines.forEach((ln) => doc.text(ln, leftX, undefined, { width: leftColWidth }));
            blockBottomLeft = Math.max(blockBottomLeft, doc.y);
          }
        }
      } catch {}
    }
    if (!company) {
      doc.fontSize(16).text('Company', leftX, cursorY, { width: leftColWidth });
      blockBottomLeft = Math.max(blockBottomLeft, doc.y);
    }
    doc.fontSize(22).text('INVOICE', rightColX, cursorY, { width: contentWidth - (rightColX - margin) });
    blockBottomRight = Math.max(blockBottomRight, doc.y);

    cursorY = Math.max(blockBottomLeft, blockBottomRight) + 14;

    
    doc.fontSize(12).text(property.name || 'Property', leftX, cursorY, { width: leftColWidth });
    doc.text(property.address || '', leftX, undefined, { width: leftColWidth });
    const propBottom = doc.y;

    
    
    doc.fontSize(10).text(`Invoice ID: ${invoice.id ?? '—'}`, rightColX, cursorY, { width: contentWidth - (rightColX - margin) });
    doc.text(`Issue Date: ${formatDate(invoice.issueDate)}`, rightColX);
    doc.text(`Status: ${invoice.status || '—'}`, rightColX);
    const metaBottom = doc.y;

    cursorY = Math.max(propBottom, metaBottom) + 14;

    
    doc.fontSize(12).text('Bill To:', leftX, cursorY);
    doc.fontSize(11).text(tenant.name || 'Tenant', leftX, undefined, { width: leftColWidth });
    doc.text(`Lease ID: ${lease.id ?? '—'}`, leftX);
    cursorY = doc.y + 12;

    
  const tableTop = cursorY;
    const col1 = 50;   
    const col2 = 300;  
    const col3 = 380;  

    doc
      .fontSize(11)
      .text('Description', col1, tableTop, { width: 230 })
      .text('Type', col2, tableTop, { width: 60 })
      .text('Amount', col3, tableTop, { width: 100, align: 'right' });

  doc.moveTo(margin, tableTop + 15).lineTo(pageWidth - margin, tableTop + 15).strokeColor('#CCCCCC').stroke();

    let y = tableTop + 25;
    
    let lineItems = Array.isArray(items) && items.length
      ? items
      : [{ description: charge.description || 'Charge', type: charge.type || '—', amount: Number(charge.amount || 0), lateFeePercentage: null }];
    if ((!items || !items.length) && charge.lateFee && Number(charge.lateFee) > 0) {
      lineItems.push({ description: 'Late Fee', type: 'fee', amount: Number(charge.lateFee), lateFeePercentage: (typeof charge.lateFeePercentage === 'number' ? charge.lateFeePercentage : null) });
    }
    const ensureSpace = (increment = 18) => {
      const reserved = 160; 
      const bottomLimit = pageHeight - margin - reserved;
      if (y + increment > bottomLimit) {
        doc.addPage();
        y = margin + 25;
        
        doc.fontSize(11)
          .text('Description', col1, margin, { width: 230, lineBreak: false })
          .text('Type', col2, margin, { width: 60, lineBreak: false })
          .text('Amount', col3, margin, { width: 100, align: 'right', lineBreak: false });
        doc.moveTo(margin, margin + 15).lineTo(pageWidth - margin, margin + 15).strokeColor('#CCCCCC').stroke();
      }
    };
    lineItems.forEach((it) => {
      ensureSpace();
      const isLateFee = String(it.type || '').toLowerCase() === 'fee' || /late fee/i.test(String(it.description || ''));
      const descText = isLateFee
        ? `   • Late Fee${typeof it.lateFeePercentage === 'number' ? ` (${it.lateFeePercentage}%)` : ''}`
        : String(it.description || '');

      doc.fontSize(10)
        .text(descText, col1, y, { width: 230 })
        .text(isLateFee ? 'fee' : String(it.type || ''), col2, y, { width: 60, lineBreak: false })
        .text(formatMoney(it.amount), col3, y, { width: 100, align: 'right', lineBreak: false });
      y += 18;
    });

  doc.moveTo(margin, y + 5).lineTo(pageWidth - margin, y + 5).strokeColor('#CCCCCC').stroke();

  const subtotal = lineItems.reduce((s, it) => s + Number(it.amount || 0), 0);

    
    const totalsTop = y + 20;
    doc
      .fontSize(11)
      .text('Subtotal:', 380, totalsTop, { width: 100, align: 'right', lineBreak: false })
      .text(formatMoney(subtotal), 480, totalsTop, { width: 70, align: 'right', lineBreak: false })
  .text('Total:', 380, totalsTop + 16, { width: 100, align: 'right', lineBreak: false })
  .font('Helvetica-Bold')
  .text(formatMoney((typeof invoice.total === 'number' && invoice.total > 0) ? invoice.total : subtotal), 480, totalsTop + 16, { width: 70, align: 'right', lineBreak: false })
      .font('Helvetica');

    
    const payTop = totalsTop + 50;
    doc
      .fontSize(12)
      .text('Payment Information', 50, payTop, { lineBreak: false })
      .fontSize(10)
      .text(`Method: ${payment.method || '—'}`, 50, payTop + 16, { lineBreak: false })
      .text(`Date: ${formatDate(payment.date)}`, 50, payTop + 30, { lineBreak: false })
      .text(`Reference: ${payment.reference || '—'}`, 50, payTop + 44, { lineBreak: false });

    doc
      .fontSize(9)
      .fillColor('#666666')
      .text('Thank you for your payment. This invoice serves as an official receipt.', 50, payTop + 80, { lineBreak: false })
      .fillColor('#000000');

    
    drawFooter();
    doc.end();
  } catch (err) {
    
    if (!res.headersSent) {
      return next(err);
    }
    try { if (!res.writableEnded) res.end(); } catch {}
  }
}
