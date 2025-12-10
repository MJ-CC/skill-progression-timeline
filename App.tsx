import React, { useState, useEffect, useCallback, useRef } from 'react';
import Timeline from './components/Timeline';
import TimelineSection from './components/TimelineSection';
import Modal from './components/Modal';
import TrashCan from './components/TrashCan';
import { ProgressBlockData, SectionType, TimelineDimensions } from './types';
import { DEFAULT_BLOCK_COLORS, TRANSLATIONS } from './constants';
import { exportTimelineAsImage, exportTimelineAsPdf, exportTimelineAsJson } from './services/fileExportService';
import html2canvas from 'html2canvas';

// Helper to generate a unique ID
const generateId = (): string => Math.random().toString(36).substring(2, 9);

interface InitialYearInputModalProps {
  onConfirm: (start: number, end: number) => void;
  initialStartYear: number;
  initialEndYear: number;
  t: any;
}

const InitialYearInputModal: React.FC<InitialYearInputModalProps> = ({ onConfirm, initialStartYear, initialEndYear, t }) => {
  const [startYear, setStartYear] = useState<number>(initialStartYear);
  const [endYear, setEndYear] = useState<number>(initialEndYear);
  const [error, setError] = useState<string>('');

  const handleSubmit = () => {
    if (startYear >= endYear) {
      setError(t.startYearError);
      return;
    }
    setError('');
    onConfirm(startYear, endYear);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl w-96 md:w-[28rem]">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 pr-8">{t.setTimelineYears}</h3>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <div className="mb-4">
        <label htmlFor="startYear" className="block text-gray-700 text-sm font-bold mb-2">{t.startYear}</label>
        <input
          id="startYear"
          type="number"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={startYear}
          onChange={(e) => setStartYear(parseInt(e.target.value) || 0)}
          min="1900"
          max="2100"
          aria-label="Start year"
        />
      </div>
      <div className="mb-6">
        <label htmlFor="endYear" className="block text-gray-700 text-sm font-bold mb-2">{t.endYear}</label>
        <input
          id="endYear"
          type="number"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={endYear}
          onChange={(e) => setEndYear(parseInt(e.target.value) || 0)}
          min="1900"
          max="2100"
          aria-label="End year"
        />
      </div>
      <button
        onClick={handleSubmit}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
        aria-label="Confirm year selection"
      >
        {t.confirm}
      </button>
    </div>
  );
};

interface AddEditBlockModalProps {
  onConfirm: (block: ProgressBlockData) => void;
  onClose: () => void;
  initialBlock?: ProgressBlockData;
  startYear: number;
  endYear: number;
  topSectionLabel: string;
  bottomSectionLabel: string;
  t: any;
}

