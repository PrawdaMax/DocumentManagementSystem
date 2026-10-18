package at.fhtw.documentmanagementsystem.presentation;

import at.fhtw.documentmanagementsystem.business.DocumentService;
import at.fhtw.documentmanagementsystem.business.dto.DocumentDto;
import at.fhtw.documentmanagementsystem.business.dto.DocumentHistoryDto;
import at.fhtw.documentmanagementsystem.business.dto.DocumentUpdateDto;
import at.fhtw.documentmanagementsystem.business.dto.DocumentUploadDto;
import at.fhtw.documentmanagementsystem.business.dto.StatusChangeDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @GetMapping
    public List<DocumentDto> getAll() {
        return documentService.getAll();
    }

    @GetMapping("/{id}")
    public DocumentDto getById(@PathVariable Long id) {
        return documentService.getById(id);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DocumentDto> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title) throws IOException {

        DocumentUploadDto uploadDto = DocumentUploadDto.builder()
                .title(title)
                .fileName(file.getOriginalFilename())
                .content(file.getBytes())
                .build();

        DocumentDto created = documentService.upload(uploadDto);
        return ResponseEntity.created(URI.create("/api/documents/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    public DocumentDto update(@PathVariable Long id, @Valid @RequestBody DocumentUpdateDto updateDto) {
        return documentService.update(id, updateDto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        documentService.delete(id);
    }

    @PatchMapping("/{id}/status")
    public DocumentDto changeStatus(@PathVariable Long id, @Valid @RequestBody StatusChangeDto statusChangeDto) {
        return documentService.changeStatus(id, statusChangeDto);
    }

    @GetMapping("/{id}/history")
    public List<DocumentHistoryDto> getHistory(@PathVariable Long id) {
        return documentService.getHistory(id);
    }
}
