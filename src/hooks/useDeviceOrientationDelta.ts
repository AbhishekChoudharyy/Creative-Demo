import { useEffect, useRef } from 'react';

import { useDeviceOrientationGranted } from './useDeviceOrientationGranted';
import { useEvent } from './useEvent';

interface ICoords {
  alpha: number;
  gamma: number;
  beta: number;
}

export function useDeviceOrientationDelta(onUpdate: (coords: ICoords) => void) {
  const { granted } = useDeviceOrientationGranted();

  const prevRef = useRef<ICoords>({ alpha: 0, beta: 0, gamma: 0 });

  const handle = useEvent((evt: DeviceOrientationEvent) => {
    const a = evt.alpha || 0;
    const g = evt.gamma || 0;
    const b = evt.beta || 0;

    const alphaDiff = a - prevRef.current.alpha;
    const betaDiff = b - prevRef.current.beta;
    const gammaDiff = g - prevRef.current.gamma;

    prevRef.current = { alpha: a, beta: b, gamma: g };

    onUpdate({ alpha: alphaDiff, gamma: gammaDiff, beta: betaDiff });
  });

  useEffect(() => {
    if (!granted) {
      return undefined;
    }
    // Skip device orientation events on mobile devices as it is only used on desktop
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return undefined;
    }

    window.addEventListener('deviceorientation', handle);

    return () => {
      window.removeEventListener('deviceorientation', handle);
    };
  }, [granted, handle]);
}
