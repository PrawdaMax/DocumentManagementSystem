package at.fhtw.documentmanagementsystem.storage;

public interface FileStorage {

    void store(String key, byte[] content);

    byte[] load(String key);

    void delete(String key);
}
