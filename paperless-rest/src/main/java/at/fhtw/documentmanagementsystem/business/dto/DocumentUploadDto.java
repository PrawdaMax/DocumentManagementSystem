package at.fhtw.documentmanagementsystem.business.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentUploadDto {

    private String title;
    private String fileName;
    private byte[] content;

    public String titleOrFileName() {
        return title == null || title.isBlank() ? fileName : title.trim();
    }
}