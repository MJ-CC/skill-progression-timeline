import React from 'react';

interface TrashCanProps {
  onDeleteBlock: (blockId: string) => void;
  label: string;
}

const TrashCan: React.FC<TrashCanProps> = ({ label }) => {
  // Note: We removed the props usage here because the deletion trigger 
  // is now handled inside ProgressBlock's handleMouseUp via coordinate checking.
  // The component serves as a visual target.

  return (
    <div
      id="app-trash-can"
      className={`fixed bottom-4 right-4 p-6 rounded-full shadow-lg transition-all duration-200 ease-in-out z-50
                  bg-red-400 hover:bg-red-600 hover:scale-110
                  flex items-center justify-center text-white cursor-pointer`}
      aria-label="Drag blocks here to delete"
      role="button"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      <span className="ml-2 text-lg font-semibold hidden md:inline">{label}</span>
    </div>
  );
};

export default TrashCan;