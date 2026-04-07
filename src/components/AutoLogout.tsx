'use client';

import { useEffect, useRef } from 'react';
import { logoutAction } from '@/app/actions/auth';

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds

export function AutoLogout() {
  const lastActivityDate = useRef(Date.now());

  useEffect(() => {
    // Reset the inactivity timer
    const resetTimer = () => {
      lastActivityDate.current = Date.now();
    };

    // Events to listen to for "activity"
    const events = [
      'mousemove',
      'keydown',
      'click',
      'scroll',
      'touchstart',
    ];

    // Add event listeners
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Check periodically if 5 minutes have elapsed since last activity
    const intervalId = setInterval(() => {
      if (Date.now() - lastActivityDate.current > INACTIVITY_TIMEOUT) {
        logoutAction().catch(() => {
          // Fallback redirect if NEXT_REDIRECT error is not automatically caught
          window.location.href = '/login';
        });
      }
    }, 10000); // Check every 10 seconds

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      clearInterval(intervalId);
    };
  }, []);

  // Render nothing as this is a logic-only component
  return null;
}
