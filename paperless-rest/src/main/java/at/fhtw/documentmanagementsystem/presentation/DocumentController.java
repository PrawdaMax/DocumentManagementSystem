package at.fhtw.documentmanagementsystem.presentation;

import at.fhtw.documentmanagementsystem.business.DocumentService;
import at.fhtw.documentmanagementsystem.business.dto.DocumentDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

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

    @PostMapping
    public ResponseEntity<DocumentDto> create(@Valid @RequestBody DocumentDto documentDto) {
        DocumentDto created = documentService.create(documentDto);
        return ResponseEntity.created(URI.create("/api/documents/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    public DocumentDto update(@PathVariable Long id, @Valid @RequestBody DocumentDto documentDto) {
        return documentService.update(id, documentDto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        documentService.delete(id);
    }
}
