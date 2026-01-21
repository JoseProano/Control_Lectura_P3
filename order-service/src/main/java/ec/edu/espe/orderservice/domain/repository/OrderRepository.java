package ec.edu.espe.orderservice.domain.repository;

import ec.edu.espe.orderservice.domain.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/**
 * Order Repository Interface
 * Follows Dependency Inversion Principle: High-level modules depend on abstraction
 */
@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
}
