import { LocalStorage } from '../enums/localStorage';

export function saveImages(imageArray) {
  localStorage.setItem(LocalStorage.Images, JSON.stringify(imageArray));
}

export function getLocalStorageImages() {
  return JSON.parse(localStorage.getItem(LocalStorage.Images));
}

export function saveCharacters(characterArray) {
  localStorage.setItem(LocalStorage.Characters, JSON.stringify(characterArray));
}

export function getLocalStorageCharacters() {
  return JSON.parse(localStorage.getItem(LocalStorage.Characters));
}
