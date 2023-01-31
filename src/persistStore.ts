import { Instance, types } from "mobx-state-tree";

export const PersistStoreNode = types
  .model("PersistStoreNode")
  .props({
    key: types.string,
    rehydrated: false,
  })
  .actions((store) => ({
    setRehydrated(isRehydrated: boolean) {
      store.rehydrated = isRehydrated;
    },
  }));
type IPersistStoreNode = Instance<typeof PersistStoreNode>;

export const PeristStoreModel = types
  .model("PersistStore")
  .props({
    persistedNodes: types.array(PersistStoreNode),
    initialized: false,
  })
  .views((store) => ({
    get isRehydrated() {
      return (
        store.initialized &&
        store.persistedNodes.every((node) => node.rehydrated)
      );
    },
  }))
  .actions((store) => ({
    addNode(node: IPersistStoreNode) {
      store.persistedNodes.push(node);
    },
    setInitialized(isInitialized: boolean) {
      store.initialized = isInitialized;
    },
  }));
export type IPersistStoreModel = Instance<typeof PeristStoreModel>;
