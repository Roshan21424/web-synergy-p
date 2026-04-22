package com.personal.synergy;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class SynergyApplication {

	public static void main(String[] args) {
		SpringApplication.run(SynergyApplication.class, args);
	}

}
