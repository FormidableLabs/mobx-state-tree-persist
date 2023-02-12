import { beforeEach, describe, expect, test, vi } from "vitest";
import { testStorage } from "../test-utils/storage";
import { persist } from "./persist";
import { SnapshotOut, getSnapshot, types } from "mobx-state-tree";
import { waitFor } from "../test-utils/waitFor";

const UserModel = types
  .model("user")
  .props({
    firstName: types.maybe(types.string),
    lastName: types.maybe(types.string),
  })
  .actions((store) => ({
    setFirstName(firstName: string) {
      store.firstName = firstName;
    },
    setLastName(lastName: string) {
      store.lastName = lastName;
    },
  }));
type IUserSnapshotOut = SnapshotOut<typeof UserModel>;

beforeEach(() => {
  testStorage.clearStore();
});

describe("persist", () => {
  test("should read from storage on initialize", () => {
    const userNode = UserModel.create();
    const persistedData: IUserSnapshotOut = {
      firstName: "test",
      lastName: "user",
    };
    testStorage.setItem("user", JSON.stringify(persistedData));
    const persistStore = persist([
      [userNode, { key: "user", storage: testStorage }],
    ]);

    waitFor(() => persistStore.isRehydrated).then(() => {
      expect(getSnapshot(userNode)).toStrictEqual(persistedData);
    });
  });

  test("should write data on action", async () => {
    vi.useFakeTimers();

    const userNode = UserModel.create();
    persist([[userNode, { key: "user", storage: testStorage }]]);

    userNode.setFirstName("first");

    vi.runAllTimers();

    const persistedData =
      (await testStorage.getItem("user").then((data) => {
        if (data) {
          return JSON.parse(data);
        }
      })) || {};

    expect(persistedData.firstName).toEqual("first");

    vi.useRealTimers();
  });

  test("should wait for delay before writing", () => {
    const spy = vi.spyOn(testStorage, "setItem");
    vi.useFakeTimers();

    const userNode = UserModel.create();
    persist([[userNode, { key: "user", storage: testStorage, delay: 100 }]]);

    userNode.setFirstName("first");
    userNode.setLastName("first");

    vi.runAllTimers();

    expect(spy).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });
});
