package at.fhtw.documentmanagementsystem.business.mapper;

import at.fhtw.documentmanagementsystem.business.dto.DocumentHistoryDto;
import at.fhtw.documentmanagementsystem.persistence.entity.DocumentHistoryEntity;
import org.mapstruct.Mapper;

import java.util.Collection;
import java.util.List;

@Mapper(componentModel = "spring")
public interface DocumentHistoryMapper {

    DocumentHistoryDto mapToDto(DocumentHistoryEntity entity);

    List<DocumentHistoryDto> mapToDto(Collection<DocumentHistoryEntity> entities);
}
