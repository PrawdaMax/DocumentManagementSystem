package at.fhtw.documentmanagementsystem.business.dto;

import at.fhtw.documentmanagementsystem.persistence.entity.DocumentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
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

    @NotBlank
    @Size(max = 255)
    private String title;

    @Size(max = 255)
    private String fileName;

    @Size(max = 255)
    private String contentType;

    @PositiveOrZero
    private Long fileSize;

    private Instant uploadedAt;

    private DocumentStatus status;
}
