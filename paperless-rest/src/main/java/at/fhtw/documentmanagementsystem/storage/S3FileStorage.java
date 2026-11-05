package at.fhtw.documentmanagementsystem.storage;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.errors.MinioException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class S3FileStorage implements FileStorage {

    private final MinioClient client;
    private final StorageProperties properties;

    @PostConstruct
    void createBucketIfMissing() {
        try {
            if (!client.bucketExists(BucketExistsArgs.builder().bucket(properties.bucket()).build())) {
                client.makeBucket(MakeBucketArgs.builder().bucket(properties.bucket()).build());
                log.info("Created bucket {}", properties.bucket());
            }
        } catch (MinioException | IllegalStateException e) {
            throw new StorageException("Could not create bucket " + properties.bucket(), e);
        }
    }

    @Override
    public void store(String key, byte[] content) {
        log.info("Storing file {} in bucket {}", key, properties.bucket());
        try {
            client.putObject(PutObjectArgs.builder()
                    .bucket(properties.bucket())
                    .object(key)
                    .data(content, content.length)
                    .build());
        } catch (MinioException | IllegalStateException e) {
            throw new StorageException("Could not store file " + key, e);
        }
    }

    @Override
    public void delete(String key) {
        log.info("Deleting file {} from bucket {}", key, properties.bucket());
        try {
            client.removeObject(RemoveObjectArgs.builder().bucket(properties.bucket()).object(key).build());
        } catch (MinioException | IllegalStateException e) {
            throw new StorageException("Could not delete file " + key, e);
        }
    }
}
