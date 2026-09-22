package at.fhtw.documentmanagementsystem.persistence.repository;

import at.fhtw.documentmanagementsystem.persistence.entity.DocumentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DocumentRepository extends JpaRepository<DocumentEntity, Long> {
}
