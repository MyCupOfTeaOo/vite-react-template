import { useEffect, useRef } from 'react';

function useMound() {
  const mound = useRef(true);
  useEffect(() => {
    return () => {
      mound.current = false;
    };
  }, []);
  return mound;
}
export default useMound;
