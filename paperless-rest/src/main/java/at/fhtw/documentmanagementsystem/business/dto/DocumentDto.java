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
public class DocumentDto {

    private Long id;
    private String title;
    private String fileName;
    private String contentType;
    private Long fileSize;
    private Instant uploadedAt;
    private DocumentStatus status;
}