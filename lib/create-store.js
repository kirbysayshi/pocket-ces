export default function createStore (reducer, initialState) {
  let subs = [];
  let store = { dispatch, subscribe, getState };
  let state = initialState;
  let isDispatching = false;

  function dispatch (action) {
    // Thunk "middleware" support
    if (typeof action === 'function') {
      return action(dispatch, getState);
    } else {
      if (isDispatching === true) throw new Error(''
        + 'Cannot dispatch from within a reducer! '
        + JSON.stringify(action));
      try {
        isDispatching = true;
        state = reducer(state, action);
      } finally {
        isDispatching = false;
      }
      subs.slice(0).forEach(s => s());
      return action;
    }
  }

  function getState () { return state; }
  function subscribe (cb) {
    subs.push(cb);
    return function () {
      subs.splice(subs.indexOf(cb), 1);
    }
  }

  return store;
}
