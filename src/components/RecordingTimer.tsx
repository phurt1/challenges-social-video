import React from 'react';

interface RecordingTimerProps {
  isRecording: boolean;
  timeElapsed: number;
  timeLimit: number;
}

const RecordingTimer: React.FC<RecordingTimerProps> = ({
  isRecording,
  timeElapsed,
  timeLimit
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const timeRemaining = timeLimit - timeElapsed;

  return (
    <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
      {isRecording && (
        <div className="flex items-center space-x-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          <span>REC</span>
        </div>
      )}
      
      <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm font-mono ml-auto">
        {formatTime(timeElapsed)} / {formatTime(timeLimit)}
      </div>
    </div>
  );
};

export default RecordingTimer;