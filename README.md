# Mobx-State-Tree Persist

Easily persist and rehydrate your [MobX-State-Tree](https://github.com/mobxjs/mobx-state-tree) data stores.


## Usage

Configure which nodes from data tree should be persisted and use the `persist` API. Each node can be individually configured:

### Setup

```ts
const BearModel = types.model('bear')
  .props({
    number: types.optional(types.number, 0)
  });

const FishModel = types.model('fish')
  .props({
    number: types.optional(types.number, 0)
  });

const RootModel = types.model('root')
  .props({
    fish: FishModel,
    bear: BearModel,
  });

const rootStore = RootModel.create({
  fish: {},
  bear: {},
});

const persistStore = persist([
  [rootStore.bear, {key: "bear", storage: AsyncStorage}],
  [rootStore.fish, {key: "fish", storage: AsyncStorage}],
])
```

### Rehydraed?

The call to `persist` returns a state tree node in intself that can obvserved in any component. The node contains a `isRehydrated` computed value that flips to `true` once each configured store has had a chance to load data.


```ts
// Example in React
import {observer} from 'mobx-react-lite';

const App = observer(() => {

  // return 'null' until store rehydrated
  if (!persistStore.isRehydrated) {
    return null;
  }

  return (
    // app content
  );
});
```

## Options

| option | Description |
| ------ | ----------- |
| key | **required** - key data is stored under within the Storage Engine. |
| storage | **required** - Storage Engine the node is saved within. Any engine can be used that implements the Storage Interface |
| delay | **optional** - delay timeout in ms before data should be written out to Storage Engine. Default value: `0`

## Storage Interface

Any Storage Engine may be used that implements the following interface:

```ts
export type Storage = {
  getItem: (key: string) => Promise<string | null | undefined>;
  setItem: (key: string, data: string) => Promise<void>;
};
```


