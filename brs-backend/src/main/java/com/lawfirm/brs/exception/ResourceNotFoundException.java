package com.lawfirm.brs.exception;

/**
 * Exception thrown when a requested resource is not found.
 */
public class ResourceNotFoundException extends BusinessException {

    public ResourceNotFoundException(String resource, String field, String value) {
        super("RESOURCE_NOT_FOUND", 
            String.format("%s not found with %s: %s", resource, field, value));
    }

    public ResourceNotFoundException(String message) {
        super("RESOURCE_NOT_FOUND", message);
    }
}
