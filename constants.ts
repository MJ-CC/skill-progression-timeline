
export const DEFAULT_BLOCK_COLORS = [
  'blue',
  'green',
  'purple',
  'red',
  'yellow',
  'teal',
  'indigo',
];

export const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const BLOCK_HEIGHT = 34; // Height of the colored bar
export const ROW_GAP = 12; // Vertical space between rows
export const ROW_HEIGHT = BLOCK_HEIGHT + ROW_GAP; // Total height per row

export const TRANSLATIONS = {
  en: {
    appTitle: "Skill Progression Timeline",
    addBlockTooltip: "Add Progress Block",
    clearAllTooltip: "Clear All Blocks",
    importTooltip: "Import Timeline Data (JSON)",
    downloadTooltip: "Download Timeline",
    downloadPdf: "Download PDF",
    downloadJpg: "Download JPG",
    downloadPng: "Download PNG",
    downloadJson: "Download JSON",
    confirmClear: "Are you sure you want to delete all progress blocks? This action cannot be undone.",
    setTimelineYears: "Set Timeline Years",
    startYear: "Start Year:",
    endYear: "End Year:",
    confirm: "Confirm",
    startYearError: "Start year must be less than end year.",
    addSkill: "Add Skill Progress",
    editSkill: "Edit Skill Progress",
    name: "Name:",
    color: "Color:",
    startDate: "Start Date:",
    endDate: "End Date:",
    section: "Section:",
    cancel: "Cancel",
    add: "Add",
    update: "Update",
    dateError: "Start date cannot be after end date.",
    importSuccess: "Timeline data imported successfully!",
    selectJson: "Please select a JSON file.",
    invalidJson: "Invalid JSON file format. Missing required fields.",
    invalidBlockData: "Invalid block data found in JSON.",
    importError: "Error importing file:",
    downloadError: "Failed to download timeline. Please try again.",
    delete: "Delete",
    switchLanguageTooltip: "Switch Language",
    langButtonText: "中文"
  },
  zh: {
    appTitle: "技能進程時間軸",
    addBlockTooltip: "新增進程區塊",
    clearAllTooltip: "清除網頁中所有的區塊",
    importTooltip: "匯入時間軸資料 (JSON)",
    downloadTooltip: "下載時間軸",
    downloadPdf: "下載 PDF",
    downloadJpg: "下載 JPG",
    downloadPng: "下載 PNG",
    downloadJson: "下載 JSON",
    confirmClear: "確定要清除網頁中所有的區塊嗎？此操作無法復原。",
    setTimelineYears: "設定時間軸年份",
    startYear: "起始年份:",
    endYear: "結束年份:",
    confirm: "確認",
    startYearError: "起始年份必須小於結束年份。",
    addSkill: "新增技能進程",
    editSkill: "編輯技能進程",
    name: "名稱:",
    color: "顏色:",
    startDate: "開始日期:",
    endDate: "結束日期:",
    section: "區塊:",
    cancel: "取消",
    add: "新增",
    update: "更新",
    dateError: "開始日期不能在結束日期之後。",
    importSuccess: "時間軸資料匯入成功！",
    selectJson: "請選擇 JSON 檔案。",
    invalidJson: "無效的 JSON 檔案格式。缺少必要欄位。",
    invalidBlockData: "JSON 中發現無效的區塊資料。",
    importError: "匯入檔案時發生錯誤：",
    downloadError: "下載時間軸失敗，請重試。",
    delete: "刪除",
    switchLanguageTooltip: "切換語言",
    langButtonText: "English"
  }
};
