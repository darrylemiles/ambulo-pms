function formatAttachments(attachments) {
  if (!attachments) return "";

  const attachmentsList = attachments.split(",");
  return attachmentsList
    .map((attachment) => {
      const fileName = attachment.trim().split("/").pop();
      return `<a href="${attachment.trim()}" target="_blank" class="attachment-link">${fileName}</a>`;
    })
    .join(", ");
}

export default formatAttachments;
