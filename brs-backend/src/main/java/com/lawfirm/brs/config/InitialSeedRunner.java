package com.lawfirm.brs.config;

import com.lawfirm.brs.service.seed.InitialSeedService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(100)
public class InitialSeedRunner implements ApplicationRunner {

    private final InitialSeedService initialSeedService;

    @Override
    public void run(ApplicationArguments args) {
        initialSeedService.runOnce();
    }
}
