package com.ainnect.config;

import com.ainnect.entity.Role;
import com.ainnect.entity.User;
import com.ainnect.entity.UserRole;
import com.ainnect.entity.UserRoleId;
import com.ainnect.repository.RoleRepository;
import com.ainnect.repository.UserRepository;
import com.ainnect.repository.UserRoleRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Slf4j
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserRoleRepository userRoleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        initializeRoles();
        initializeAdminUser();
    }

    private void initializeRoles() {
        createRoleIfNotExists((short) 1, "ADMIN", "Administrator");
        createRoleIfNotExists((short) 2, "USER", "Regular User");
        createRoleIfNotExists((short) 3, "MODERATOR", "Moderator");
    }

    private void createRoleIfNotExists(Short id, String code, String name) {
        Optional<Role> existingRole = roleRepository.findByCode(code);
        if (existingRole.isEmpty()) {
            Role role = Role.builder()
                    .id(id)
                    .code(code)
                    .name(name)
                    .build();
            roleRepository.save(role);
            log.info("Created role: {}", code);
        }
    }

    private void initializeAdminUser() {
        Optional<User> existingAdmin = userRepository.findByUsername("admin");
        
        if (existingAdmin.isEmpty()) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@ainnect.com")
                    .passwordHash(passwordEncoder.encode("admin"))
                    .displayName("System Administrator")
                    .isActive(true)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            
            User savedAdmin = userRepository.save(admin);
            log.info("Created default admin user - Username: admin, Password: admin");

            Role adminRole = roleRepository.findByCode("ADMIN")
                    .orElseThrow(() -> new RuntimeException("Admin role not found"));

            UserRoleId userRoleId = new UserRoleId();
            userRoleId.setUserId(savedAdmin.getId());
            userRoleId.setRoleId(adminRole.getId());

            UserRole userRole = UserRole.builder()
                    .id(userRoleId)
                    .user(savedAdmin)
                    .role(adminRole)
                    .assignedAt(LocalDateTime.now())
                    .build();

            userRoleRepository.save(userRole);
            
            log.info("Assigned ADMIN role to admin user");
            log.warn("SECURITY WARNING: Please change the default admin password immediately!");
        } else {
            log.info("Admin user already exists");
        }
    }
}


