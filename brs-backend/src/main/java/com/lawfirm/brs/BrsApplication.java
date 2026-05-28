package com.lawfirm.brs;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * BRS Backend Application - Law Firm Management System
 * 
 * Spring Boot 3.3.x with Java 21
 * Features: Authentication, Booking, CRM, Content Management, Chatbot
 */
@SpringBootApplication
@EnableCaching
@EnableAsync
@EnableScheduling
public class BrsApplication {

    public static void main(String[] args) {
        SpringApplication.run(BrsApplication.class, args);
    }
}
