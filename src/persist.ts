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
  const [node, config] = persistEntry;
  const persistStoreNode = PersistStoreNode.create({
    key: config.key,
  });
  persistStore.addNode(persistStoreNode);

  // load from storage
  try {
    const restoredState = await config.storage.getItem(config.key);
    if (restoredState) {
      applySnapshot(node, JSON.parse(restoredState));
    }
    persistStoreNode.setRehydrated(true);
  } catch (e) {}

  onSnapshot(node, (snapshot) => {
    config.storage.setItem(config.key, JSON.stringify(snapshot));
  });
};
