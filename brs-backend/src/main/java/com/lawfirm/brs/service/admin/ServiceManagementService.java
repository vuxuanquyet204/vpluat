package com.lawfirm.brs.service.admin;

import com.lawfirm.brs.dto.request.ServiceRequest;
import com.lawfirm.brs.dto.response.PageResponse;
import com.lawfirm.brs.dto.response.ServiceDTO;
import com.lawfirm.brs.entity.LawyerProfile;
import com.lawfirm.brs.entity.ServiceEntity;
import com.lawfirm.brs.entity.ServiceLawyer;
import com.lawfirm.brs.exception.ResourceNotFoundException;
import com.lawfirm.brs.mapper.ServiceEntityMapper;
import com.lawfirm.brs.repository.LawyerProfileRepository;
import com.lawfirm.brs.repository.ServiceEntityRepository;
import com.lawfirm.brs.repository.ServiceLawyerRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for managing services (admin).
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ServiceManagementService {

    private final ServiceEntityRepository serviceRepository;
    private final ServiceEntityMapper serviceMapper;
    private final ServiceLawyerRepository serviceLawyerRepository;
    private final LawyerProfileRepository lawyerRepository;

    // EntityManager for dynamic Criteria queries (search/filter).
    @PersistenceContext
    private EntityManager entityManager;

    @Transactional(readOnly = true)
    public PageResponse<ServiceDTO> getAllServices(int page, int size) {
        log.debug("Fetching all services: page={}, size={}", page, size);
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<ServiceEntity> servicePage = serviceRepository.findAll(pageRequest);

        List<ServiceDTO> dtos = serviceMapper.toDTOList(servicePage.getContent());
        populateLawyerIds(dtos);
        return PageResponse.<ServiceDTO>builder()
                .content(dtos)
                .page(servicePage.getNumber())
                .size(servicePage.getSize())
                .totalElements(servicePage.getTotalElements())
                .totalPages(servicePage.getTotalPages())
                .first(servicePage.isFirst())
                .last(servicePage.isLast())
                .build();
    }

    /**
     * Search + filter services with pagination.  All params are optional.
     *  - search:     case-insensitive LIKE against name / slug
     *  - isActive:   filter by is_active column
     *  - category:   matches against parent.slug OR slug/name containing it
     *  - dateFrom/dateTo: range filter against created_at (ISO date or datetime)
     */
    @Transactional(readOnly = true)
    public PageResponse<ServiceDTO> searchServices(
            int page,
            int size,
            String search,
            Boolean isActive,
            String category,
            String dateFrom,
            String dateTo
    ) {
        log.debug("Searching services page={} size={} search='{}' isActive={} category='{}' from={} to={}",
                page, size, search, isActive, category, dateFrom, dateTo);

        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        CriteriaQuery<ServiceEntity> cq = cb.createQuery(ServiceEntity.class);
        Root<ServiceEntity> root = cq.from(ServiceEntity.class);

        List<Predicate> predicates = new ArrayList<>();
        // Always exclude soft-deleted
        predicates.add(cb.isNull(root.get("deletedAt")));

        if (search != null && !search.isBlank()) {
            String like = "%" + search.toLowerCase() + "%";
            Predicate pName = cb.like(cb.lower(cb.coalesce(root.get("name"), "")), like);
            Predicate pSlug = cb.like(cb.lower(root.get("slug")), like);
            predicates.add(cb.or(pName, pSlug));
        }
        if (isActive != null) {
            predicates.add(cb.equal(root.get("isActive"), isActive));
        }
        if (category != null && !category.isBlank()) {
            // Match by parent.slug OR if name/slug contains the category keyword
            String like = "%" + category.toLowerCase() + "%";
            Predicate pCatName = cb.like(cb.lower(cb.coalesce(root.get("name"), "")), like);
            Predicate pCatSlug = cb.like(cb.lower(root.get("slug")), like);
            predicates.add(cb.or(pCatName, pCatSlug));
        }
        if (dateFrom != null && !dateFrom.isBlank()) {
            try {
                Instant from = parseDate(dateFrom);
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), from));
            } catch (Exception e) {
                log.warn("Invalid dateFrom '{}', ignored", dateFrom);
            }
        }
        if (dateTo != null && !dateTo.isBlank()) {
            try {
                // If user passed a date only, include the entire day.
                Instant to = parseDate(dateTo);
                if (dateTo.length() <= 10) {
                    to = to.plusSeconds(24 * 60 * 60 - 1);
                }
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), to));
            } catch (Exception e) {
                log.warn("Invalid dateTo '{}', ignored", dateTo);
            }
        }

        cq.where(predicates.toArray(new Predicate[0]));
        cq.orderBy(cb.asc(root.get("displayOrder")), cb.asc(root.get("name")));

        // Count query (rebuild predicates on fresh root to keep it simple)
        CriteriaQuery<Long> countCq = cb.createQuery(Long.class);
        Root<ServiceEntity> countRoot = countCq.from(ServiceEntity.class);
        List<Predicate> countPreds = new ArrayList<>();
        countPreds.add(cb.isNull(countRoot.get("deletedAt")));
        if (search != null && !search.isBlank()) {
            String like = "%" + search.toLowerCase() + "%";
            countPreds.add(cb.or(
                    cb.like(cb.lower(cb.coalesce(countRoot.get("name"), "")), like),
                    cb.like(cb.lower(countRoot.get("slug")), like)
            ));
        }
        if (isActive != null) countPreds.add(cb.equal(countRoot.get("isActive"), isActive));
        if (category != null && !category.isBlank()) {
            String like = "%" + category.toLowerCase() + "%";
            countPreds.add(cb.or(
                    cb.like(cb.lower(cb.coalesce(countRoot.get("name"), "")), like),
                    cb.like(cb.lower(countRoot.get("slug")), like)
            ));
        }
        if (dateFrom != null && !dateFrom.isBlank()) {
            try {
                countPreds.add(cb.greaterThanOrEqualTo(countRoot.get("createdAt"), parseDate(dateFrom)));
            } catch (Exception ignored) {}
        }
        if (dateTo != null && !dateTo.isBlank()) {
            try {
                Instant to = parseDate(dateTo);
                if (dateTo.length() <= 10) to = to.plusSeconds(24 * 60 * 60 - 1);
                countPreds.add(cb.lessThanOrEqualTo(countRoot.get("createdAt"), to));
            } catch (Exception ignored) {}
        }
        countCq.where(countPreds.toArray(new Predicate[0]));
        countCq.select(cb.count(countRoot));

        Long total = entityManager.createQuery(countCq).getSingleResult();

        TypedQuery<ServiceEntity> query = entityManager.createQuery(cq);
        query.setFirstResult(page * size);
        query.setMaxResults(size);
        List<ServiceEntity> services = query.getResultList();
        log.debug("searchServices returned {} entities (total={})", services.size(), total);

        // Force-init the lazy 'parent' association while we're still inside the
        // transaction so that ServiceEntityMapper can read parent.id and
        // parent.slug without triggering LazyInitializationException.
        for (ServiceEntity svc : services) {
            if (svc.getParent() != null) {
                svc.getParent().getSlug(); // touch to initialize proxy
            }
        }

        List<ServiceDTO> dtos = serviceMapper.toDTOList(services);
        log.debug("searchServices mapped {} DTOs", dtos.size());
        populateLawyerIds(dtos);
        return PageResponse.of(dtos, page, size, total);
    }

    /** Parse an ISO date (yyyy-MM-dd) or datetime into UTC Instant. */
    private Instant parseDate(String s) {
        if (s.length() <= 10) {
            return LocalDate.parse(s).atStartOfDay().toInstant(ZoneOffset.UTC);
        }
        return Instant.parse(s);
    }

    @Transactional(readOnly = true)
    public ServiceDTO getServiceById(UUID id) {
        log.debug("Fetching service by id: {}", id);
        ServiceEntity service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found: " + id));
        ServiceDTO dto = serviceMapper.toDTOWithDetails(service);
        dto.setLawyerIds(serviceLawyerRepository.findLawyerIdsByServiceId(id));
        return dto;
    }

    @CacheEvict(value = "services", allEntries = true)
    public ServiceDTO createService(ServiceRequest request) {
        log.debug("Creating service: {}", request.slug());

        if (serviceRepository.findBySlug(request.slug()).isPresent()) {
            throw new RuntimeException("Service with slug already exists: " + request.slug());
        }

        ServiceEntity service = ServiceEntity.builder()
                .slug(request.slug())
                .name(request.name() != null ? request.name() : request.slug())
                .icon(request.icon())
                .isFeatured(request.isFeatured() != null ? request.isFeatured() : false)
                .isActive(request.isActive() != null ? request.isActive() : true)
                .displayOrder(request.displayOrder() != null ? request.displayOrder() : 0)
                .description(request.description())
                .price(request.price())
                .duration(request.duration())
                .category(request.category())
                .build();

        if (request.parentId() != null) {
            UUID parentId = request.parentId();
            ServiceEntity parent = serviceRepository.findById(parentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Parent service not found: " + parentId));
            service.setParent(parent);
        }

        ServiceEntity saved = serviceRepository.save(service);
        replaceServiceLawyers(saved.getId(), request.lawyerIds());
        log.info("Created service: {}", saved.getId());

        ServiceDTO dto = serviceMapper.toDTO(saved);
        dto.setLawyerIds(serviceLawyerRepository.findLawyerIdsByServiceId(saved.getId()));
        return dto;
    }

    @CacheEvict(value = "services", allEntries = true)
    public ServiceDTO updateService(UUID id, ServiceRequest request) {
        log.debug("Updating service: {}", id);
        ServiceEntity service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found: " + id));

        if (request.slug() != null && !request.slug().equals(service.getSlug())) {
            if (serviceRepository.findBySlug(request.slug()).isPresent()) {
                throw new RuntimeException("Service with slug already exists: " + request.slug());
            }
            service.setSlug(request.slug());
        }

        if (request.name() != null) {
            service.setName(request.name());
        }

        if (request.icon() != null) {
            service.setIcon(request.icon());
        }

        if (request.displayOrder() != null) {
            service.setDisplayOrder(request.displayOrder());
        }

        if (request.isFeatured() != null) {
            service.setIsFeatured(request.isFeatured());
        }

        if (request.isActive() != null) {
            service.setIsActive(request.isActive());
        }

        // Description / price / duration / category are PATCH-style:
        // null leaves the existing value untouched, empty string clears it.
        if (request.description() != null) {
            service.setDescription(request.description());
        }
        if (request.price() != null) {
            service.setPrice(request.price());
        }
        if (request.duration() != null) {
            service.setDuration(request.duration());
        }
        if (request.category() != null) {
            service.setCategory(request.category());
        }

        if (request.parentId() != null) {
            UUID parentId = request.parentId();
            if (parentId.equals(id)) {
                throw new RuntimeException("Service cannot be its own parent");
            }
            ServiceEntity parent = serviceRepository.findById(parentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Parent service not found: " + parentId));
            service.setParent(parent);
        }

        ServiceEntity saved = serviceRepository.save(service);

        // PATCH-style semantics for lawyerIds:
        //   * null  → leave existing assignments untouched (admin-only update)
        //   * []    → clear all assignments
        //   * [..]  → replace existing assignments with the supplied set
        if (request.lawyerIds() != null) {
            replaceServiceLawyers(saved.getId(), request.lawyerIds());
        }

        log.info("Updated service: {}", saved.getId());

        ServiceDTO dto = serviceMapper.toDTO(saved);
        dto.setLawyerIds(serviceLawyerRepository.findLawyerIdsByServiceId(saved.getId()));
        return dto;
    }

    @CacheEvict(value = "services", allEntries = true)
    public void deleteService(UUID id) {
        log.debug("Soft deleting service: {}", id);
        ServiceEntity service = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found: " + id));

        service.softDelete();
        serviceRepository.save(service);
        // Join-table rows are removed via FK ON DELETE CASCADE on services.id,
        // but a soft-delete leaves the parent row in place — clear manually so
        // stale lawyer assignments don't leak when the service is later restored.
        serviceLawyerRepository.deleteByServiceId(id);
        log.info("Soft deleted service: {}", id);
    }

    /**
     * Replace the {@code service_lawyers} set for a service. Deduplicates the
     * incoming ids, drops blank entries, and removes any rows that no longer
     * appear so the join table stays in sync with the response payload.
     *
     * Also syncs to LawyerProfile.serviceIds (JSONB) to keep both storage in sync.
     */
    private void replaceServiceLawyers(UUID serviceId, List<UUID> lawyerIds) {
        Set<UUID> deduped = lawyerIds == null
                ? Set.of()
                : lawyerIds.stream()
                    .filter(java.util.Objects::nonNull)
                    .collect(Collectors.toCollection(HashSet::new));
        try {
            // Get current lawyer IDs before deleting
            List<UUID> previousLawyerIds = serviceLawyerRepository.findLawyerIdsByServiceId(serviceId);

            // Fetch service entity for the relationship
            ServiceEntity serviceEntity = serviceRepository.findById(serviceId)
                    .orElseThrow(() -> new ResourceNotFoundException("Service not found: " + serviceId));

            serviceLawyerRepository.deleteByServiceId(serviceId);
            entityManager.flush(); // ensure DELETE runs before INSERTs to avoid constraint clashes

            // Fetch all lawyer entities in one query to avoid N+1
            Map<UUID, LawyerProfile> lawyerMap = new HashMap<>();
            if (!deduped.isEmpty()) {
                lawyerRepository.findAllById(deduped).forEach(l -> lawyerMap.put(l.getId(), l));
            }

            for (UUID lawyerId : deduped) {
                LawyerProfile lawyerEntity = lawyerMap.get(lawyerId);
                if (lawyerEntity == null) {
                    log.warn("Lawyer not found: {}, skipping", lawyerId);
                    continue;
                }

                ServiceLawyer row = ServiceLawyer.builder()
                        .id(ServiceLawyer.ServiceLawyerId.builder()
                                .serviceId(serviceId)
                                .lawyerId(lawyerId)
                                .build())
                        .service(serviceEntity)
                        .lawyer(lawyerEntity)
                        .isPrimary(false)
                        .build();
                serviceLawyerRepository.save(row);
            }

            // Sync to LawyerProfile.serviceIds (JSONB) for each affected lawyer
            syncServiceIdsToLawyerProfiles(deduped, previousLawyerIds, serviceId);
        } catch (DataIntegrityViolationException ex) {
            // FK violation means one or more lawyerIds don't exist —
            // surface a 400-friendly message rather than blowing up as 500.
            throw new IllegalArgumentException(
                    "Một hoặc nhiều lawyerId không tồn tại trong hệ thống: " + deduped, ex);
        }
    }

    /**
     * Sync service assignment to LawyerProfile.serviceIds (JSONB array).
     * Called when a service's lawyer assignments change.
     * - Lawyers in 'newLawyerIds' will have 'serviceId' added to their serviceIds
     * - Lawyers in 'previousLawyerIds' but NOT in 'newLawyerIds' will have 'serviceId' removed
     */
    private void syncServiceIdsToLawyerProfiles(Set<UUID> newLawyerIds, List<UUID> previousLawyerIds, UUID serviceId) {
        // Add serviceId to lawyers who now have this service
        for (UUID lawyerId : newLawyerIds) {
            lawyerRepository.findById(lawyerId).ifPresent(lawyer -> {
                List<UUID> currentServiceIds = lawyer.getServiceIds();
                if (currentServiceIds == null) {
                    currentServiceIds = new java.util.ArrayList<>();
                }
                if (!currentServiceIds.contains(serviceId)) {
                    currentServiceIds = new java.util.ArrayList<>(currentServiceIds);
                    currentServiceIds.add(serviceId);
                    lawyer.setServiceIds(currentServiceIds);
                    lawyerRepository.save(lawyer);
                    log.debug("Added service {} to lawyer {} serviceIds", serviceId, lawyerId);
                }
            });
        }

        // Remove serviceId from lawyers who no longer have this service
        Set<UUID> previousSet = new java.util.HashSet<>(previousLawyerIds);
        for (UUID lawyerId : previousSet) {
            if (!newLawyerIds.contains(lawyerId)) {
                lawyerRepository.findById(lawyerId).ifPresent(lawyer -> {
                    List<UUID> currentServiceIds = lawyer.getServiceIds();
                    if (currentServiceIds != null && currentServiceIds.contains(serviceId)) {
                        currentServiceIds = new java.util.ArrayList<>(currentServiceIds);
                        currentServiceIds.remove(serviceId);
                        lawyer.setServiceIds(currentServiceIds);
                        lawyerRepository.save(lawyer);
                        log.debug("Removed service {} from lawyer {} serviceIds", serviceId, lawyerId);
                    }
                });
            }
        }
    }

    /**
     * Bulk-populate {@code lawyerIds} for a list of DTOs. We de-duplicate the
     * service ids up-front so each unique id triggers at most one join-table
     * lookup — saving one round-trip per duplicate rather than one per DTO,
     * which is enough to keep the cost flat for the typical case (each
     * service appears in the response once). If the list ever grows beyond a
     * few hundred entries, swap this for a single grouped query.
     */
    private void populateLawyerIds(List<ServiceDTO> dtos) {
        if (dtos == null || dtos.isEmpty()) return;
        Set<UUID> serviceIds = new HashSet<>();
        for (ServiceDTO dto : dtos) {
            if (dto.getId() != null) serviceIds.add(dto.getId());
        }
        if (serviceIds.isEmpty()) return;

        Map<UUID, List<UUID>> grouped = new HashMap<>();
        for (UUID serviceId : serviceIds) {
            grouped.put(serviceId, serviceLawyerRepository.findLawyerIdsByServiceId(serviceId));
        }
        for (ServiceDTO dto : dtos) {
            if (dto.getId() != null) {
                dto.setLawyerIds(grouped.getOrDefault(dto.getId(), List.of()));
            }
        }
    }
}
