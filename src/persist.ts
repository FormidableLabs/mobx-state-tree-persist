import { applySnapshot, IStateTreeNode, onSnapshot } from "mobx-state-tree";
import {
  IPersistStoreModel,
  PeristStoreModel,
  PersistStoreNode,
} from "./persistStore";

export type Storage = {
  getItem: (key: string) => Promise<string | null | undefined>;
  setItem: (key: string, data: string) => Promise<void>;
};

export type PersistConfig = {
  key: string;
  storage: Storage;
  delay?: number;
};
export type PersistEntry = [IStateTreeNode, PersistConfig];

type PersistProps = Array<PersistEntry>;
export const persist = (persistEntries: PersistProps) => {
  const persistStore = PeristStoreModel.create();

  for (const persistEntry of persistEntries) {
    createPersistNode(persistStore, persistEntry);
  }

  persistStore.setInitialized(true);
  return persistStore;
};

const createPersistNode = async (
  persistStore: IPersistStoreModel,
  persistEntry: PersistEntry
) => {
  const [node, configProp] = persistEntry;
  const config: PersistConfig = Object.assign({ duration: 0 }, configProp);

  const persistStoreNode = PersistStoreNode.create({
    key: config.key,
  });
  persistStore.addNode(persistStoreNode);

  let timeout: ReturnType<typeof setTimeout> | number;
  onSnapshot(node, (snapshot) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      config.storage.setItem(config.key, JSON.stringify(snapshot));
    }, config.delay);
  });

  // load from storage
  try {
    const restoredState = await config.storage.getItem(config.key);
    if (restoredState) {
      applySnapshot(node, JSON.parse(restoredState));
    }
    persistStoreNode.setRehydrated(true);
  } catch (e) {}
};
