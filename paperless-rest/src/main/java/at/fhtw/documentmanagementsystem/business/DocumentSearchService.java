package at.fhtw.documentmanagementsystem.business;

import at.fhtw.documentmanagementsystem.business.dto.DocumentDto;

import java.util.List;

public interface DocumentSearchService {

    List<DocumentDto> search(String query);
}
