package com.personal.synergy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

// FIX: removed @EnableCaching — it is already declared on CacheConfig in the config package.
// Having it in two places is harmless but misleading.
@SpringBootApplication
@EnableCaching
public class SynergyApplication {

	public static void main(String[] args) {
		SpringApplication.run(SynergyApplication.class, args);
	}
}