export default function combineReducers (reducers) {
  const keys = Object.keys(reducers);
  return function (state, action) {
    let hasChanged = false;
    const nextFullState = {};
    keys.forEach(k => {
      const prevStateForKey = state[k];
      const stateForKey = reducers[k](state[k], action);
      if (stateForKey === undefined) {
        throw new Error('Reducer for `' + k + '` returned `undefined`');
      }
      if (!prevStateForKey !== stateForKey) {
        hasChanged = true;
        nextFullState[k] = stateForKey;
      }
    });
    return hasChanged ? nextFullState : state;
  }
}
