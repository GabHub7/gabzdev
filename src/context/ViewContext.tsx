import { createContext, useContext } from 'react';

export type View = 'portfolio' | 'login' | 'dashboard' | 'projects';

interface ViewContextType {
  view: View;
  setView: (v: View) => void;
}

export const ViewContext = createContext<ViewContextType>({
  view: 'portfolio',
  setView: () => {},
});

export function useView() {
  return useContext(ViewContext);
}
