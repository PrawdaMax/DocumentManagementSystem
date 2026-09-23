package at.fhtw.documentmanagementsystem.business.dto;

import at.fhtw.documentmanagementsystem.persistence.entity.DocumentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentHistoryDto {

    private Long id;

    private DocumentStatus status;

    private Instant changedAt;

    private String comment;
}
