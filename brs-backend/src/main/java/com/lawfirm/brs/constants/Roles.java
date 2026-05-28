package com.lawfirm.brs.constants;

/**
 * User roles for authorization.
 * Follows hierarchical role model.
 */
public enum Roles {
    SUPER_ADMIN,  // Full system access
    ADMIN,       // Administrative functions
    EDITOR,      // Content management
    CSKH,        // Customer service
    LAWYER,      // Legal professional
    USER         // Basic user
}
