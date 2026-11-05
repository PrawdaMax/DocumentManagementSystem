package at.fhtw.documentmanagementsystem.storage;

public interface FileStorage {

    void store(String key, byte[] content);

    void delete(String key);
}
