package com.lawfirm.brs.service.seed;

import com.lawfirm.brs.config.AppProperties;
import com.lawfirm.brs.entity.SeedRun;
import com.lawfirm.brs.repository.SeedRunRepository;
import com.lawfirm.brs.repository.ServiceEntityRepository;
import com.lawfirm.brs.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lawfirm.brs.repository.SystemSettingRepository;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InitialSeedServiceTest {

    @Mock
    private AppProperties appProperties;
    @Mock
    private AppProperties.Seed seed;
    @Mock
    private JdbcTemplate jdbcTemplate;
    @Mock
    private SeedRunRepository seedRunRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ServiceEntityRepository serviceRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private SystemSettingRepository systemSettingRepository;
    @Mock
    private ObjectMapper objectMapper;

    private InitialSeedService service;

    @BeforeEach
    void setUp() throws Exception {
        service = new InitialSeedService(
            appProperties,
            jdbcTemplate,
            seedRunRepository,
            userRepository,
            serviceRepository,
            passwordEncoder,
            systemSettingRepository,
            objectMapper
        );
        org.mockito.Mockito.lenient().when(appProperties.getSeed()).thenReturn(seed);
        org.mockito.Mockito.lenient().when(seed.getKey()).thenReturn("initial-content-v1");
        org.mockito.Mockito.lenient().when(systemSettingRepository.findByNamespace(any())).thenReturn(Optional.empty());
        org.mockito.Mockito.lenient().when(objectMapper.writeValueAsString(any())).thenReturn("{}");
    }

    @Test
    void disabled_doesNotTouchDatabase() {
        when(seed.isEnabled()).thenReturn(false);

        service.runOnce();

        verifyNoDatabaseCalls();
    }

    @Test
    void completedMarker_skipsSeed() {
        when(seed.isEnabled()).thenReturn(true);
        when(seedRunRepository.findById("initial-content-v1"))
            .thenReturn(Optional.of(SeedRun.builder()
                .seedKey("initial-content-v1")
                .status(SeedRun.SeedRunStatus.COMPLETED)
                .build()));

        service.runOnce();

        verify(seedRunRepository).findById("initial-content-v1");
        verify(userRepository, never()).save(any());
    }

    @Test
    void emptyDatabase_requiresAdminCredentials() {
        when(seed.isEnabled()).thenReturn(true);
        org.mockito.Mockito.lenient().when(seed.getMode()).thenReturn(AppProperties.Seed.Mode.IF_EMPTY);
        when(userRepository.count()).thenReturn(0L);
        when(serviceRepository.count()).thenReturn(0L);
        when(seed.getAdminEmail()).thenReturn("");
        org.mockito.Mockito.lenient().when(seed.getAdminPassword()).thenReturn("");
        when(seedRunRepository.findById(anyString())).thenReturn(Optional.empty());
        when(seedRunRepository.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));

        assertThatThrownBy(() -> service.runOnce())
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("credentials");

        verify(seedRunRepository, org.mockito.Mockito.times(2)).saveAndFlush(any(SeedRun.class));
    }

    @Test
    void existingDatabase_marksCompletedWithoutCreatingSampleAdmin() {
        when(seed.isEnabled()).thenReturn(true);
        org.mockito.Mockito.lenient().when(seed.getMode()).thenReturn(AppProperties.Seed.Mode.IF_EMPTY);
        when(userRepository.count()).thenReturn(1L);
        when(seedRunRepository.findById(anyString())).thenReturn(Optional.empty());
        when(seedRunRepository.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));

        service.runOnce();

        verify(userRepository, never()).save(any());
        verify(seedRunRepository, org.mockito.Mockito.times(2)).saveAndFlush(any(SeedRun.class));
    }

    private void verifyNoDatabaseCalls() {
        verify(jdbcTemplate, never()).queryForObject(anyString(), eq(Long.class), any());
        verify(seedRunRepository, never()).findById(anyString());
        verify(userRepository, never()).count();
    }
}
