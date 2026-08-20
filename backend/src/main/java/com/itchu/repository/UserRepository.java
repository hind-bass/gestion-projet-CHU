package com.itchu.repository;

import com.itchu.domain.User;
import com.itchu.domain.enums.Role;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    @EntityGraph(attributePaths = "competences")
    Optional<User> findByEmail(String email);

    @EntityGraph(attributePaths = "competences")
    @Override
    Optional<User> findById(Long id);

    @EntityGraph(attributePaths = "competences")
    @Override
    List<User> findAll();

    boolean existsByEmail(String email);

    @EntityGraph(attributePaths = "competences")
    List<User> findByActif(boolean actif);

    long countByActif(boolean actif);

    List<User> findByRoleAndActifTrue(Role role);
}
