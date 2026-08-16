"use client";

export default function RunButton({ isRunning, handleSubmit }) {
  return (
    <div className="w-fit"> 
      <button
        onClick={handleSubmit}
        disabled={isRunning}
        className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 text-white font-medium text-sm rounded-lg transition-all duration-200 
          ${isRunning 
            ? "bg-emerald-700 opacity-75 cursor-not-allowed" 
            : "bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 shadow-sm hover:shadow hover:-translate-y-0.5"
          }`}
      >
        {isRunning ? (
          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        )}
        <span>{isRunning ? "Running..." : "Run Code"}</span>
      </button>
    </div>
  );
}
