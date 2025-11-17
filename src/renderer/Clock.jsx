import React, { useState, useEffect } from 'react';

function Clock() {
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const time = date.toLocaleTimeString('en-GB');
  const day = date.toLocaleDateString('en-GB');

  return (
    <div className="text-center">
      <p className="text-indigo-300 font-mono text-lg leading-none">{time}</p>
      <p className="text-gray-400 font-mono text-xs leading-none">{day}</p>
    </div>
  );
}

export default Clock;
