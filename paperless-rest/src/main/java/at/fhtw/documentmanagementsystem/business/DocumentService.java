package at.fhtw.documentmanagementsystem.business;

import at.fhtw.documentmanagementsystem.business.dto.DocumentDto;

import java.util.List;

public interface DocumentService {

    List<DocumentDto> getAll();

    DocumentDto getById(Long id);

    DocumentDto create(DocumentDto documentDto);

    DocumentDto update(Long id, DocumentDto documentDto);

    void delete(Long id);
}
