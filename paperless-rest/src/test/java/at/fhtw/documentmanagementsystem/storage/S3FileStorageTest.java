package at.fhtw.documentmanagementsystem.storage;

import io.minio.BucketExistsArgs;
import io.minio.GetObjectArgs;
import io.minio.GetObjectResponse;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.errors.MinioException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.net.UnknownHostException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class S3FileStorageTest {

    @Mock
    private MinioClient client;

    private S3FileStorage storage;

    @BeforeEach
    void setUp() {
        storage = new S3FileStorage(client, new StorageProperties("http://localhost:9000", "key", "secret", "documents"));
    }

    @Test
    void createBucketIfMissing_bucketMissing_createsBucket() throws Exception {
        when(client.bucketExists(any(BucketExistsArgs.class))).thenReturn(false);

        storage.createBucketIfMissing();

        ArgumentCaptor<MakeBucketArgs> captor = ArgumentCaptor.forClass(MakeBucketArgs.class);
        verify(client).makeBucket(captor.capture());
        assertThat(captor.getValue().bucket()).isEqualTo("documents");
    }

    @Test
    void createBucketIfMissing_bucketExists_createsNothing() throws Exception {
        when(client.bucketExists(any(BucketExistsArgs.class))).thenReturn(true);

        storage.createBucketIfMissing();

        verify(client, never()).makeBucket(any());
    }

    @Test
    void store_putsFileIntoBucketUnderKey() throws Exception {
        storage.store("a.pdf", new byte[]{1, 2, 3});

        ArgumentCaptor<PutObjectArgs> captor = ArgumentCaptor.forClass(PutObjectArgs.class);
        verify(client).putObject(captor.capture());
        assertThat(captor.getValue().bucket()).isEqualTo("documents");
        assertThat(captor.getValue().object()).isEqualTo("a.pdf");
    }

    @Test
    void store_serverError_throwsStorageException() throws Exception {
        when(client.putObject(any(PutObjectArgs.class))).thenThrow(new MinioException("Access denied"));

        assertThatThrownBy(() -> storage.store("a.pdf", new byte[]{1}))
                .isInstanceOf(StorageException.class)
                .hasMessageContaining("a.pdf");
    }

    @Test
    void store_storageNotReachable_throwsStorageException() throws Exception {
        when(client.putObject(any(PutObjectArgs.class)))
                .thenThrow(new IllegalStateException(new UnknownHostException("rustfs")));

        assertThatThrownBy(() -> storage.store("a.pdf", new byte[]{1}))
                .isInstanceOf(StorageException.class)
                .hasRootCauseInstanceOf(UnknownHostException.class);
    }

    @Test
    void delete_removesFileFromBucket() throws Exception {
        storage.delete("a.pdf");

        ArgumentCaptor<RemoveObjectArgs> captor = ArgumentCaptor.forClass(RemoveObjectArgs.class);
        verify(client).removeObject(captor.capture());
        assertThat(captor.getValue().bucket()).isEqualTo("documents");
        assertThat(captor.getValue().object()).isEqualTo("a.pdf");
    }

    @Test
    void load_returnsFileContent() throws Exception {
        GetObjectResponse response = mock(GetObjectResponse.class);
        when(response.readAllBytes()).thenReturn(new byte[]{1, 2, 3});
        when(client.getObject(any(GetObjectArgs.class))).thenReturn(response);

        assertThat(storage.load("a.pdf")).containsExactly(1, 2, 3);

        ArgumentCaptor<GetObjectArgs> captor = ArgumentCaptor.forClass(GetObjectArgs.class);
        verify(client).getObject(captor.capture());
        assertThat(captor.getValue().bucket()).isEqualTo("documents");
        assertThat(captor.getValue().object()).isEqualTo("a.pdf");
    }

    @Test
    void load_fileMissing_throwsStorageException() throws Exception {
        when(client.getObject(any(GetObjectArgs.class))).thenThrow(new MinioException("NoSuchKey"));

        assertThatThrownBy(() -> storage.load("a.pdf"))
                .isInstanceOf(StorageException.class)
                .hasMessageContaining("a.pdf");
    }
}