const AddEditBlockModal: React.FC<AddEditBlockModalProps> = ({ 
  onConfirm, 
  onClose, 
  initialBlock, 
  startYear, 
  endYear,
  topSectionLabel,
  bottomSectionLabel,
  t
}) => {
  const [name, setName] = useState<string>(initialBlock?.name || '');
  const [color, setColor] = useState<string>(initialBlock?.color || DEFAULT_BLOCK_COLORS[0]);
  
  const [sYear, setSYear] = useState<number>(initialBlock ? initialBlock.startYear : startYear);
  const [sMonth, setSMonth] = useState<number>(initialBlock ? initialBlock.startMonth : 1);
  const [eYear, setEYear] = useState<number>(initialBlock ? initialBlock.endYear : endYear);
  const [eMonth, setEMonth] = useState<number>(initialBlock ? initialBlock.endMonth : 12);

  const [section, setSection] = useState<SectionType>(initialBlock?.section || 'top');
  const [error, setError] = useState<string>('');

  const yearOptions = [];
  for (let y = startYear; y <= endYear; y++) {
    yearOptions.push(y);
  }

  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleSubmit = () => {
    if (sYear * 12 + sMonth > eYear * 12 + eMonth) {
      setError(t.dateError);
      return;
    }

    setError('');
    const newBlock: ProgressBlockData = {
      id: initialBlock?.id || generateId(),
      name,
      color,
      startYear: sYear,
      startMonth: sMonth,
      endYear: eYear,
      endMonth: eMonth,
      section,
      row: initialBlock?.row,
    };
    onConfirm(newBlock);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl w-80 md:w-96">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 pr-8">{initialBlock ? t.editSkill : t.addSkill}</h3>
      {error && <p className="text-red-500 mb-2">{error}</p>}

      <div className="mb-4">
        <label htmlFor="blockName" className="block text-gray-700 text-sm font-bold mb-2">{t.name}</label>
        <input
          id="blockName"
          type="text"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Skill name"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">{t.color}</label>
        <div className="flex flex-wrap gap-3 p-1">
          {DEFAULT_BLOCK_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`
                w-8 h-8 rounded-[2mm] transition-all duration-200 border border-gray-200 shadow-sm
                bg-${c}-400 hover:bg-${c}-500
                ${color === c ? 'ring-2 ring-offset-2 ring-gray-500 scale-110' : 'hover:scale-105'}
              `}
              aria-label={`Select color ${c}`}
              title={c}
            />
          ))}
        </div>
      </div>

      {/* Start Date Selection */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">{t.startDate}</label>
        <div className="flex gap-2">
          <div className="w-1/2">
            <select
              id="startYear"
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={sYear}
              onChange={(e) => setSYear(parseInt(e.target.value))}
              aria-label="Start year"
            >
              {yearOptions.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="w-1/2">
            <select
              id="startMonth"
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={sMonth}
              onChange={(e) => setSMonth(parseInt(e.target.value))}
              aria-label="Start month"
            >
              {monthOptions.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* End Date Selection */}
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">{t.endDate}</label>
        <div className="flex gap-2">
          <div className="w-1/2">
             <select
              id="endYear"
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={eYear}
              onChange={(e) => setEYear(parseInt(e.target.value))}
              aria-label="End year"
            >
              {yearOptions.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
           <div className="w-1/2">
            <select
              id="endMonth"
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={eMonth}
              onChange={(e) => setEMonth(parseInt(e.target.value))}
              aria-label="End month"
            >
              {monthOptions.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">{t.section}</label>
        <div className="flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            onClick={() => setSection('top')}
            className={`
              flex-1 px-4 py-2 text-sm font-medium border rounded-l-lg focus:z-10 focus:ring-2 focus:ring-blue-500
              ${section === 'top' 
                ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            {topSectionLabel || 'Work'}
          </button>
          <button
            type="button"
            onClick={() => setSection('bottom')}
            className={`
              flex-1 px-4 py-2 text-sm font-medium border rounded-r-lg focus:z-10 focus:ring-2 focus:ring-blue-500
              ${section === 'bottom' 
                ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            {bottomSectionLabel || 'Personal'}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onClose}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          aria-label="Cancel"
        >
          {t.cancel}
        </button>
        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          aria-label="Confirm update"
        >
          {initialBlock ? t.update : t.add}
        </button>
      </div>
    </div>
  );
};

interface ConfirmClearModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  mode: 'all' | 'selected';
  t: any;
}

const ConfirmClearModal: React.FC<ConfirmClearModalProps> = ({ onConfirm, onCancel, mode, t }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-xl w-80 md:w-96">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{t.appTitle}</h3>
      <p className="text-gray-700 mb-6">
        {mode === 'selected' ? t.confirmDeleteSelected : t.confirmClear}
      </p>
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={onCancel}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none"
        >
          {t.cancel}
        </button>
        <button
          onClick={onConfirm}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none"
        >
          {t.confirm}
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  // Load initial state from localStorage if available
  const [language, setLanguage] = useState<'zh' | 'en'>(() => {
    return (localStorage.getItem('timeline_language') as 'zh' | 'en') || 'zh';
  });
  const t = TRANSLATIONS[language];

  // Set default years dynamically based on current date, or load from storage
  const [startYear, setStartYear] = useState<number>(() => {
    const saved = localStorage.getItem('timeline_startYear');
    return saved ? parseInt(saved, 10) : new Date().getFullYear() - 10;
  });
  const [endYear, setEndYear] = useState<number>(() => {
    const saved = localStorage.getItem('timeline_endYear');
    return saved ? parseInt(saved, 10) : new Date().getFullYear();
  });
  
  const [topSectionLabel, setTopSectionLabel] = useState<string>(() => {
    return localStorage.getItem('timeline_topSectionLabel') || 'Work';
  });
  const [bottomSectionLabel, setBottomSectionLabel] = useState<string>(() => {
    return localStorage.getItem('timeline_bottomSectionLabel') || 'Personal';
  });
  
  const [progressBlocks, setProgressBlocks] = useState<ProgressBlockData[]>(() => {
    const saved = localStorage.getItem('timeline_progressBlocks');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse saved blocks', e);
      return [];
    }
  });

  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
  const [isAddingBlock, setIsAddingBlock] = useState<boolean>(false);
  const [editingBlock, setEditingBlock] = useState<ProgressBlockData | null>(null);
  
  // Show year edit modal on first load if no years were previously saved
  const [isEditingYears, setIsEditingYears] = useState<boolean>(() => {
    const savedStart = localStorage.getItem('timeline_startYear');
    return !savedStart;
  });

  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState<boolean>(false);
  const [clearMode, setClearMode] = useState<'all' | 'selected'>('all');

  const [isDraggingAnyBlock, setIsDraggingAnyBlock] = useState<boolean>(false);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState<boolean>(false);
  
  const timelineRef = useRef<HTMLDivElement>(null);
  const blocksSnapshotRef = useRef<ProgressBlockData[]>([]); // Snapshot for batch drag
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  const [timelineDimensions, setTimelineDimensions] = useState<TimelineDimensions>({
    totalMonths: 0,
    monthWidth: 0,
    timelineWidth: 0,
    startMonthAbsIndex: 0,
  });

  // --- PERSISTENCE EFFECTS ---
  useEffect(() => {
    localStorage.setItem('timeline_language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('timeline_startYear', startYear.toString());
  }, [startYear]);

  useEffect(() => {
    localStorage.setItem('timeline_endYear', endYear.toString());
  }, [endYear]);

  useEffect(() => {
    localStorage.setItem('timeline_topSectionLabel', topSectionLabel);
  }, [topSectionLabel]);

  useEffect(() => {
    localStorage.setItem('timeline_bottomSectionLabel', bottomSectionLabel);
  }, [bottomSectionLabel]);

  useEffect(() => {
    localStorage.setItem('timeline_progressBlocks', JSON.stringify(progressBlocks));
  }, [progressBlocks]);
  // ---------------------------

  useEffect(() => {
    // Use ResizeObserver to reliably get content dimensions regardless of scrollbar or padding
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === timelineRef.current) {
          const containerWidth = entry.contentRect.width;
          const totalMonths = (endYear - startYear + 1) * 12;
          // Calculate width to fit container exactly (no scrolling)
          const monthWidth = containerWidth / totalMonths;

          setTimelineDimensions({
            totalMonths,
            monthWidth,
            timelineWidth: containerWidth,
            startMonthAbsIndex: startYear * 12,
          });
        }
      }
    });

    if (timelineRef.current) {
      resizeObserver.observe(timelineRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [startYear, endYear]);

  // Click outside handler for download menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isDownloadMenuOpen &&
        downloadMenuRef.current &&
        !downloadMenuRef.current.contains(event.target as Node)
      ) {
        setIsDownloadMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDownloadMenuOpen]);

  const handleYearInputConfirm = (start: number, end: number) => {
    setStartYear(start);
    setEndYear(end);
    setIsEditingYears(false);
  };

  const handleAddBlock = useCallback(() => {
    setEditingBlock(null);
    setIsAddingBlock(true);
  }, []);

  const handleEditBlock = useCallback((block: ProgressBlockData) => {
    setEditingBlock(block);
    setIsAddingBlock(true);
  }, []);

  const handleSaveBlock = (block: ProgressBlockData) => {
    if (editingBlock) {
      setProgressBlocks((prev) => prev.map((b) => (b.id === block.id ? block : b)));
    } else {
      setProgressBlocks((prev) => [...prev, block]);
    }
    setIsAddingBlock(false);
    setEditingBlock(null);
  };

  const handleDeleteBlock = useCallback((blockId: string) => {
    if (selectedBlockIds.includes(blockId)) {
      // If dragging a selected block to trash, delete all selected
      setProgressBlocks(prev => prev.filter(block => !selectedBlockIds.includes(block.id)));
      setSelectedBlockIds([]);
    } else {
      // Single delete
      setProgressBlocks(prevBlocks => prevBlocks.filter(block => block.id !== blockId));
      setSelectedBlockIds(prev => prev.filter(id => id !== blockId));
    }
  }, [selectedBlockIds]);

  const handleClearAllBlocks = useCallback(() => {
    if (selectedBlockIds.length > 0) {
      setClearMode('selected');
    } else {
      setClearMode('all');
    }
    setIsClearConfirmOpen(true);
  }, [selectedBlockIds]);

  const confirmClearAll = useCallback(() => {
    if (clearMode === 'selected') {
      setProgressBlocks(prev => prev.filter(b => !selectedBlockIds.includes(b.id)));
      setSelectedBlockIds([]);
    } else {
      setProgressBlocks([]);
      setSelectedBlockIds([]);
    }
    setIsClearConfirmOpen(false);
  }, [clearMode, selectedBlockIds]);

  const handleSelectBlock = useCallback((blockId: string, isMultiSelect: boolean) => {
    setSelectedBlockIds(prev => {
      if (isMultiSelect) {
        return prev.includes(blockId) 
          ? prev.filter(id => id !== blockId) 
          : [...prev, blockId];
      } else {
        return [blockId];
      }
    });
  }, []);

  const handleMultiSelectBlocks = useCallback((blockIds: string[]) => {
    setSelectedBlockIds(blockIds);
  }, []);

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.startYear && json.endYear && Array.isArray(json.progressBlocks)) {
          setStartYear(json.startYear);
          setEndYear(json.endYear);
          if (json.topSectionLabel) setTopSectionLabel(json.topSectionLabel);
          if (json.bottomSectionLabel) setBottomSectionLabel(json.bottomSectionLabel);
          setProgressBlocks(json.progressBlocks);
          alert(t.importSuccess);
        } else {
          alert(t.invalidJson);
        }
      } catch (error) {
        console.error("Import error:", error);
        alert(`${t.importError} ${(error as Error).message}`);
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  const handleDownload = async (format: 'pdf' | 'jpg' | 'png' | 'json') => {
    setIsDownloadMenuOpen(false);
    
    if (format === 'json') {
      exportTimelineAsJson({
        startYear,
        endYear,
        topSectionLabel,
        bottomSectionLabel,
        progressBlocks
      }, 'timeline_data.json');
      return;
    }

    if (timelineRef.current) {
      try {
        const element = timelineRef.current;
        const scrollWidth = element.scrollWidth;
        const scrollHeight = element.scrollHeight;

        const canvas = await html2canvas(element, {
           scale: 2, // Higher quality
           useCORS: true,
           backgroundColor: '#ffffff',
           width: scrollWidth,
           height: scrollHeight,
           windowWidth: scrollWidth, // Important to capture full scroll width
           windowHeight: scrollHeight,
           scrollX: 0,
           scrollY: 0,
           onclone: (clonedDoc) => {
             // 1. Fix truncated text in blocks
             const truncatedElements = clonedDoc.querySelectorAll('.truncate');
             truncatedElements.forEach((el) => {
               (el as HTMLElement).style.overflow = 'visible';
               (el as HTMLElement).style.textOverflow = 'clip';
               (el as HTMLElement).style.whiteSpace = 'normal'; // Wrap text if needed, or 'nowrap' to bleed
               el.classList.remove('truncate');
             });

             // 2. Ensure section labels are visible (if clipping issues occur)
             // The labels are absolute positioned, capturing full width should handle them.
             // We can enforce z-index just in case.
             const labels = clonedDoc.querySelectorAll('.timeline-section-container > div:first-child');
             labels.forEach((el) => {
                (el as HTMLElement).style.zIndex = '1000';
             });
           }
        });

        if (format === 'pdf') {
          exportTimelineAsPdf(canvas, 'timeline.pdf');
        } else {
          exportTimelineAsImage(canvas, format, `timeline.${format}`);
        }
      } catch (error) {
        console.error("Download error:", error);
        alert(t.downloadError);
      }
    }
  };

  const handleUpdateBlockPositionOrSize = useCallback((updatedBlock: ProgressBlockData) => {
    setProgressBlocks((prevBlocks) =>
      prevBlocks.map((b) => (b.id === updatedBlock.id ? updatedBlock : b))
    );
  }, []);

  const handleBatchUpdate = useCallback((deltaMonths: number, deltaRows: number) => {
    // Apply deltas to all selected blocks based on the snapshot
    const snapshot = blocksSnapshotRef.current;
    if (snapshot.length === 0) return;

    setProgressBlocks(prevBlocks => {
      // Create a map of updated blocks for O(1) lookup
      const updatedMap = new Map();
      
      snapshot.forEach(originalBlock => {
        if (selectedBlockIds.includes(originalBlock.id)) {
           // Calculate new position
           const currentBlockStartAbsMonth = originalBlock.startYear * 12 + (originalBlock.startMonth - 1);
           const currentBlockEndAbsMonth = originalBlock.endYear * 12 + (originalBlock.endMonth - 1);
           const blockDuration = currentBlockEndAbsMonth - currentBlockStartAbsMonth + 1;
           const timelineStartAbsMonth = startYear * 12;
           const timelineEndAbsMonth = (endYear + 1) * 12 - 1;

           let newStartAbsMonth = currentBlockStartAbsMonth + deltaMonths;
           // Bound checking
           newStartAbsMonth = Math.max(timelineStartAbsMonth, newStartAbsMonth);
           let newEndAbsMonth = newStartAbsMonth + blockDuration - 1;
           
           if (newEndAbsMonth > timelineEndAbsMonth) {
             newEndAbsMonth = timelineEndAbsMonth;
             newStartAbsMonth = newEndAbsMonth - blockDuration + 1;
           }

           const newStartYear = Math.floor(newStartAbsMonth / 12);
           const newStartMonth = (newStartAbsMonth % 12) + 1;
           const newEndYear = Math.floor(newEndAbsMonth / 12);
           const newEndMonth = (newEndAbsMonth % 12) + 1;
           
           const newRow = Math.max(0, (originalBlock.row || 0) + deltaRows);

           updatedMap.set(originalBlock.id, {
             ...originalBlock,
             startYear: newStartYear,
             startMonth: newStartMonth,
             endYear: newEndYear,
             endMonth: newEndMonth,
             row: newRow
           });
        }
      });

      return prevBlocks.map(b => updatedMap.get(b.id) || b);
    });
  }, [selectedBlockIds, startYear, endYear]);

  const handleDragStart = useCallback(() => {
    setIsDraggingAnyBlock(true);
    // Capture snapshot of all blocks
    blocksSnapshotRef.current = progressBlocks;
  }, [progressBlocks]);

  const handleDragEnd = useCallback(() => {
    setIsDraggingAnyBlock(false);
    blocksSnapshotRef.current = [];
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center z-50 relative">
        <h1 className="text-2xl font-bold">{t.appTitle}</h1>
        <div className="flex items-center">
          {/* Language Switcher */}
          <button
             onClick={() => setLanguage(prev => prev === 'zh' ? 'en' : 'zh')}
             className="mr-2 px-3 py-1 bg-blue-500 hover:bg-blue-700 rounded text-sm font-semibold transition duration-200"
             title={t.switchLanguageTooltip}
          >
            {t.langButtonText}
          </button>

          {/* Add Block Button */}
          <button
            onClick={handleAddBlock}
            className="mr-2 p-2 bg-green-500 hover:bg-green-600 rounded-full shadow-md transition duration-200"
            title={t.addBlockTooltip}
            aria-label="Add new progress block"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* Clear All Blocks Button */}
          <button
            onClick={handleClearAllBlocks}
            className="mr-2 p-2 bg-red-500 hover:bg-red-600 rounded-full shadow-md transition duration-200"
            title={t.clearAllTooltip}
            aria-label={t.clearAllTooltip}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>

          {/* Import Button */}
          <div className="relative mr-2">
            <input
              type="file"
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
              id="import-json-input"
            />
            <label
              htmlFor="import-json-input"
              className="p-2 bg-yellow-500 hover:bg-yellow-600 rounded-full shadow-md transition duration-200 cursor-pointer flex items-center justify-center text-white"
              title={t.importTooltip}
              aria-label="Import JSON"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </label>
          </div>

          {/* Download Button */}
          <div className="relative" ref={downloadMenuRef}>
            <button
              onClick={() => setIsDownloadMenuOpen(!isDownloadMenuOpen)}
              className="p-2 bg-purple-500 hover:bg-purple-600 rounded-full shadow-md transition duration-200 text-white"
              title={t.downloadTooltip}
              aria-haspopup="true"
              aria-expanded={isDownloadMenuOpen}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            {isDownloadMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <button
                  onClick={() => handleDownload('pdf')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {t.downloadPdf}
                </button>
                <button
                  onClick={() => handleDownload('jpg')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {t.downloadJpg}
                </button>
                <button
                  onClick={() => handleDownload('png')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {t.downloadPng}
                </button>
                 <button
                  onClick={() => handleDownload('json')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {t.downloadJson}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content (Scrollable Timeline Area) */}
      <div 
        ref={timelineRef}
        className="flex-grow py-4 px-6 overflow-hidden relative" // Increased padding for year labels
      >
        <TimelineSection
          sectionType="top"
          label={topSectionLabel}
          onLabelChange={setTopSectionLabel}
          progressBlocks={progressBlocks}
          startYear={startYear}
          endYear={endYear}
          onAddBlock={handleAddBlock}
          onEditBlock={handleEditBlock}
          onUpdateBlockPositionOrSize={handleUpdateBlockPositionOrSize}
          onReorderBlocks={() => {}} // Deprecated by manual positioning
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          timelineDimensions={timelineDimensions}
          onDeleteBlock={handleDeleteBlock}
          selectedBlockIds={selectedBlockIds}
          onSelectBlocks={handleMultiSelectBlocks}
          onSelectBlock={handleSelectBlock}
          onBatchUpdate={handleBatchUpdate}
        />
        
        <Timeline 
          startYear={startYear} 
          endYear={endYear}
          onEditYears={() => setIsEditingYears(true)}
          timelineDimensions={timelineDimensions}
        />

        <TimelineSection
          sectionType="bottom"
          label={bottomSectionLabel}
          onLabelChange={setBottomSectionLabel}
          progressBlocks={progressBlocks}
          startYear={startYear}
          endYear={endYear}
          onAddBlock={handleAddBlock}
          onEditBlock={handleEditBlock}
          onUpdateBlockPositionOrSize={handleUpdateBlockPositionOrSize}
          onReorderBlocks={() => {}} // Deprecated
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          timelineDimensions={timelineDimensions}
          onDeleteBlock={handleDeleteBlock}
          selectedBlockIds={selectedBlockIds}
          onSelectBlocks={handleMultiSelectBlocks}
          onSelectBlock={handleSelectBlock}
          onBatchUpdate={handleBatchUpdate}
        />
      </div>

      {/* Trash Can (Fixed) */}
      {isDraggingAnyBlock && (
        <TrashCan 
          onDeleteBlock={handleDeleteBlock} 
          label={t.delete}
        />
      )}

      {/* Modals */}
      {isEditingYears && (
        <Modal onClose={() => { /* Cannot close without confirming initially? Optional logic */ }}>
          <InitialYearInputModal
            onConfirm={handleYearInputConfirm}
            initialStartYear={startYear}
            initialEndYear={endYear}
            t={t}
          />
        </Modal>
      )}

      {isAddingBlock && (
        <Modal onClose={() => { setIsAddingBlock(false); setEditingBlock(null); }}>
          <AddEditBlockModal
            onConfirm={handleSaveBlock}
            onClose={() => { setIsAddingBlock(false); setEditingBlock(null); }}
            initialBlock={editingBlock || undefined}
            startYear={startYear}
            endYear={endYear}
            topSectionLabel={topSectionLabel}
            bottomSectionLabel={bottomSectionLabel}
            t={t}
          />
        </Modal>
      )}

      {isClearConfirmOpen && (
        <Modal onClose={() => setIsClearConfirmOpen(false)}>
          <ConfirmClearModal
            onConfirm={confirmClearAll}
            onCancel={() => setIsClearConfirmOpen(false)}
            mode={clearMode}
            t={t}
          />
        </Modal>
      )}
    </div>
  );
};

export default App;