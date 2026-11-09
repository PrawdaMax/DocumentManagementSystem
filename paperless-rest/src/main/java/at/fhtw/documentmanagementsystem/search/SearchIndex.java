package at.fhtw.documentmanagementsystem.search;

import java.util.List;

public interface SearchIndex {

    List<Long> findDocumentIds(String query);

    void delete(Long documentId);
}
