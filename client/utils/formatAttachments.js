function formatAttachments(attachments, showThumbnails = true) {
  if (!attachments) return "";

  const attachmentsList = attachments.split(",");
  
  if (!showThumbnails) {
    // Simple link format for compatibility
    return attachmentsList
      .map((attachment) => {
        const fileName = attachment.trim().split("/").pop();
        return `<a href="${attachment.trim()}" target="_blank" class="attachment-link">${fileName}</a>`;
      })
      .join(", ");
  }

  return `<div class="attachments-grid">` + 
    attachmentsList
      .map((attachment) => {
        const url = attachment.trim();
        const fileName = url.split("/").pop();
        const fileExtension = fileName.split('.').pop().toLowerCase();
        
        // Determine file type
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(fileExtension);
        const isVideo = ['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(fileExtension);
        const isPdf = fileExtension === 'pdf';
        
        if (isImage) {
          return `
            <div class="attachment-item image-attachment">
              <div class="attachment-thumbnail" onclick="viewAttachment('${url}', 'image')">
                <img src="${url}" alt="${fileName}" loading="lazy" onerror="this.parentElement.classList.add('error')">
                <div class="attachment-overlay">
                  <i class="fas fa-eye"></i>
                </div>
              </div>
              <div class="attachment-info">
                <span class="attachment-name" title="${fileName}">${fileName}</span>
                <div class="attachment-actions">
                  <button onclick="viewAttachment('${url}', 'image')" class="btn-view" title="View">
                    <i class="fas fa-eye"></i>
                  </button>
                  <a href="${url}" download="${fileName}" class="btn-download" title="Download">
                    <i class="fas fa-download"></i>
                  </a>
                </div>
              </div>
            </div>`;
        } else if (isVideo) {
          return `
            <div class="attachment-item video-attachment">
              <div class="attachment-thumbnail" onclick="viewAttachment('${url}', 'video')">
                <video preload="metadata" muted>
                  <source src="${url}" type="video/${fileExtension}">
                </video>
                <div class="attachment-overlay">
                  <i class="fas fa-play"></i>
                </div>
              </div>
              <div class="attachment-info">
                <span class="attachment-name" title="${fileName}">${fileName}</span>
                <div class="attachment-actions">
                  <button onclick="viewAttachment('${url}', 'video')" class="btn-view" title="Play">
                    <i class="fas fa-play"></i>
                  </button>
                  <a href="${url}" download="${fileName}" class="btn-download" title="Download">
                    <i class="fas fa-download"></i>
                  </a>
                </div>
              </div>
            </div>`;
        } else if (isPdf) {
          return `
            <div class="attachment-item pdf-attachment">
              <div class="attachment-thumbnail" onclick="viewAttachment('${url}', 'pdf')">
                <div class="pdf-icon">
                  <i class="fas fa-file-pdf"></i>
                </div>
                <div class="attachment-overlay">
                  <i class="fas fa-eye"></i>
                </div>
              </div>
              <div class="attachment-info">
                <span class="attachment-name" title="${fileName}">${fileName}</span>
                <div class="attachment-actions">
                  <button onclick="viewAttachment('${url}', 'pdf')" class="btn-view" title="View">
                    <i class="fas fa-eye"></i>
                  </button>
                  <a href="${url}" download="${fileName}" class="btn-download" title="Download">
                    <i class="fas fa-download"></i>
                  </a>
                </div>
              </div>
            </div>`;
        } else {
          // Generic file
          return `
            <div class="attachment-item file-attachment">
              <div class="attachment-thumbnail" onclick="window.open('${url}', '_blank')">
                <div class="file-icon">
                  <i class="fas fa-file"></i>
                </div>
                <div class="attachment-overlay">
                  <i class="fas fa-external-link-alt"></i>
                </div>
              </div>
              <div class="attachment-info">
                <span class="attachment-name" title="${fileName}">${fileName}</span>
                <div class="attachment-actions">
                  <a href="${url}" target="_blank" class="btn-view" title="Open">
                    <i class="fas fa-external-link-alt"></i>
                  </a>
                  <a href="${url}" download="${fileName}" class="btn-download" title="Download">
                    <i class="fas fa-download"></i>
                  </a>
                </div>
              </div>
            </div>`;
        }
      })
      .join("") + 
    `</div>`;
}

// Global function to view attachments in modal
window.viewAttachment = function(url, type) {
  const modal = document.createElement('div');
  modal.className = 'attachment-viewer-modal';
  modal.innerHTML = `
    <div class="attachment-viewer-content">
      <div class="attachment-viewer-header">
        <h3>View Attachment</h3>
        <button class="attachment-viewer-close" onclick="this.closest('.attachment-viewer-modal').remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="attachment-viewer-body">
        ${type === 'image' ? `<img src="${url}" alt="Attachment" style="max-width: 100%; max-height: 100%; object-fit: contain;">` : ''}
        ${type === 'video' ? `<video src="${url}" controls style="max-width: 100%; max-height: 100%;" autoplay></video>` : ''}
        ${type === 'pdf' ? `<iframe src="${url}" style="width: 100%; height: 100%; border: none;"></iframe>` : ''}
      </div>
      <div class="attachment-viewer-footer">
        <a href="${url}" download class="btn-download-large">
          <i class="fas fa-download"></i> Download
        </a>
      </div>
    </div>
  `;
  
  // Close on outside click
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.remove();
    }
  });
  
  // Close on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.body.contains(modal)) {
      modal.remove();
    }
  });
  
  document.body.appendChild(modal);
};

export default formatAttachments;
