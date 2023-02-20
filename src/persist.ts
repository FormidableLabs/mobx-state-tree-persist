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
  whitelist?: Array<string>;
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
  const config: PersistConfig = { delay: 0, ...configProp };

  const persistStoreNode = PersistStoreNode.create({
    key: config.key,
  });
  persistStore.addNode(persistStoreNode);

  let timeout: ReturnType<typeof setTimeout> | number;
  onSnapshot(node, (snapshotArg) => {
    clearTimeout(timeout);

    const snapshot = { ...snapshotArg };
    timeout = setTimeout(() => {
      for (const elem in snapshot) {
        if (config.whitelist && config.whitelist.indexOf(elem) === -1) {
          delete snapshot[elem];
        }
      }

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
