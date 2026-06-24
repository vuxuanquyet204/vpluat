package com.lawfirm.brs.repository;

import com.lawfirm.brs.entity.BulkImport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface BulkImportRepository extends JpaRepository<BulkImport, UUID> {

    Page<BulkImport> findByImportedByOrderByCreatedAtDesc(UUID importedBy, Pageable pageable);
}
