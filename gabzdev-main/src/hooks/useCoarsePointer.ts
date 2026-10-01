import { useEffect, useState } from 'react';

/**
 * True kalau perangkatnya pakai pointer kasar (jari / stylus) — alias
 * layar sentuh. Dipakai buat matiin interaksi yang cuma masuk akal di
 * mouse (drag, hover) dan gantiin dengan versi yang ramah sentuh.
 */
export function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    const apply = () => setCoarse(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  return coarse;
}
