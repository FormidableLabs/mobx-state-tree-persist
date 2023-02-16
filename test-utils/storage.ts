import { Storage } from "../src";

const store = new Map();
export const testStorage: Storage & { clearStore: () => void } = {
  setItem: (key: string, data: string) => {
    store.set(key, data);
    return Promise.resolve();
  },
  getItem: (key: string) => {
    const value = store.get(key);
    return Promise.resolve(value);
  },
  clearStore: () => {
    store.clear();
  },
};
