package at.fhtw.documentmanagementsystem.business.dto;

import at.fhtw.documentmanagementsystem.persistence.entity.DocumentStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatusChangeDto {

    @NotNull
    private DocumentStatus status;

    @Size(max = 500)
    private String comment;
}
