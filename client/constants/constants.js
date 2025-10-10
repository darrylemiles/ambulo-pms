
const TICKET_STATUSES = {
    PENDING: 'PENDING',
    ASSIGNED: 'ASSIGNED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
};


const PRIORITY_LEVELS = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    URGENT: 'URGENT'
};


const TICKET_REQUEST_TYPES = [
    { value: 'Electrical', label: 'Electrical' },
    { value: 'Plumbing', label: 'Plumbing' },
    { value: 'HVAC', label: 'HVAC' },
    { value: 'Appliance', label: 'Appliance' },
    { value: 'Structural', label: 'Structural' },
    { value: 'Painting', label: 'Painting' },
    { value: 'Cleaning', label: 'Cleaning' },
    { value: 'Security', label: 'Security' },
    { value: 'Other', label: 'Other' }
];


const USER_ROLES = {
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
    TENANT: 'TENANT'
};


const FILE_UPLOAD = {
    MAX_SIZE: 10 * 1024 * 1024, 
    MAX_FILES: 5, 
    ALLOWED_TYPES: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/webm',
        'video/ogg',
        'video/mov',
        'video/avi',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ],
    UPLOAD_PATH: './uploads/attachments/'
};


const VALIDATION = {
    UNIT_NUMBER_REGEX: /^[A-Z]?\d+[A-Z]?$/i,
    PHONE_REGEX: /^(\+63|0)?[9]\d{9}$/,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD_MIN_LENGTH: 8,
    TICKET_TITLE_MAX_LENGTH: 100,
    DESCRIPTION_MAX_LENGTH: 1000,
    NOTES_MAX_LENGTH: 500
};


const LOCALE = {
    CURRENCY: 'PHP',
    LOCALE_CODE: 'en-PH',
    TIMEZONE: 'Asia/Manila'
};


const DATE_FORMATS = {
    DB_DATE: 'YYYY-MM-DD',
    DB_TIME: 'HH:mm:ss',
    DB_DATETIME: 'YYYY-MM-DD HH:mm:ss',
    DISPLAY_DATE: 'MMM D, YYYY',
    DISPLAY_DATETIME: 'MMM D, YYYY, h:mm A'
};


const MESSAGES = {
    SUCCESS: {
        TICKET_CREATED: 'Ticket created successfully',
        TICKET_UPDATED: 'Ticket updated successfully',
        TICKET_DELETED: 'Ticket deleted successfully',
        TICKET_ASSIGNED: 'Ticket assigned successfully',
        USER_CREATED: 'User created successfully',
        USER_UPDATED: 'User updated successfully',
        LOGIN_SUCCESS: 'Login successful',
        LOGOUT_SUCCESS: 'Logout successful'
    },
    ERROR: {
        UNAUTHORIZED: 'Unauthorized access',
        FORBIDDEN: 'Insufficient permissions',
        NOT_FOUND: 'Resource not found',
        VALIDATION_ERROR: 'Validation error',
        INTERNAL_ERROR: 'Internal server error',
        TICKET_NOT_FOUND: 'Ticket not found',
        USER_NOT_FOUND: 'User not found',
        INVALID_CREDENTIALS: 'Invalid credentials',
        DUPLICATE_EMAIL: 'Email already exists',
        FILE_TOO_LARGE: 'File size exceeds limit',
        INVALID_FILE_TYPE: 'Invalid file type'

    }
};


const SUBJECT_LINES = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'property-availability', label: 'Property Availability / Viewing Request' },
    { value: 'leasing-terms', label: 'Leasing / Rental Terms' },
    { value: 'feedback', label: 'Feedback or Suggestions' }
];


const STATUS_MAPPINGS = {
    [TICKET_STATUSES.PENDING]: {
        label: 'Pending',
        color: '#f59e0b', 
        canEdit: true,
        canAssign: true,
        canCancel: true,
        canDelete: true
    },
    [TICKET_STATUSES.ASSIGNED]: {
        label: 'Assigned',
        color: '#2563eb', 
        canEdit: true,
        canAssign: true,
        canCancel: true,
        canDelete: false
    },
    [TICKET_STATUSES.IN_PROGRESS]: {
        label: 'In Progress',
        color: '#7c3aed', 
        canEdit: false,
        canAssign: false,
        canCancel: false,
        canDelete: false
    },
    [TICKET_STATUSES.COMPLETED]: {
        label: 'Completed',
        color: '#059669', 
        canEdit: false,
        canAssign: false,
        canCancel: false,
        canDelete: false
    },
    [TICKET_STATUSES.CANCELLED]: {
        label: 'Cancelled',
        color: '#dc2626', 
        canEdit: false,
        canAssign: false,
        canCancel: false,
        canDelete: false
    }
};


const PRIORITY_MAPPINGS = {
    [PRIORITY_LEVELS.LOW]: {
        label: 'Low',
        color: '#6b7280',
        order: 1
    },
    [PRIORITY_LEVELS.MEDIUM]: {
        label: 'Medium',
        color: '#f59e0b',
        order: 2
    },
    [PRIORITY_LEVELS.URGENT]: {
        label: 'Urgent',
        color: '#dc2626',
        order: 4
    }
};



const PAGINATION = {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    DEFAULT_PAGE: 1
};



if (typeof module !== 'undefined' && module.exports) {
    
    module.exports = {
        TICKET_STATUSES,
        PRIORITY_LEVELS,
        REQUEST_TYPES,
        TICKET_REQUEST_TYPES,
        USER_ROLES,
        FILE_UPLOAD,
        VALIDATION,
        LOCALE,
        DATE_FORMATS,
        MESSAGES,
        SUBJECT_LINES,
        STATUS_MAPPINGS,
        PRIORITY_MAPPINGS,
        PAGINATION
    };
} else {
    
    window.AppConstants = {
        TICKET_STATUSES,
        PRIORITY_LEVELS,
        TICKET_REQUEST_TYPES,
        USER_ROLES,
        FILE_UPLOAD,
        VALIDATION,
        LOCALE,
        DATE_FORMATS,
        MESSAGES,
        SUBJECT_LINES,
        STATUS_MAPPINGS,
        PRIORITY_MAPPINGS,
        PAGINATION
    };
}