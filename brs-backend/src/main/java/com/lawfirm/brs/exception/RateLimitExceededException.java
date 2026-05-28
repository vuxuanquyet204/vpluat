package com.lawfirm.brs.exception;

/**
 * Exception thrown when rate limit is exceeded.
 */
public class RateLimitExceededException extends BusinessException {

    private final long retryAfterMs;

    public RateLimitExceededException(long retryAfterMs) {
        super("RATE_LIMIT_EXCEEDED", "Too many requests. Please try again later.");
        this.retryAfterMs = retryAfterMs;
    }

    public long getRetryAfterMs() {
        return retryAfterMs;
    }
}
