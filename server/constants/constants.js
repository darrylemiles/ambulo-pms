// Console colors for logging
export const colours = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    underscore: '\x1b[4m',
    blink: '\x1b[5m',
    reverse: '\x1b[7m',
    hidden: '\x1b[8m',

    fg: {
        black: '\x1b[30m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m',
        gray: '\x1b[90m',
        crimson: '\x1b[38m'
    },
    bg: {
        black: '\x1b[40m',
        red: '\x1b[41m',
        green: '\x1b[42m',
        yellow: '\x1b[43m',
        blue: '\x1b[44m',
        magenta: '\x1b[45m',
        cyan: '\x1b[46m',
        white: '\x1b[47m',
        gray: '\x1b[100m',
        crimson: '\x1b[48m'
    }
};

// Ticket Status Constants
export const TICKET_STATUSES = {
    PENDING: 'PENDING',
    ASSIGNED: 'ASSIGNED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
};

// Priority Levels
export const PRIORITY_LEVELS = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    URGENT: 'URGENT'
};

// Request Types
export const REQUEST_TYPES = {
    PLUMBING: 'Plumbing',
    ELECTRICAL: 'Electrical',
    APPLIANCE: 'Appliance',
    CLEANING: 'Cleaning',
    PEST_CONTROL: 'Pest Control',
    GENERAL: 'General'
};

// User Roles
export const USER_ROLES = {
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
    TENANT: 'TENANT',
    MAINTENANCE: 'MAINTENANCE'
};

// File Upload Constants
export const FILE_UPLOAD = {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB in bytes
    ALLOWED_TYPES: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ],
    UPLOAD_PATH: './uploads/attachments/'
};

// Validation Constants
export const VALIDATION = {
    UNIT_NUMBER_REGEX: /^[A-Z]?\d+[A-Z]?$/i,
    PHONE_REGEX: /^(\+63|0)?[9]\d{9}$/,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD_MIN_LENGTH: 8,
    TICKET_TITLE_MAX_LENGTH: 100,
    DESCRIPTION_MAX_LENGTH: 1000,
    NOTES_MAX_LENGTH: 500
};

// Currency and Locale
export const LOCALE = {
    CURRENCY: 'PHP',
    LOCALE_CODE: 'en-PH',
    TIMEZONE: 'Asia/Manila'
};

// Date Formats
export const DATE_FORMATS = {
    DB_DATE: 'YYYY-MM-DD',
    DB_TIME: 'HH:mm:ss',
    DB_DATETIME: 'YYYY-MM-DD HH:mm:ss',
    DISPLAY_DATE: 'MMM D, YYYY',
    DISPLAY_DATETIME: 'MMM D, YYYY, h:mm A'
};

// API Response Messages
export const MESSAGES = {
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

// Status Mappings for Database
export const STATUS_MAPPINGS = {
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
        color: '#3b82f6',
        canEdit: true,
        canAssign: true,
        canCancel: true,
        canDelete: false
    },
    [TICKET_STATUSES.IN_PROGRESS]: {
        label: 'In Progress',
        color: '#8b5cf6',
        canEdit: false,
        canAssign: false,
        canCancel: false,
        canDelete: false
    },
    [TICKET_STATUSES.COMPLETED]: {
        label: 'Completed',
        color: '#10b981',
        canEdit: false,
        canAssign: false,
        canCancel: false,
        canDelete: false
    },
    [TICKET_STATUSES.CANCELLED]: {
        label: 'Cancelled',
        color: '#ef4444',
        canEdit: false,
        canAssign: false,
        canCancel: false,
        canDelete: false
    }
};

// Priority Mappings
export const PRIORITY_MAPPINGS = {
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
    [PRIORITY_LEVELS.HIGH]: {
        label: 'High',
        color: '#ef4444',
        order: 3
    },
    [PRIORITY_LEVELS.URGENT]: {
        label: 'Urgent',
        color: '#dc2626',
        order: 4
    }
};

// Database Table Names
export const TABLES = {
    USERS: 'users',
    TICKETS: 'tickets',
    ATTACHMENTS: 'attachments',
    SESSIONS: 'sessions'
};

// Pagination Constants
export const PAGINATION = {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    DEFAULT_PAGE: 1
};