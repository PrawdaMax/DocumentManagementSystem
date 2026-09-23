package at.fhtw.documentmanagementsystem.presentation;

import at.fhtw.documentmanagementsystem.business.DocumentService;
import at.fhtw.documentmanagementsystem.business.dto.DocumentDto;
import at.fhtw.documentmanagementsystem.business.dto.StatusChangeDto;
import at.fhtw.documentmanagementsystem.business.exception.InvalidStatusChangeException;
import at.fhtw.documentmanagementsystem.business.exception.ResourceNotFoundException;
import at.fhtw.documentmanagementsystem.persistence.entity.DocumentStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(DocumentController.class)
class DocumentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DocumentService documentService;

    @Test
    void getAll_returnsDocuments() throws Exception {
        when(documentService.getAll()).thenReturn(List.of(document(1L, "Invoice")));

        mockMvc.perform(get("/api/documents"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].title").value("Invoice"));
    }

    @Test
    void getById_unknownId_returns404() throws Exception {
        when(documentService.getById(99L)).thenThrow(new ResourceNotFoundException("Document with id 99 not found"));

        mockMvc.perform(get("/api/documents/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Document with id 99 not found"));
    }

    @Test
    void create_validDocument_returns201WithLocation() throws Exception {
        when(documentService.create(any(DocumentDto.class))).thenReturn(document(1L, "Invoice"));

        mockMvc.perform(post("/api/documents")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title": "Invoice", "fileName": "invoice.pdf", "fileSize": 1024}
                                """))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/documents/1"))
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void create_blankTitle_returns400() throws Exception {
        mockMvc.perform(post("/api/documents")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title": ""}
                                """))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(documentService);
    }

    @Test
    void delete_existingId_returns204() throws Exception {
        mockMvc.perform(delete("/api/documents/1"))
                .andExpect(status().isNoContent());

        verify(documentService).delete(1L);
    }

    @Test
    void changeStatus_allowedChange_returnsDocumentWithNewStatus() throws Exception {
        DocumentDto updated = DocumentDto.builder().id(1L).title("Invoice").status(DocumentStatus.IN_REVIEW).build();
        when(documentService.changeStatus(eq(1L), any(StatusChangeDto.class))).thenReturn(updated);

        mockMvc.perform(patch("/api/documents/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"status": "IN_REVIEW", "comment": "Review started"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_REVIEW"));
    }

    @Test
    void changeStatus_notAllowedChange_returns409() throws Exception {
        when(documentService.changeStatus(eq(1L), any(StatusChangeDto.class)))
                .thenThrow(new InvalidStatusChangeException("Status change from RECEIVED to DONE is not allowed"));

        mockMvc.perform(patch("/api/documents/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"status": "DONE"}
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("Status change from RECEIVED to DONE is not allowed"));
    }

    private static DocumentDto document(Long id, String title) {
        return DocumentDto.builder().id(id).title(title).build();
    }
}
