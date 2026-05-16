import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useState } from "react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function MonthYearPicker({ month, year, onMonthChange, onYearChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  // Allow picking 5 years in the past and 2 years in the future
  const years = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i);

  const handlePrevMonth = () => {
    if (month === 1) {
      onMonthChange(12);
      onYearChange(year - 1);
    } else {
      onMonthChange(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      onMonthChange(1);
      onYearChange(year + 1);
    } else {
      onMonthChange(month + 1);
    }
  };

  return (
    <div className="relative inline-block z-30">
      <div className="flex items-center bg-card/50 border border-border/50 rounded-md p-1 shadow-sm">
        <button
          onClick={handlePrevMonth}
          className="p-1.5 hover:bg-secondary rounded-md transition-colors text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 hover:bg-secondary rounded-md transition-colors font-medium text-sm min-w-[140px] justify-center"
        >
          <Calendar className="w-4 h-4 text-primary" />
          <span>{MONTHS[month - 1]} {year}</span>
        </button>

        <button
          onClick={handleNextMonth}
          className="p-1.5 hover:bg-secondary rounded-md transition-colors text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-64 bg-card border border-border/50 rounded-lg shadow-xl overflow-hidden p-3">
          {/* Overlay to close when clicking outside */}
          <div 
            className="fixed inset-0 z-[-1]" 
            onClick={() => setIsOpen(false)}
          />
          
          <div className="flex justify-between items-center mb-3">
            <button 
              onClick={() => onYearChange(year - 1)}
              className="p-1 hover:bg-secondary rounded text-muted-foreground"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-sm">{year}</span>
            <button 
              onClick={() => onYearChange(year + 1)}
              className="p-1 hover:bg-secondary rounded text-muted-foreground"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1">
            {MONTHS.map((m, idx) => (
              <button
                key={m}
                onClick={() => {
                  onMonthChange(idx + 1);
                  setIsOpen(false);
                }}
                className={`text-xs py-2 rounded-md transition-colors ${
                  month === idx + 1 
                    ? "bg-primary text-primary-foreground font-medium shadow-sm" 
                    : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {m.substring(0, 3)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
