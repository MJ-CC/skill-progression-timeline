import React, { useCallback } from 'react';
import { TimelineDimensions } from '../types';

interface TimelineProps {
  startYear: number;
  endYear: number;
  onEditYears: () => void;
  timelineDimensions: TimelineDimensions; // Receive dimensions via props
}

const Timeline: React.FC<TimelineProps> = ({ startYear, endYear, onEditYears, timelineDimensions }) => {
  const { totalMonths, monthWidth, timelineWidth, startMonthAbsIndex } = timelineDimensions;

  const handleYearLabelDoubleClick = (year: number) => {
    // Only allow editing if double-clicking the first or last year label displayed on the timeline
    // The "year" argument here refers to the year associated with the label,
    // which for the last tick will be `endYear` (since we want to edit the overall endYear).
    if (year === startYear || year === endYear) {
      onEditYears();
    }
  };

  return (
    <div
      className="relative flex-shrink-0 my-4 h-20 w-full bg-gray-100 border-t border-b border-gray-300 timeline-container"
      role="grid" // For accessibility
      aria-label="Skill progression timeline"
      style={{ width: `${timelineWidth}px` }} // Use timelineWidth from props, no min-width
    >
      <div
        className="absolute h-full w-full" // Use 100% width
      >
        {/* Main horizontal line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-400 -translate-y-1/2" aria-hidden="true"></div>
        {/* Arrowhead at the end */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 border-t border-r border-gray-400 transform rotate-45"
          style={{ left: `${timelineWidth - 3}px` }}
          aria-hidden="true"
        ></div>

        {/* Ticks and Year Labels */}
        {[...Array(totalMonths + 1)].map((_, i) => { // Loop for totalMonths + 1 ticks
          const currentAbsMonthIndex = startMonthAbsIndex + i;
          const currentYear = Math.floor(currentAbsMonthIndex / 12);
          const currentMonth = (currentAbsMonthIndex % 12) + 1; // 1-indexed month

          const isStartOfYear = currentMonth === 1;
          const isFirstTick = i === 0;
          const isLastTick = i === totalMonths;

          const leftPos = i * monthWidth;

          let labelText = '';
          let showLabel = false;
          let labelYearForEdit = 0; // The year that the double-click should apply to

          if (isFirstTick) {
            labelText = `${currentYear}`;
            showLabel = true;
            labelYearForEdit = currentYear; // Start year
          } else if (isLastTick) {
            // This tick represents the start of the month AFTER the endYear's last month
            labelText = `${endYear + 1}`;
            showLabel = true;
            labelYearForEdit = endYear; // Still want to edit the endYear of the timeline range
          } else if (isStartOfYear) { // For intermediate years at their January mark
            labelText = `${currentYear}`;
            showLabel = true;
            labelYearForEdit = currentYear;
          }

          // Determine tick height and color
          const tickHeight = isStartOfYear ? 'h-6' : 'h-3';
          const tickBg = isStartOfYear ? 'bg-gray-600' : 'bg-gray-400';

          return (
            <div
              key={`tick-${i}`}
              className="absolute top-1/2 -translate-y-1/2"
              style={{ left: `${leftPos}px` }}
              role="separator"
              aria-hidden="true" // Decorative element, not meaningful to screen readers alone
            >
              {/* Vertical tick line */}
              <div className={`absolute left-0 w-px ${tickHeight} ${tickBg} -translate-y-1/2`}></div>

              {/* Year Label */}
              {showLabel && (
                <span
                  onDoubleClick={() => handleYearLabelDoubleClick(labelYearForEdit)}
                  className="absolute top-[10px] left-0 -translate-x-1/2 text-xs font-semibold text-gray-700 cursor-pointer hover:text-blue-600 transition-colors whitespace-nowrap"
                  aria-label={`Edit timeline year range (Year: ${labelText})`}
                >
                  {labelText}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;