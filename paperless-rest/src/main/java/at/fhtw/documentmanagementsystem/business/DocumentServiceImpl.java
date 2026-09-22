package at.fhtw.documentmanagementsystem.business;

import at.fhtw.documentmanagementsystem.business.dto.DocumentDto;
import at.fhtw.documentmanagementsystem.business.exception.ResourceNotFoundException;
import at.fhtw.documentmanagementsystem.business.mapper.DocumentMapper;
import at.fhtw.documentmanagementsystem.persistence.entity.DocumentEntity;
import at.fhtw.documentmanagementsystem.persistence.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentMapper documentMapper;

    @Override
    public List<DocumentDto> getAll() {
        return documentMapper.mapToDto(documentRepository.findAll());
    }

    @Override
    public DocumentDto getById(Long id) {
        return documentMapper.mapToDto(findDocument(id));
    }

    @Override
    public DocumentDto create(DocumentDto documentDto) {
        DocumentEntity document = documentMapper.mapToEntity(documentDto);
        return documentMapper.mapToDto(documentRepository.save(document));
    }

    @Override
    public DocumentDto update(Long id, DocumentDto documentDto) {
        DocumentEntity document = findDocument(id);
        document.setTitle(documentDto.getTitle());
        document.setFileName(documentDto.getFileName());
        document.setContentType(documentDto.getContentType());
        document.setFileSize(documentDto.getFileSize());
        return documentMapper.mapToDto(documentRepository.save(document));
    }

    @Override
    public void delete(Long id) {
        documentRepository.delete(findDocument(id));
    }

    private DocumentEntity findDocument(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document with id " + id + " not found"));
    }
}
