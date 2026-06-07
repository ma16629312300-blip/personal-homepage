import { useEffect, useState } from 'react';

/**
 * P5R-style date/time display — like the calendar in Persona 5's top-left corner.
 * Shows current date and time with that signature P5 aesthetic.
 */
export default function DateDisplay() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const day = weekdays[now.getDay()];
  const date = now.getDate();
  const month = now.getMonth() + 1;
  const time = now.toLocaleTimeString('zh-CN', { hour12: false });

  return (
    <div className="date-display" aria-label="Current date and time">
      <div className="date-display__weekday">{day}</div>
      <div className="date-display__date">
        <span className="date-display__month">{String(month).padStart(2, '0')}</span>
        <span className="date-display__sep">/</span>
        <span className="date-display__day">{String(date).padStart(2, '0')}</span>
      </div>
      <div className="date-display__time">{time}</div>
    </div>
  );
}
