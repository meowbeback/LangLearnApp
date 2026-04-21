import React from 'react';
import './LessonProgressBar.css';

const LessonProgressBar = ({ current, total }) => {
  const pct = total > 0 ? Math.round(((current + 1) / total) * 100) : 0;
  return (
    <div className="lesson-progress-bar" role="progressbar" aria-valuenow={current + 1} aria-valuemin={0} aria-valuemax={total}>
      <div className="lesson-progress-bar-fill" style={{ width: `${pct}%` }} />
    </div>
  );
};

export default LessonProgressBar;
