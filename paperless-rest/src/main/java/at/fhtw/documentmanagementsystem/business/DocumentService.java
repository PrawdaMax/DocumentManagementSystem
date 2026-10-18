package at.fhtw.documentmanagementsystem.business;

import at.fhtw.documentmanagementsystem.business.dto.DocumentDto;
import at.fhtw.documentmanagementsystem.business.dto.DocumentHistoryDto;
import at.fhtw.documentmanagementsystem.business.dto.DocumentUpdateDto;
import at.fhtw.documentmanagementsystem.business.dto.DocumentUploadDto;
import at.fhtw.documentmanagementsystem.business.dto.StatusChangeDto;

import java.util.List;

public interface DocumentService {

    List<DocumentDto> getAll();

    DocumentDto getById(Long id);

    DocumentDto upload(DocumentUploadDto uploadDto);

    DocumentDto update(Long id, DocumentUpdateDto updateDto);

    void delete(Long id);

    DocumentDto changeStatus(Long id, StatusChangeDto statusChangeDto);

    List<DocumentHistoryDto> getHistory(Long id);
}
