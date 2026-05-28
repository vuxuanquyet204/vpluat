package com.lawfirm.brs.exception;

/**
 * Exception thrown when authentication fails.
 */
public class UnauthorizedException extends BusinessException {

    public UnauthorizedException() {
        super("UNAUTHORIZED", "Authentication required");
    }

    public UnauthorizedException(String message) {
        super("UNAUTHORIZED", message);
    }

    public UnauthorizedException(String errorCode, String message) {
        super(errorCode, message);
    }
}
