import { useState, useEffect } from 'react';

export function useGeminiStats(user: any) {
  const [geminiScanCount, setGeminiScanCount] = useState(0);
  const [totalInputTokens, setTotalInputTokens] = useState(0);
  const [totalOutputTokens, setTotalOutputTokens] = useState(0);

  useEffect(() => {
    if (!user) return;

    const savedStats = localStorage.getItem(`gemini_stats_${user.id}`);
    if (savedStats) {
      const data = JSON.parse(savedStats);
      setGeminiScanCount(data.geminiScanCount || 0);
      setTotalInputTokens(data.totalInputTokens || 0);
      setTotalOutputTokens(data.totalOutputTokens || 0);
    }
  }, [user]);

  const incrementGeminiScanCount = async (inputTokens = 0, outputTokens = 0) => {
    if (!user) return;
    try {
      const newCount = geminiScanCount + 1;
      const newInputTokens = totalInputTokens + inputTokens;
      const newOutputTokens = totalOutputTokens + outputTokens;
      
      setGeminiScanCount(newCount);
      setTotalInputTokens(newInputTokens);
      setTotalOutputTokens(newOutputTokens);
      
      localStorage.setItem(`gemini_stats_${user.id}`, JSON.stringify({
        geminiScanCount: newCount,
        totalInputTokens: newInputTokens,
        totalOutputTokens: newOutputTokens,
        updatedAt: Date.now()
      }));
    } catch (error) {
      console.error("Failed to update Gemini stats locally:", error);
    }
  };

  return {
    geminiScanCount,
    totalInputTokens,
    totalOutputTokens,
    incrementGeminiScanCount
  };
}
