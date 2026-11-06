interface LocalStorage {
  get: (key: string) => string | null;
  set: (key: string, value: string) => boolean;
  remove: (key: string) => boolean;
  clear: () => boolean;
}

const localStorage: LocalStorage = {
  get: (key: string) => {
    try {
      const value = window.localStorage.getItem(key);
      return value;
    } catch {
      return null;
    }
  },

  set: (key: string, value: string) => {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  },

  remove: (key: string) => {
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },

  clear: () => {
    try {
      window.localStorage.clear();
      return true;
    } catch {
      return false;
    }
  },
};

export default localStorage;
