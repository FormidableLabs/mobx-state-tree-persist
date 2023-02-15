export function waitFor(conditionFunction: () => boolean) {
  let iterations = 0;
  const poll = (
    resolve: (value: unknown) => void,
    reject: (reason: string) => void
  ) => {
    iterations += 1;
    if (conditionFunction()) {
      resolve(null);
    } else if (iterations >= 10) {
      reject("waitFor timeout error");
    } else setTimeout(() => poll(resolve, reject), 100);
  };

  return new Promise(poll);
}
