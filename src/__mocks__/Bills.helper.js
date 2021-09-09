import { localStorageMock } from "./localStorage";

export function setLocalStorage(item, type, email) {
  Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
  });
  window.localStorage.setItem(
    item,
    JSON.stringify({
      type: type,
      email: email,
    })
  );
}

export function setLocation(pathname) {
  Object.defineProperty(window, "location", {
    value: {
      hash: pathname,
    },
  });
}
