package com.lawfirm.brs.dto.response;

import java.time.Instant;
import java.util.UUID;

/**
 * Snapshot entry for a {@link com.lawfirm.brs.entity.PostRevision}.
 * The `snapshot` payload is intentionally a raw JSON string so the
 * frontend can render the entire stored payload without coupling to
 * backend typing.
 */
public record PostRevisionDTO(
    UUID id,
    UUID postId,
    Integer revisionNumber,
    String snapshot,
    String changeNote,
    Instant createdAt
) {}
