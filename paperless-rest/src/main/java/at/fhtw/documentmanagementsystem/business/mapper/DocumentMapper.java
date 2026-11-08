package at.fhtw.documentmanagementsystem.business.mapper;

import at.fhtw.documentmanagementsystem.business.dto.DocumentDto;
import at.fhtw.documentmanagementsystem.business.dto.DocumentUploadDto;
import at.fhtw.documentmanagementsystem.persistence.entity.DocumentEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Collection;
import java.util.List;

@Mapper(componentModel = "spring")
public interface DocumentMapper {

    DocumentDto mapToDto(DocumentEntity entity);

    List<DocumentDto> mapToDto(Collection<DocumentEntity> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "uploadedAt", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "history", ignore = true)
    @Mapping(target = "title", expression = "java(uploadDto.titleOrFileName())")
    @Mapping(target = "contentType", constant = "application/pdf")
    @Mapping(target = "fileSize", expression = "java(uploadDto.getContent() != null ? (long) uploadDto.getContent().length : 0L)")
    DocumentEntity mapToEntity(DocumentUploadDto uploadDto);
}
