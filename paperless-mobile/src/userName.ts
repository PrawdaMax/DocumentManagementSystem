import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'paperless-user-name';

let userName = '';

export function getUserName() {
    return userName;
}

export async function loadUserName() {
    userName = (await AsyncStorage.getItem(STORAGE_KEY)) ?? '';
    return userName;
}

export async function saveUserName(name: string) {
    userName = name;
    await AsyncStorage.setItem(STORAGE_KEY, name);
}
