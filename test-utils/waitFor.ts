export function waitFor(conditionFunction: () => boolean) {
  const poll = (resolve: (value: unknown) => void) => {
    if (conditionFunction()) resolve(null);
    else setTimeout(() => poll(resolve), 100);
  };

  return new Promise(poll);
}
