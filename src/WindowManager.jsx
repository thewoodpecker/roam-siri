import React, { createContext, useContext, useReducer, useCallback } from 'react';

const WindowManagerContext = createContext(null);

function wmReducer(state, action) {
  const win = state.windows[action.id];

  switch (action.type) {
    case 'OPEN':
      return {
        ...state,
        topZIndex: state.topZIndex + 1,
        windows: {
          ...state.windows,
          [action.id]: { ...win, isOpen: true, zIndex: state.topZIndex + 1 },
        },
      };

    case 'CLOSE':
      return {
        ...state,
        windows: {
          ...state.windows,
          [action.id]: { ...win, isOpen: false },
        },
      };

    case 'FOCUS':
      if (!win || win.zIndex === state.topZIndex) return state;
      return {
        ...state,
        topZIndex: state.topZIndex + 1,
        windows: {
          ...state.windows,
          [action.id]: { ...win, zIndex: state.topZIndex + 1 },
        },
      };

    case 'MOVE':
      if (!win) return state;
      return {
        ...state,
        windows: {
          ...state.windows,
          [action.id]: { ...win, position: action.position },
        },
      };

    default:
      return state;
  }
}

export function WindowManagerProvider({ children, initialWindows }) {
  const windows = {};
  initialWindows.forEach(w => {
    windows[w.id] = {
      id: w.id,
      isOpen: w.isOpen ?? false,
      position: w.position ?? { x: 0, y: 0 },
      size: w.size ?? { width: 800, height: 600 },
      zIndex: w.zIndex ?? 1,
    };
  });

  const maxZ = Math.max(...initialWindows.map(w => w.zIndex ?? 1));
  const [state, dispatch] = useReducer(wmReducer, { windows, topZIndex: maxZ });

  const open = useCallback((id) => dispatch({ type: 'OPEN', id }), []);
  const close = useCallback((id) => dispatch({ type: 'CLOSE', id }), []);
  const focus = useCallback((id) => dispatch({ type: 'FOCUS', id }), []);
  const move = useCallback((id, position) => dispatch({ type: 'MOVE', id, position }), []);

  return (
    <WindowManagerContext.Provider value={{ state, open, close, focus, move }}>
      {children}
    </WindowManagerContext.Provider>
  );
}

export function useWindowManager() {
  return useContext(WindowManagerContext);
}

export function useWindow(id) {
  const { state, open, close, focus, move } = useWindowManager();
  const win = state.windows[id];
  const isFocused = win?.zIndex === state.topZIndex;
  return {
    ...win,
    isFocused,
    open: () => open(id),
    close: () => close(id),
    focus: () => focus(id),
    move: (pos) => move(id, pos),
  };
}
