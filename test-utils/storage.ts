import { Storage } from "../src";

const store: { [k: string]: string } = {};
export const testStorage: Storage & { clearStore: () => void } = {
  setItem: (key: string, data: string) => {
    store[key] = data;
    return Promise.resolve();
  },
  getItem: (key: string) => {
    const value = store[key];
    return Promise.resolve(value);
  },
  clearStore: () => {
    for (const key in store) delete store[key];
  },
};
