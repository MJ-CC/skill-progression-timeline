import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ProgressBlock from './ProgressBlock';
import { ProgressBlockData, SectionType, TimelineDimensions } from '../types';
import { ROW_HEIGHT, BLOCK_HEIGHT } from '../constants';

interface TimelineSectionProps {
  sectionType: SectionType;
  label: string;
  onLabelChange: (newLabel: string) => void;
  progressBlocks: ProgressBlockData[];
  startYear: number;
  endYear: number;
  onAddBlock: () => void;
  onEditBlock: (block: ProgressBlockData) => void;
  onUpdateBlockPositionOrSize: (block: ProgressBlockData) => void;
  onReorderBlocks: (sectionType: SectionType, newOrder: ProgressBlockData[]) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  timelineDimensions: TimelineDimensions;
  onDeleteBlock: (blockId: string) => void;
}

// --- HELPER FUNCTIONS FOR PACKING ALGORITHM ---

/**
 * Checks if two blocks overlap in time.
 * Note: Uses inclusive start and end months.
 */
const checkOverlap = (blockA: ProgressBlockData, blockB: ProgressBlockData): boolean => {
  const startA = blockA.startYear * 12 + blockA.startMonth;
  const endA = blockA.endYear * 12 + blockA.endMonth;
  const startB = blockB.startYear * 12 + blockB.startMonth;
  const endB = blockB.endYear * 12 + blockB.endMonth;

  // Overlap occurs if one starts before the other ends
  return !(endA < startB || startA > endB);
};

/**
 * Calculates the layout for blocks, assigning them to rows to avoid overlap.
 * It respects a block's preferred `row` property if set (and valid), otherwise packs tightly.
 */
const calculatePackedLayout = (blocks: ProgressBlockData[]) => {
  const rows: ProgressBlockData[][] = [];
  const blockRowMap: Record<string, number> = {};

  blocks.forEach(block => {
    let placed = false;
    // Start trying to place from the user's preferred row, defaulting to 0
    let targetRowIndex = block.row !== undefined && block.row >= 0 ? block.row : 0;

    // Ensure rows array has enough slots
    while (rows.length <= targetRowIndex) {
      rows.push([]);
    }

    // Try to fit in preferred row or subsequent rows
    for (let i = targetRowIndex; i < 1000; i++) { // Limit to 1000 rows to prevent infinite loop
      if (i >= rows.length) {
         rows.push([]);
      }
      
      const row = rows[i];
      const hasOverlap = row.some(existingBlock => checkOverlap(block, existingBlock));

      if (!hasOverlap) {
        row.push(block);
        blockRowMap[block.id] = i;
        placed = true;
        break;
      }
    }
  });

  return {
    blockRowMap,
    totalRows: Math.max(1, rows.length)
  };
};

const TimelineSection: React.FC<TimelineSectionProps> = ({
  sectionType,
  label,
  onLabelChange,
  progressBlocks,
  startYear,
  endYear,
  onAddBlock,
  onEditBlock,
  onUpdateBlockPositionOrSize,
  onReorderBlocks,
  onDragStart,
  onDragEnd,
  timelineDimensions,
  onDeleteBlock,
}) => {
  const { totalMonths, monthWidth, timelineWidth, startMonthAbsIndex } = timelineDimensions;

  const [isEditingLabel, setIsEditingLabel] = useState<boolean>(false);
  const [currentLabel, setCurrentLabel] = useState<string>(label);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Filter blocks for this section.
  const blocksInThisSection = useMemo(() => {
    return progressBlocks.filter(b => b.section === sectionType);
  }, [progressBlocks, sectionType]);

  // Calculate row positions for all blocks in this section
  const packedLayout = useMemo(() => {
    return calculatePackedLayout(blocksInThisSection);
  }, [blocksInThisSection]);

  const sectionHeight = Math.max(100, (packedLayout.totalRows * ROW_HEIGHT) + 20); // Min height 100px

  // Effect to update label state if prop changes
  useEffect(() => {
    setCurrentLabel(label);
  }, [label]);

  const handleLabelDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the section double click
    setIsEditingLabel(true);
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentLabel(e.target.value);
  };

  const handleLabelBlur = () => {
    onLabelChange(currentLabel);
    setIsEditingLabel(false);
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  const getBlockStyles = useCallback((block: ProgressBlockData) => {
    const blockStartAbsMonth = block.startYear * 12 + (block.startMonth - 1);
    const blockEndAbsMonth = block.endYear * 12 + (block.endMonth - 1);

    const startOffsetMonths = blockStartAbsMonth - startMonthAbsIndex;
    const endOffsetMonths = blockEndAbsMonth - startMonthAbsIndex;

    const left = startOffsetMonths * monthWidth;
    const width = (endOffsetMonths - startOffsetMonths + 1) * monthWidth;

    const rowIndex = packedLayout.blockRowMap[block.id] || 0;
    const top = 10 + (rowIndex * ROW_HEIGHT); // 10px top padding

    return {
      left: `${left}px`,
      width: `${width}px`,
      minWidth: `${monthWidth}px`,
      top: `${top}px`,
      height: `${BLOCK_HEIGHT}px`,
      zIndex: 10, // Base z-index
    };
  }, [monthWidth, startMonthAbsIndex, packedLayout]);

  return (
    <div
      ref={sectionRef}
      className={`relative py-2 mb-2 bg-gray-50 rounded-lg shadow-sm
        ${sectionType === 'top' ? 'border-b-2 border-blue-200' : 'border-t-2 border-blue-200'}
        timeline-section-container w-full cursor-pointer select-none`}
      style={{ width: `${timelineWidth}px`, height: `${sectionHeight}px`, transition: 'height 0.3s ease' }}
      role="region"
      aria-label={`${sectionType === 'top' ? 'Work Training' : 'Personal Development'} Timeline Section`}
      onDoubleClick={onAddBlock}
    >
      <div
        className="absolute left-1 top-1 px-2 py-0.5 bg-blue-100/90 text-blue-800 text-xs font-bold rounded border border-blue-300 z-40 whitespace-nowrap cursor-default"
        onDoubleClick={handleLabelDoubleClick}
        onClick={(e) => e.stopPropagation()}
        aria-label={`Edit ${sectionType === 'top' ? 'Work Training' : 'Personal Development'} label`}
        title={currentLabel}
      >
        {isEditingLabel ? (
          <input
            type="text"
            value={currentLabel}
            onChange={handleLabelChange}
            onBlur={handleLabelBlur}
            onKeyDown={handleLabelKeyDown}
            className="bg-transparent border-b border-blue-800 text-blue-800 focus:outline-none w-24"
            autoFocus
            aria-label={`Edit ${sectionType === 'top' ? 'Work Training' : 'Personal Development'} label input`}
          />
        ) : (
          <span className="cursor-pointer">
            {currentLabel}
          </span>
        )}
      </div>

      <div
        className="timeline-section-blocks relative h-full w-full"
        role="group"
        aria-label={`${sectionType === 'top' ? 'Work Training' : 'Personal Development'} progress blocks`}
      >
        {blocksInThisSection.map((block) => (
          <ProgressBlock
            key={block.id}
            block={block}
            monthWidth={monthWidth}
            startMonthAbsIndex={startMonthAbsIndex}
            totalTimelineMonths={totalMonths}
            onEdit={onEditBlock}
            onUpdatePositionOrSize={onUpdateBlockPositionOrSize}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDelete={onDeleteBlock}
            style={getBlockStyles(block)}
          />
        ))}
      </div>
    </div>
  );
};

export default TimelineSection;