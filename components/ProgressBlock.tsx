import React, { useState, useRef, useCallback, CSSProperties, useEffect } from 'react';
import { ProgressBlockData } from '../types';
import { ROW_HEIGHT } from '../constants';

interface ProgressBlockProps {
  block: ProgressBlockData;
  monthWidth: number;
  startMonthAbsIndex: number; // 0-indexed absolute month of timeline start
  totalTimelineMonths: number; // Total months across the timeline
  onEdit: (block: ProgressBlockData) => void;
  onUpdatePositionOrSize: (block: ProgressBlockData) => void;
  onDragStart: (e: React.DragEvent | null, id: string) => void; 
  onDragEnd: () => void;
  onDelete: (id: string) => void;
  style: CSSProperties;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

const ProgressBlock: React.FC<ProgressBlockProps> = ({
  block,
  monthWidth,
  startMonthAbsIndex,
  totalTimelineMonths,
  onEdit,
  onUpdatePositionOrSize,
  onDragStart, 
  onDragEnd,
  onDelete,
  style,
  isSelected,
  onSelect,
}) => {
  const [isResizingLeft, setIsResizingLeft] = useState<boolean>(false);
  const [isResizingRight, setIsResizingRight] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [resizeTooltip, setResizeTooltip] = useState<string | null>(null);
  const [resizeEdge, setResizeEdge] = useState<'left' | 'right' | null>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const blockRef = useRef<HTMLDivElement>(null);
  const startMouseX = useRef<number>(0);
  const startMouseY = useRef<number>(0);
  const startBlockLeft = useRef<number>(0);
  const startBlockWidth = useRef<number>(0);
  const startRowIndex = useRef<number>(0);

  // Refs to track initial state for batch dragging logic (if implemented in parent)
  // Currently used locally for delta calculation
  const initialStartAbsMonth = useRef<number>(0);
  const initialRow = useRef<number>(0);

  // Calculate block's current absolute 0-indexed month range
  const currentBlockStartAbsMonth = block.startYear * 12 + (block.startMonth - 1);
  const currentBlockEndAbsMonth = block.endYear * 12 + (block.endMonth - 1);
  const blockDurationMonths = currentBlockEndAbsMonth - currentBlockStartAbsMonth + 1;

  // Timeline absolute 0-indexed month range
  const timelineStartAbsMonth = startMonthAbsIndex;
  const timelineEndAbsMonth = startMonthAbsIndex + totalTimelineMonths - 1;

  const handleMouseDown = useCallback((e: React.MouseEvent, type: 'left' | 'right' | 'drag') => {
    e.stopPropagation();
    e.preventDefault(); // Prevent native text selection or drag behavior

    // Trigger selection on click
    if (onSelect) {
       // Check for modifier keys
       const isMultiSelect = e.ctrlKey || e.metaKey || e.shiftKey;
       onSelect(block.id, isMultiSelect);
    }

    startMouseX.current = e.clientX;
    startMouseY.current = e.clientY;

    if (blockRef.current) {
      startBlockLeft.current = blockRef.current.offsetLeft;
      startBlockWidth.current = blockRef.current.offsetWidth;
      // Calculate start row based on current top position. top = 10 + row * ROW_HEIGHT
      const currentTop = parseInt(blockRef.current.style.top || '10', 10);
      startRowIndex.current = Math.max(0, Math.round((currentTop - 10) / ROW_HEIGHT));
    }

    // Capture initial logical state for delta calculations
    initialStartAbsMonth.current = currentBlockStartAbsMonth;
    initialRow.current = block.row !== undefined ? block.row : startRowIndex.current;

    if (type === 'left') setIsResizingLeft(true);
    else if (type === 'right') setIsResizingRight(true);
    else if (type === 'drag') {
      setIsDragging(true);
      // Notify parent about drag start (useful for showing trash can)
      onDragStart(null, block.id);
    }

    document.body.style.cursor = type === 'drag' ? 'grabbing' : 'ew-resize';
  }, [block.id, onDragStart, onSelect, currentBlockStartAbsMonth, block.row]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizingLeft && !isResizingRight && !isDragging) return;

    // Adjusted deltaX relative to the mouse start
    const deltaX = e.clientX - startMouseX.current;
    const deltaY = e.clientY - startMouseY.current;

    if (isResizingLeft) {
      const newLeftPx = startBlockLeft.current + deltaX;
      // Convert pixels to months, snapping to nearest month
      const proposedStartOffsetMonths = Math.round(newLeftPx / monthWidth);
      const proposedStartAbsMonth = startMonthAbsIndex + proposedStartOffsetMonths;

      // Ensure newStartAbsMonth is not after the current (fixed) end, and not before timeline start
      let newStartAbsMonth = Math.min(proposedStartAbsMonth, currentBlockEndAbsMonth);
      newStartAbsMonth = Math.max(timelineStartAbsMonth, newStartAbsMonth);

      // The end remains fixed
      const newEndAbsMonth = currentBlockEndAbsMonth;

      // Update tooltip for left resize
      const displayYear = Math.floor(newStartAbsMonth / 12);
      const displayMonth = (newStartAbsMonth % 12) + 1;
      setResizeTooltip(`${displayYear}/${displayMonth}`);
      setResizeEdge('left');

      const newStartYear = Math.floor(newStartAbsMonth / 12);
      const newStartMonth = (newStartAbsMonth % 12) + 1;
      const newEndYear = Math.floor(newEndAbsMonth / 12);
      const newEndMonth = (newEndAbsMonth % 12) + 1;

      onUpdatePositionOrSize({ ...block, startYear: newStartYear, startMonth: newStartMonth, endYear: newEndYear, endMonth: newEndMonth });

    } else if (isResizingRight) {
      const newRightPx = startBlockLeft.current + startBlockWidth.current + deltaX;
      // Convert pixels to months, snapping to nearest month (adjusting for 0-indexed month)
      const proposedEndOffsetMonths = Math.round(newRightPx / monthWidth) - 1; 
      const proposedEndAbsMonth = startMonthAbsIndex + proposedEndOffsetMonths;

      // Ensure newEndAbsMonth is not before the current (fixed) start, and not after timeline end
      let newEndAbsMonth = Math.max(proposedEndAbsMonth, currentBlockStartAbsMonth);
      newEndAbsMonth = Math.min(timelineEndAbsMonth, newEndAbsMonth);

      // The start remains fixed
      const newStartAbsMonth = currentBlockStartAbsMonth;

      // Update tooltip for right resize
      const displayYear = Math.floor(newEndAbsMonth / 12);
      const displayMonth = (newEndAbsMonth % 12) + 1;
      setResizeTooltip(`${displayYear}/${displayMonth}`);
      setResizeEdge('right');

      const newStartYear = Math.floor(newStartAbsMonth / 12);
      const newStartMonth = (newStartAbsMonth % 12) + 1;
      const newEndYear = Math.floor(newEndAbsMonth / 12);
      const newEndMonth = (newEndAbsMonth % 12) + 1;

      onUpdatePositionOrSize({ ...block, startYear: newStartYear, startMonth: newStartMonth, endYear: newEndYear, endMonth: newEndMonth });

    } else if (isDragging) {
      // Calculate deltas relative to drag start
      const newLeftPx = startBlockLeft.current + deltaX;
      const proposedStartOffsetMonths = Math.round(newLeftPx / monthWidth);
      const proposedStartAbsMonth = startMonthAbsIndex + proposedStartOffsetMonths;
      
      const deltaMonths = proposedStartAbsMonth - initialStartAbsMonth.current;
      const deltaRows = Math.round(deltaY / ROW_HEIGHT);

      // We will cast props to any to check for onBatchUpdate as it was added in a previous step to TimelineSection but might be missing in interface here
      const propsAny = { onBatchUpdate: undefined, ...({} as any) }; // Check if passed via spread or context

      let tempNewStartAbsMonth = proposedStartAbsMonth;
      let tempNewEndAbsMonth = tempNewStartAbsMonth + blockDurationMonths - 1;

      // Apply timeline bounds for dragging
      if (tempNewStartAbsMonth < timelineStartAbsMonth) {
        tempNewStartAbsMonth = timelineStartAbsMonth;
        tempNewEndAbsMonth = tempNewStartAbsMonth + blockDurationMonths - 1;
      }
      if (tempNewEndAbsMonth > timelineEndAbsMonth) {
        tempNewEndAbsMonth = timelineEndAbsMonth;
        tempNewStartAbsMonth = tempNewEndAbsMonth - blockDurationMonths + 1;
      }

      const newRow = Math.max(0, startRowIndex.current + deltaRows);

      // Convert back
      const newStartYear = Math.floor(tempNewStartAbsMonth / 12);
      const newStartMonth = (tempNewStartAbsMonth % 12) + 1;
      const newEndYear = Math.floor(tempNewEndAbsMonth / 12);
      const newEndMonth = (tempNewEndAbsMonth % 12) + 1;

      onUpdatePositionOrSize({
        ...block,
        startYear: newStartYear,
        startMonth: newStartMonth,
        endYear: newEndYear,
        endMonth: newEndMonth,
        row: newRow,
      });
      
    }
  }, [
    isResizingLeft,
    isResizingRight,
    isDragging,
    monthWidth,
    startMonthAbsIndex,
    timelineStartAbsMonth,
    timelineEndAbsMonth,
    currentBlockStartAbsMonth,
    currentBlockEndAbsMonth,
    blockDurationMonths,
    block,
    onUpdatePositionOrSize,
    initialStartAbsMonth
  ]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    // Collision detection with Trash Can
    if (isDragging) {
      const trashCan = document.getElementById('app-trash-can');
      let isDeleted = false;

      if (trashCan) {
        const rect = trashCan.getBoundingClientRect();
        // Expand the hit area by 30px to make it easier to drop
        const buffer = 30;
        const isOverTrash = 
          e.clientX >= rect.left - buffer &&
          e.clientX <= rect.right + buffer &&
          e.clientY >= rect.top - buffer &&
          e.clientY <= rect.bottom + buffer;

        if (isOverTrash) {
          onDelete(block.id);
          isDeleted = true;
        }
      }
      onDragEnd(); // Notify App dragging ended
      
      if (isDeleted) return; // Component will likely unmount
    }

