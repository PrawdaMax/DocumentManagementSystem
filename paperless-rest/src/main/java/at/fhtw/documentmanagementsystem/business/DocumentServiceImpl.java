package at.fhtw.documentmanagementsystem.business;

import at.fhtw.documentmanagementsystem.business.dto.DocumentDto;
import at.fhtw.documentmanagementsystem.business.dto.DocumentHistoryDto;
import at.fhtw.documentmanagementsystem.business.dto.StatusChangeDto;
import at.fhtw.documentmanagementsystem.business.exception.InvalidStatusChangeException;
import at.fhtw.documentmanagementsystem.business.exception.ResourceNotFoundException;
import at.fhtw.documentmanagementsystem.business.mapper.DocumentHistoryMapper;
import at.fhtw.documentmanagementsystem.business.mapper.DocumentMapper;
import at.fhtw.documentmanagementsystem.persistence.entity.DocumentEntity;
import at.fhtw.documentmanagementsystem.persistence.entity.DocumentHistoryEntity;
import at.fhtw.documentmanagementsystem.persistence.entity.DocumentStatus;
import at.fhtw.documentmanagementsystem.persistence.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;

import static at.fhtw.documentmanagementsystem.persistence.entity.DocumentStatus.ARCHIVED;
import static at.fhtw.documentmanagementsystem.persistence.entity.DocumentStatus.DONE;
import static at.fhtw.documentmanagementsystem.persistence.entity.DocumentStatus.IN_REVIEW;
import static at.fhtw.documentmanagementsystem.persistence.entity.DocumentStatus.RECEIVED;
import static at.fhtw.documentmanagementsystem.persistence.entity.DocumentStatus.REJECTED;

import at.fhtw.documentmanagementsystem.business.dto.DocumentDto;
import at.fhtw.documentmanagementsystem.business.dto.DocumentHistoryDto;
import at.fhtw.documentmanagementsystem.business.dto.DocumentUpdateDto;
import at.fhtw.documentmanagementsystem.business.dto.DocumentUploadDto;
import at.fhtw.documentmanagementsystem.business.dto.StatusChangeDto;
import at.fhtw.documentmanagementsystem.business.exception.InvalidStatusChangeException;
import at.fhtw.documentmanagementsystem.business.exception.ResourceNotFoundException;
import at.fhtw.documentmanagementsystem.business.mapper.DocumentHistoryMapper;
import at.fhtw.documentmanagementsystem.business.mapper.DocumentMapper;
import at.fhtw.documentmanagementsystem.business.validation.DocumentUploadValidator;
import at.fhtw.documentmanagementsystem.persistence.entity.DocumentEntity;


import at.fhtw.documentmanagementsystem.business.mapper.DocumentHistoryMapper;
import at.fhtw.documentmanagementsystem.business.mapper.DocumentMapper;
import at.fhtw.documentmanagementsystem.business.validation.DocumentUploadValidator;
import at.fhtw.documentmanagementsystem.messaging.OcrMessage;
import at.fhtw.documentmanagementsystem.messaging.OcrMessagePublisher;
import at.fhtw.documentmanagementsystem.persistence.entity.DocumentEntity;

@Service
@Transactional
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {

    private static final Map<DocumentStatus, Set<DocumentStatus>> ALLOWED_STATUS_CHANGES = Map.of(
            RECEIVED, Set.of(IN_REVIEW, REJECTED),
            IN_REVIEW, Set.of(DONE, REJECTED),
            DONE, Set.of(ARCHIVED),
            REJECTED, Set.of(IN_REVIEW),
            ARCHIVED, Set.of());

    private final DocumentRepository documentRepository;
    private final DocumentMapper documentMapper;
    private final DocumentHistoryMapper documentHistoryMapper;
    private final DocumentUploadValidator documentUploadValidator;
    private final OcrMessagePublisher ocrMessagePublisher;

    @Override
    public List<DocumentDto> getAll() {
        return documentMapper.mapToDto(documentRepository.findAll());
    }

    @Override
    public DocumentDto getById(Long id) {
        return documentMapper.mapToDto(findDocument(id));
    }

    @Override
    public DocumentDto upload(DocumentUploadDto uploadDto) {
        documentUploadValidator.validate(uploadDto);
        DocumentEntity document = documentMapper.mapToEntity(uploadDto);
        recordStatus(document, RECEIVED, "Document uploaded");
        DocumentDto savedDocument = documentMapper.mapToDto(documentRepository.save(document));

        ocrMessagePublisher.sendOcrMessage(new OcrMessage(
                savedDocument.getId(),
                savedDocument.getTitle(),
                savedDocument.getFileName()
        ));

        return savedDocument;
    }

    @Override
    public DocumentDto update(Long id, DocumentUpdateDto updateDto) {
        DocumentEntity document = findDocument(id);
        document.setTitle(updateDto.getTitle());
        return documentMapper.mapToDto(documentRepository.save(document));
    }

    @Override
    public void delete(Long id) {
        documentRepository.delete(findDocument(id));
    }

    @Override
    public DocumentDto changeStatus(Long id, StatusChangeDto statusChangeDto) {
        DocumentEntity document = findDocument(id);
        DocumentStatus newStatus = statusChangeDto.getStatus();
        if (!ALLOWED_STATUS_CHANGES.get(document.getStatus()).contains(newStatus)) {
            throw new InvalidStatusChangeException(
                    "Status change from " + document.getStatus() + " to " + newStatus + " is not allowed");
        }
        recordStatus(document, newStatus, statusChangeDto.getComment());
        return documentMapper.mapToDto(documentRepository.save(document));
    }

    @Override
    public List<DocumentHistoryDto> getHistory(Long id) {
        return documentHistoryMapper.mapToDto(findDocument(id).getHistory());
    }

    private DocumentEntity findDocument(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document with id " + id + " not found"));
    }

    private void recordStatus(DocumentEntity document, DocumentStatus status, String comment) {
        document.setStatus(status);
        document.getHistory().add(DocumentHistoryEntity.builder()
                .document(document)
                .status(status)
                .comment(comment)
                .build());
    }
}