    setIsResizingLeft(false);
    setIsResizingRight(false);
    setIsDragging(false);
    setResizeTooltip(null);
    setResizeEdge(null);
    document.body.style.cursor = 'default';
  }, [block.id, isDragging, onDelete, onDragEnd]);

  useEffect(() => {
    if (isResizingLeft || isResizingRight || isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingLeft, isResizingRight, isDragging, handleMouseMove, handleMouseUp]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(block);
  };

  return (
    <div
      ref={blockRef}
      className={`progress-block-draggable absolute rounded-[2mm] shadow-md flex items-center justify-center text-xs font-semibold text-white px-3 cursor-grab transition-colors duration-100
        bg-${block.color}-400 hover:bg-${block.color}-500 active:cursor-grabbing group border border-${block.color}-600/20
        ${isSelected ? 'ring-2 ring-blue-600 ring-offset-1 z-50' : ''}`}
      style={{
        ...style,
        transition: isDragging ? 'none' : 'top 0.2s ease, left 0.1s linear', // Smooth transition except when dragging
        zIndex: isDragging ? 100 : (isHovered ? 60 : 10), // High z-index when dragging or hovered, low otherwise
      }}
      title={block.name} // Native tooltip as fallback
      onDoubleClick={handleDoubleClick}
      onMouseDown={(e) => handleMouseDown(e, 'drag')}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-block-id={block.id}
      role="listitem"
      aria-label={`Skill progress: ${block.name}`}
    >
      {/* Tooltip for Resizing */}
      {resizeTooltip && (
        <div 
          className={`absolute -top-8 ${resizeEdge === 'left' ? 'left-0' : 'right-0'} bg-gray-800 text-white text-[10px] px-2 py-1 rounded shadow-lg z-50 whitespace-nowrap pointer-events-none`}
        >
          {resizeTooltip}
        </div>
      )}

      {/* Left resize handle */}
      <div
        className="absolute left-0 top-0 bottom-0 w-4 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onMouseDown={(e) => handleMouseDown(e, 'left')}
        aria-label="Resize left edge of block"
      ></div>
      
      <span className="truncate w-full text-center drop-shadow-sm pointer-events-none">{block.name}</span>
      
      {/* Right resize handle */}
      <div
        className="absolute right-0 top-0 bottom-0 w-4 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onMouseDown={(e) => handleMouseDown(e, 'right')}
        aria-label="Resize right edge of block"
      ></div>
    </div>
  );
};

export default ProgressBlock;