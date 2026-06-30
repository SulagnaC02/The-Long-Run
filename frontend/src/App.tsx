import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Zap, 
  Battery, 
  Clock, 
  Brain, 
  Compass, 
  TrendingUp, 
  FileText, 
  Heart,
  ChevronRight,
  AlertCircle,
  Check,
  Download
} from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function App() {
  // Input states
  const [goal, setGoal] = useState('');
  const [energy, setEnergy] = useState('Medium');
  const [hours, setHours] = useState(4);
  const [deadline, setDeadline] = useState('');
  
  // Real backend loading & response states (Connecting directly to http://127.0.0.1:8000/generate-plan)
  const [plan, setPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reflection states (Managed entirely in local state, no API required)
  const [reflectionRealistic, setReflectionRealistic] = useState<'yes' | 'somewhat' | 'no' | null>(null);
  const [reflectionSatisfaction, setReflectionSatisfaction] = useState<number>(7);
  const [reflectionChange, setReflectionChange] = useState<string>('');
  const [reflectionSaved, setReflectionSaved] = useState<boolean>(false);

  // New API-based Daily Reflection states
  const [realistic, setRealistic] = useState('Yes');
  const [satisfaction, setSatisfaction] = useState(5);
  const [reflection, setReflection] = useState('');
  const [reflectionAnalysis, setReflectionAnalysis] = useState<any>(null);
  const [isAnalyzingReflection, setIsAnalyzingReflection] = useState(false);
  const [reflectionAnalysisError, setReflectionAnalysisError] = useState<string | null>(null);

  // Bottom API reflection states
  const [isSavingReflection, setIsSavingReflection] = useState(false);
  const [reflectionSaveError, setReflectionSaveError] = useState<string | null>(null);
  const [bottomReflectionAnalysis, setBottomReflectionAnalysis] = useState<any>(null);

  // Plan History states (localStorage persistence)
  const [history, setHistory] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('the_long_run_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string | null>(null);

  // UTC Clock state
  const [timeString, setTimeString] = useState('');

  // Responsiveness state
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update dynamic clock in header
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Real backend integration to request plan (FastAPI API Client on http://127.0.0.1:8000/generate-plan)
  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          goal: goal,
          energy: energy,
          hours: hours,
          deadline: deadline
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned error status: ${response.status}`);
      }

      const responseData = await response.json();
      setPlan(responseData);

      const newPlanItem = {
        date: new Date().toISOString(),
        goal: goal,
        energy: energy,
        hours: hours,
        deadline: deadline,
        today_summary: responseData.today_summary,
        today_plan: responseData.today_plan,
        future_relief: responseData.future_relief,
        reasoning: responseData.reasoning
      };

      setHistory(prevHistory => {
        const updated = [newPlanItem, ...prevHistory].slice(0, 10);
        try {
          localStorage.setItem('the_long_run_history', JSON.stringify(updated));
        } catch (e) {
          console.error("Failed to write to localStorage:", e);
        }
        return updated;
      });
      setSelectedHistoryDate(newPlanItem.date);

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } catch (err: any) {
      console.error("Error communicating with FastAPI backend:", err);
      setError(err.message || "Failed to communicate with the FastAPI server. Please check your backend connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // Real backend integration to analyze reflection
  const handleAnalyzeReflection = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzingReflection(true);
    setReflectionAnalysisError(null);
    setReflectionAnalysis(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/analyze-reflection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          realistic,
          satisfaction,
          reflection
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned error status: ${response.status}`);
      }

      const responseData = await response.json();
      setReflectionAnalysis(responseData);

      // Save satisfaction to the active plan in history
      setHistory(prevHistory => {
        const updated = prevHistory.map(item => {
          if (item.date === selectedHistoryDate) {
            return {
              ...item,
              satisfaction: satisfaction * 2 // Normalize 1-5 to 1-10 scale
            };
          }
          return item;
        });
        try {
          localStorage.setItem('the_long_run_history', JSON.stringify(updated));
        } catch (e) {
          console.error("Failed to write to localStorage:", e);
        }
        return updated;
      });
    } catch (err: any) {
      console.error("Error analyzing reflection:", err);
      setReflectionAnalysisError("Unable to analyze reflection. Please try again.");
    } finally {
      setIsAnalyzingReflection(false);
    }
  };

  // Real backend integration to save/analyze bottom reflection
  const handleSaveReflection = async () => {
    setIsSavingReflection(true);
    setReflectionSaveError(null);
    setBottomReflectionAnalysis(null);

    // Map reflectionRealistic: 'yes' | 'somewhat' | 'no' | null
    let mappedRealistic = 'Yes';
    if (reflectionRealistic === 'yes') {
      mappedRealistic = 'Yes';
    } else if (reflectionRealistic === 'somewhat') {
      mappedRealistic = 'Mostly';
    } else if (reflectionRealistic === 'no') {
      mappedRealistic = 'No';
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/analyze-reflection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          realistic: mappedRealistic,
          satisfaction: reflectionSatisfaction,
          reflection: reflectionChange
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned error status: ${response.status}`);
      }

      const responseData = await response.json();
      setBottomReflectionAnalysis(responseData);
      setReflectionSaved(true);

      // Save satisfaction to the active plan in history
      setHistory(prevHistory => {
        const updated = prevHistory.map(item => {
          if (item.date === selectedHistoryDate) {
            return {
              ...item,
              satisfaction: reflectionSatisfaction // Already 1-10 scale
            };
          }
          return item;
        });
        try {
          localStorage.setItem('the_long_run_history', JSON.stringify(updated));
        } catch (e) {
          console.error("Failed to write to localStorage:", e);
        }
        return updated;
      });
    } catch (err: any) {
      console.error("Error analyzing bottom reflection:", err);
      setReflectionSaveError("Unable to generate plan. Please try again.");
    } finally {
      setIsSavingReflection(false);
    }
  };

  // Generate and export PDF containing plan details
  const handleExportPDF = () => {
    if (!plan) return;

    const doc = new jsPDF();
    const primaryColor = [124, 58, 237]; // Purple
    const secondaryColor = [30, 27, 75]; // Dark indigo
    const textColor = [51, 65, 85]; // Slate
    const lightBg = [248, 250, 252]; // Soft grey

    // 1. Title Header Block
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('THE LONG RUN', 15, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('AI-Generated Daily Performance Schedule', 15, 28);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} (UTC)`, 150, 20);

    let y = 50;

    // Helper: Draw Section Title
    const drawSectionHeader = (title: string) => {
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(15, y, 180, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(title, 20, y + 5.5);
      y += 14;
    };

    // Helper: Print wrapped text and update y position
    const printWrappedText = (text: string, x: number, fontSize: number, style: 'normal' | 'bold' = 'normal', color = textColor, indent = 0) => {
      doc.setFont('helvetica', style);
      doc.setFontSize(fontSize);
      doc.setTextColor(color[0], color[1], color[2]);
      
      const maxWidth = 180 - indent;
      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach((line: string) => {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, x + indent, y);
        y += (fontSize * 0.4) + 2.5;
      });
    };

    // 2. Metadata Section (Goal, Energy, Hours, Deadline)
    drawSectionHeader('PLAN OVERVIEW & METADATA');
    
    // Quick grid background
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.rect(15, y, 180, 28, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(15, y, 180, 28);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    
    doc.text('Daily Goal:', 20, y + 8);
    doc.text('Energy Level:', 20, y + 15);
    doc.text('Available Hours Today:', 110, y + 8);
    doc.text('Target Deadline:', 110, y + 15);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(goal || 'Not specified', 45, y + 8);
    doc.text(energy || 'Medium', 48, y + 15);
    doc.text(`${hours} hours`, 152, y + 8);
    doc.text(deadline || 'Not specified', 142, y + 15);
    
    y += 34;

    // 3. Today's Summary
    drawSectionHeader("TODAY'S SUMMARY");
    const summaryTextVal = plan?.today_summary || '';
    printWrappedText(summaryTextVal, 15, 10, 'normal', textColor);
    y += 4;

    // 4. Today's Schedule
    drawSectionHeader("YOUR SCHEDULE TIMELINE");
    const scheduleItems = plan?.today_plan || [];
    if (scheduleItems.length > 0) {
      scheduleItems.forEach((item: any, idx: number) => {
        const isString = typeof item === 'string';
        const taskTitle = isString ? item : (item.task || 'Focus Block');
        const taskTime = isString ? '' : (item.time || item.duration || '');

        if (y > 270) {
          doc.addPage();
          y = 20;
        }

        // Timeline marker
        doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setLineWidth(0.5);
        doc.line(20, y - 5, 20, y + 5);
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.circle(20, y, 2.5, 'FD');

        // Text details
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        if (taskTime) {
          doc.text(taskTime, 28, y + 1);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(textColor[0], textColor[1], textColor[2]);
          const wrappedTask = doc.splitTextToSize(taskTitle, 130);
          doc.text(wrappedTask, 60, y + 1);
          y += (wrappedTask.length * 5) + 3;
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(textColor[0], textColor[1], textColor[2]);
          const wrappedTask = doc.splitTextToSize(taskTitle, 155);
          doc.text(wrappedTask, 28, y + 1);
          y += (wrappedTask.length * 5) + 3;
        }
      });
    } else {
      printWrappedText('No tasks scheduled.', 15, 10, 'normal', textColor);
    }
    y += 6;

    // 5. Why AI Suggested This (Reasoning)
    drawSectionHeader("WHY AI SUGGESTED THIS");
    const reasons = whySuggestedList || [];
    if (reasons.length > 0) {
      reasons.forEach((reason: string) => {
        printWrappedText(`✦  ${reason}`, 15, 9.5, 'normal', textColor, 4);
      });
    } else {
      printWrappedText('No reasoning notes provided by the model.', 15, 10, 'normal', textColor);
    }
    y += 6;

    // 6. Future Relief
    drawSectionHeader("FUTURE RELIEF");
    const relief = plan?.future_relief || '';
    printWrappedText(relief, 15, 10, 'normal', textColor);

    // Save File
    const sanitizedGoal = (goal || 'Plan').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save(`the-long-run-plan_${sanitizedGoal}.pdf`);
  };

  // Safe mapping of dynamic properties coming from FastAPI backend
  const summaryText = isLoading
    ? "Building your personalized plan..."
    : (plan?.today_summary || "Submit your Daily Goal and Current Mental Stamina to fetch your customized agenda from the planner algorithm.");
  const tasksList = plan?.today_plan || [];
  const futureReliefText = plan?.future_relief || "Complete tasks today to earn cognitive freedom tomorrow.";
  
  const rawWhySuggested = plan?.reasoning || [];
  const whySuggestedList = Array.isArray(rawWhySuggested) 
    ? rawWhySuggested 
    : typeof rawWhySuggested === 'string' 
      ? [rawWhySuggested] 
      : [];

  // Relative category helper
  const getRelativeCategory = (dateString: string) => {
    try {
      const planDate = new Date(dateString);
      const now = new Date();
      
      const planMidnight = new Date(planDate.getFullYear(), planDate.getMonth(), planDate.getDate());
      const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      const diffMs = nowMidnight.getTime() - planMidnight.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 0) {
        return 'Today';
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else {
        return 'Older dates';
      }
    } catch (e) {
      return 'Older dates';
    }
  };

  const categoriesList = ['Today', 'Yesterday', 'Older dates'] as const;
  
  const groupedHistory = history.reduce((acc, item) => {
    const cat = getRelativeCategory(item.date);
    if (!acc[cat]) {
      acc[cat] = [];
    }
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, typeof history>);

  // Computations for Insights Card
  const totalPlans = history.length;
  
  const averageHours = totalPlans > 0 
    ? Number((history.reduce((sum, item) => sum + (Number(item.hours) || 0), 0) / totalPlans).toFixed(1))
    : 0;
  
  const energyCounts = history.reduce((acc, item) => {
    const e = item.energy || 'Medium';
    acc[e] = (acc[e] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  let mostCommonEnergy = 'N/A';
  let maxCount = 0;
  for (const energyLvl in energyCounts) {
    const count = energyCounts[energyLvl];
    if (count > maxCount) {
      maxCount = count;
      mostCommonEnergy = energyLvl;
    }
  }

  const averageTasks = totalPlans > 0
    ? Number((history.reduce((sum, item) => sum + (Array.isArray(item.today_plan) ? item.today_plan.length : 0), 0) / totalPlans).toFixed(1))
    : 0;

  const mostRecentGoal = history.length > 0 ? history[0].goal : 'None';

  const itemsWithSatisfaction = history.filter(item => typeof item.satisfaction === 'number');
  const averageSatisfaction = itemsWithSatisfaction.length > 0
    ? Number((itemsWithSatisfaction.reduce((sum, item) => sum + item.satisfaction, 0) / itemsWithSatisfaction.length).toFixed(1))
    : null;

  // Immersive UI Premium styling parameters
  const bodyStyle = {
    margin: 0,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    backgroundColor: '#030014',
    backgroundImage: 'radial-gradient(circle at 20% 20%, #1e1b4b 0%, transparent 40%), radial-gradient(circle at 80% 80%, #2e1065 0%, transparent 40%)',
    color: '#f8fafc',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Space Grotesk', 'Inter', sans-serif",
    boxSizing: 'border-box' as const,
  };

  const headerStyle = {
    padding: '1.25rem 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    background: 'rgba(3, 0, 20, 0.6)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 50,
  };

  const logoStyle = {
    fontSize: '1.4rem',
    fontWeight: 800,
    background: 'linear-gradient(to right, #a78bfa, #f472b6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.02em',
  };

  const containerStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '320px 1fr',
    gap: '1.5rem',
    padding: '1.5rem',
    flex: 1,
    boxSizing: 'border-box' as const,
  };

  const sidebarStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  };

  const mainContentStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  };

  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.04)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '1.5rem',
    padding: '1.5rem',
    boxSizing: 'border-box' as const,
  };

  const cardTitleStyle = {
    fontSize: '0.75rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    color: '#94a3b8',
    marginBottom: '0.75rem',
    fontWeight: 600,
  };

  const inputGroupStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    marginBottom: '1rem',
  };

  const labelStyle = {
    fontSize: '0.85rem',
    color: '#94a3b8',
  };

  const inputStyle = {
    background: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '0.75rem',
    padding: '0.75rem',
    color: 'white',
    outline: 'none',
    fontSize: '0.9rem',
    width: '100%',
    boxSizing: 'border-box' as const,
    transition: 'all 0.2s',
  };

  const btnPrimaryStyle = {
    background: '#7c3aed',
    border: 'none',
    padding: '1rem',
    borderRadius: '0.75rem',
    color: 'white',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  };

  const pillStyle = (active: boolean) => ({
    flex: 1,
    textAlign: 'center' as const,
    padding: '0.5rem',
    border: active ? '1px solid #7c3aed' : '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '0.5rem',
    fontSize: '0.8rem',
    cursor: 'pointer',
    background: active ? '#7c3aed' : 'transparent',
    color: active ? 'white' : '#94a3b8',
    transition: 'all 0.2s',
  });

  return (
    <div style={bodyStyle}>
      {/* Immersive Header */}
      <header style={headerStyle}>
        <div style={logoStyle}>The Long Run</div>
        <div style={{ color: '#94a3b8', fontSize: '0.9rem', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%', display: 'inline-block' }} />
          {timeString || 'LIVE CONNECTIONS'}
        </div>
      </header>

      {/* Main Layout Container */}
      <main style={containerStyle}>
        
        {/* Sidebar Planner Engine */}
        <aside style={sidebarStyle}>
          <section style={{ ...glassStyle, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={cardTitleStyle}>Daily Planner</div>
            
            <form onSubmit={handleGeneratePlan} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* 1. Goal Input */}
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Your Goal</label>
                <input 
                  type="text" 
                  placeholder="e.g. Placement Preparation" 
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              {/* 2. Energy Dropdown */}
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Energy Level</label>
                <select 
                  value={energy}
                  onChange={(e) => setEnergy(e.target.value)}
                  style={{
                    ...inputStyle,
                    cursor: 'pointer',
                  }}
                >
                  <option value="High" style={{ background: '#030014' }}>High Focus (80-100% Cap)</option>
                  <option value="Medium" style={{ background: '#030014' }}>Steady Focus (50-75% Cap)</option>
                  <option value="Low" style={{ background: '#030014' }}>Low Reserves (30-45% Cap)</option>
                </select>
              </div>

              {/* Available Hours */}
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Available Hours Today</label>
                <input
                  type="number"
                  min={1}
                  max={16}
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  style={inputStyle}
                  required
                />
              </div>

              {/* Deadline */}
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  style={{
                    ...inputStyle,
                    colorScheme: 'dark',
                  }}
                />
              </div>

              {/* 3. Generate Plan Button */}
              <button 
                type="submit"
                disabled={isLoading}
                style={{
                  ...btnPrimaryStyle,
                  opacity: isLoading ? 0.7 : 1,
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                {isLoading ? (
                  <>
                    <span style={{ width: '12px', height: '12px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span>Generate Today's Plan</span>
                  </>
                )}
              </button>
            </form>
          </section>

          {/* History Card */}
          <section style={glassStyle}>
            <div style={cardTitleStyle}>History</div>
            {history.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
                No previous plans.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
                {categoriesList.map(cat => {
                  const items = groupedHistory[cat] || [];
                  if (items.length === 0) return null;
                  return (
                    <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: 700, marginTop: '0.25rem', marginBottom: '0.25rem' }}>
                        {cat}
                      </div>
                      {items.map((item: any, idx: number) => {
                        const isSelected = selectedHistoryDate === item.date;
                        return (
                          <button
                            key={item.date || idx}
                            type="button"
                            onClick={() => {
                              setPlan({
                                today_summary: item.today_summary,
                                today_plan: item.today_plan,
                                future_relief: item.future_relief,
                                reasoning: item.reasoning
                              });
                              setGoal(item.goal);
                              setEnergy(item.energy);
                              setHours(item.hours);
                              setDeadline(item.deadline);
                              setSelectedHistoryDate(item.date);
                            }}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '0.6rem 0.8rem',
                              borderRadius: '0.75rem',
                              background: isSelected ? 'rgba(124, 58, 237, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                              border: isSelected ? '1px solid rgba(124, 58, 237, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                              color: isSelected ? '#a78bfa' : '#94a3b8',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              transition: 'all 0.2s',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.15rem',
                            }}
                          >
                            <div style={{ 
                              fontWeight: 600, 
                              color: isSelected ? '#f472b6' : '#e2e8f0', 
                              whiteSpace: 'nowrap', 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis',
                              maxWidth: '100%'
                            }}>
                              {item.goal}
                            </div>
                            <div style={{ fontSize: '0.7rem', display: 'flex', gap: '0.5rem', color: isSelected ? '#a78bfa' : '#64748b' }}>
                              <span>⚡ {item.energy}</span>
                              <span>⏰ {item.hours}h</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Insights Card */}
          <section style={glassStyle}>
            <div style={{ ...cardTitleStyle, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp className="w-4 h-4 text-[#a78bfa]" />
              <span>Insights</span>
            </div>
            
            {history.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
                No plans generated yet. Insights will appear once you create your first plan.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                
                {/* Total Plans Created */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '0.75rem',
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Total Plans
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f472b6' }}>
                    {totalPlans}
                  </div>
                </div>

                {/* Average Hours Planned */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '0.75rem',
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Avg. Hours
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#a78bfa', display: 'flex', alignItems: 'baseline', gap: '0.15rem' }}>
                    {averageHours}<span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b' }}>h</span>
                  </div>
                </div>

                {/* Most Common Energy Level */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '0.75rem',
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Energy Level
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    ⚡ {mostCommonEnergy}
                  </div>
                </div>

                {/* Average Tasks Per Day */}
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '0.75rem',
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Avg. Tasks
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981' }}>
                    {averageTasks}
                  </div>
                </div>

                {/* Most Recent Goal */}
                <div style={{
                  gridColumn: 'span 2',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '0.75rem',
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Most Recent Goal
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {mostRecentGoal}
                  </div>
                </div>

                {/* Average Satisfaction (if reflections exist) */}
                {averageSatisfaction !== null && (
                  <div style={{
                    gridColumn: 'span 2',
                    background: 'rgba(244, 114, 182, 0.03)',
                    border: '1px solid rgba(244, 114, 182, 0.15)',
                    borderRadius: '0.75rem',
                    padding: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                      <div style={{ fontSize: '0.65rem', color: '#f472b6', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Avg. Satisfaction
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b' }}>
                        From daily reflections
                      </div>
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f472b6', display: 'flex', alignItems: 'baseline', gap: '0.1rem' }}>
                      {averageSatisfaction}<span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b' }}>/10</span>
                    </div>
                  </div>
                )}

              </div>
            )}
          </section>

          {/* Connected Server Health indicator */}
          <section style={{ ...glassStyle, padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem' }}>
            <Brain style={{ width: '18px', height: '18px', color: '#a78bfa' }} />
            <div>
              <div style={{ fontWeight: 'bold', color: '#f8fafc' }}>Backend Status</div>
              <div style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 600 }}>● Connected</div>
            </div>
          </section>
        </aside>

        {/* Main interactive area */}
        <div style={mainContentStyle}>
          
          {/* Error notice if API call fails */}
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '1rem',
              padding: '1rem 1.25rem',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
              color: '#f87171',
              fontSize: '0.85rem',
            }}>
              <AlertCircle style={{ flexShrink: 0 }} className="w-5 h-5" />
              <div>
                <span style={{ fontWeight: 'bold' }}>Unable to generate plan.</span> Please try again.
              </div>
            </div>
          )}

          {/* Executive Summary & Why AI Suggested This row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '1.5rem',
          }}>
            {/* 4. Today's Summary */}
            <div style={glassStyle}>
              <div style={cardTitleStyle}>Today's Summary</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 300, lineHeight: '1.5', color: '#f8fafc' }}>
                {summaryText}
              </div>
            </div>

            {/* 7. Why AI Suggested This */}
            <div style={glassStyle}>
              <div style={cardTitleStyle}>Why AI Suggested This</div>
              {whySuggestedList.length > 0 ? (
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: '#94a3b8', padding: 0, margin: 0, listStyle: 'none' }}>
                  {whySuggestedList.map((reason: string, idx: number) => (
                    <li key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'start' }}>
                      <span style={{ color: '#7c3aed', fontWeight: 'bold' }}>✦</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                  Why suggestions (reasoning) will be populated here by the AI planning backend once you trigger a generation.
                </p>
              )}
            </div>
          </div>

          {/* 5. Today's Plan (Interactive timeline checklist) */}
          <section style={glassStyle}>
            <div style={{ ...cardTitleStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              <span>Your Schedule</span>
              <button
                type="button"
                disabled={!plan}
                onClick={handleExportPDF}
                style={{
                  background: !plan ? 'rgba(255, 255, 255, 0.04)' : '#7c3aed',
                  color: !plan ? '#475569' : '#ffffff',
                  border: 'none',
                  padding: '0.45rem 0.9rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: !plan ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: plan ? '0 0 12px rgba(124, 58, 237, 0.25)' : 'none',
                }}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Today's Plan</span>
              </button>
            </div>

            {/* Vertical timeline layout */}
            {tasksList.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {tasksList.map((task: any, idx: number) => {
                  const isString = typeof task === 'string';
                  const taskTitle = isString ? task : (task.task || 'Segment');
                  const taskTime = isString ? '' : (task.time || task.duration || '');
                  const taskDesc = "";

                  return (
                    <div key={idx} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                      {/* Vertical line connection */}
                      {idx < tasksList.length - 1 && (
                        <div style={{
                          width: '2px',
                          background: 'rgba(255, 255, 255, 0.12)',
                          position: 'absolute',
                          left: '11px',
                          top: '24px',
                          bottom: '-24px',
                        }} />
                      )}

                      {/* Timeline Bullet Dot */}
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: '#7c3aed',
                        border: '2px solid rgba(255, 255, 255, 0.2)',
                        zIndex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                      }}>
                        <span style={{ width: '6px', height: '6px', background: 'white', borderRadius: '50%' }} />
                      </div>

                      {/* Timeline Text Content */}
                      <div style={{ flex: 1, paddingBottom: '1.25rem' }}>
                        {taskTime && (
                          <div style={{ fontSize: '0.8rem', color: '#a78bfa', fontWeight: 'bold' }}>
                            {taskTime}
                          </div>
                        )}
                        <div style={{
                          fontWeight: 600,
                          fontSize: '0.95rem',
                          color: '#f8fafc',
                          marginTop: '0.15rem'
                        }}>
                          {taskTitle}
                        </div>
                        {taskDesc && (
                          <div style={{
                            fontSize: '0.8rem',
                            color: '#94a3b8',
                            lineHeight: '1.4',
                            marginTop: '0.15rem'
                          }}>
                            {taskDesc}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748b', fontSize: '0.9rem' }}>
                <Clock style={{ width: '32px', height: '32px', color: '#3b384f', margin: '0 auto 0.75rem' }} />
                Generate your first personalized plan.
              </div>
            )}
          </section>

          {/* Daily Reflection Section */}
          <section style={glassStyle}>
            <div style={cardTitleStyle}>Daily Reflection</div>
            
            <form onSubmit={handleAnalyzeReflection} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '1.5rem'
              }}>
                {/* Question 1: Dropdown */}
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Did today's plan feel realistic?</label>
                  <select 
                    value={realistic} 
                    onChange={(e) => setRealistic(e.target.value)} 
                    style={inputStyle}
                  >
                    <option value="Yes" style={{ background: '#030014' }}>Yes</option>
                    <option value="Mostly" style={{ background: '#030014' }}>Mostly</option>
                    <option value="No" style={{ background: '#030014' }}>No</option>
                  </select>
                </div>

                {/* Question 2: Satisfaction progress slider */}
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>
                    How satisfied are you with today's progress? <span style={{ color: '#a78bfa', fontWeight: 'bold' }}>({satisfaction}/5)</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={satisfaction}
                    onChange={(e) => setSatisfaction(Number(e.target.value))}
                    style={{
                      width: '100%',
                      height: '6px',
                      background: 'rgba(255, 255, 255, 0.12)',
                      borderRadius: '3px',
                      WebkitAppearance: 'none',
                      margin: '10px 0',
                      cursor: 'pointer',
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b' }}>
                    <span>1</span>
                    <span>5</span>
                  </div>
                </div>
              </div>

              {/* Question 3: If you could change one thing */}
              <div style={inputGroupStyle}>
                <label style={labelStyle}>If you could change one thing about today, what would it be?</label>
                <textarea
                  style={{
                    width: '100%',
                    height: '80px',
                    fontSize: '0.9rem',
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '0.75rem',
                    padding: '0.75rem',
                    color: 'white',
                    outline: 'none',
                    resize: 'none',
                    boxSizing: 'border-box',
                  }}
                  placeholder="e.g. Start deep work 30 mins earlier or reduce focus blocks..."
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  required
                />
              </div>

              {/* Analyze Reflection Button */}
              <button
                type="submit"
                disabled={isAnalyzingReflection}
                style={{
                  ...btnPrimaryStyle,
                  background: isAnalyzingReflection ? 'rgba(124, 58, 237, 0.5)' : '#7c3aed',
                  cursor: isAnalyzingReflection ? 'not-allowed' : 'pointer',
                }}
              >
                {isAnalyzingReflection ? (
                  <>
                    <span style={{ width: '12px', height: '12px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze Reflection</span>
                  </>
                )}
              </button>
            </form>

            {/* Reflection Analysis Error */}
            {reflectionAnalysisError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '1rem',
                padding: '1rem 1.25rem',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'center',
                color: '#f87171',
                fontSize: '0.85rem',
                marginTop: '1.25rem',
              }}>
                <AlertCircle style={{ flexShrink: 0 }} className="w-5 h-5" />
                <div>
                  {reflectionAnalysisError}
                </div>
              </div>
            )}

            {/* Reflection Analysis Output */}
            {reflectionAnalysis && (
              <div style={{
                marginTop: '1.5rem',
                padding: '1.25rem',
                background: 'rgba(124, 58, 237, 0.05)',
                border: '1px solid rgba(124, 58, 237, 0.15)',
                borderRadius: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                    Reflection Summary
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#f8fafc', lineHeight: '1.4', margin: 0 }}>
                    {reflectionAnalysis.reflection_summary}
                  </p>
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f472b6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                    Tomorrow's Improvement
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: '1.4', margin: 0 }}>
                    {reflectionAnalysis.tomorrow_improvement}
                  </p>
                </div>

                {reflectionAnalysis.encouragement && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    background: 'rgba(244, 114, 182, 0.08)',
                    borderLeft: '3px solid #f472b6',
                    borderRadius: '0.375rem',
                  }}>
                    <div style={{ fontSize: '0.85rem', fontStyle: 'italic', color: '#f472b6', lineHeight: '1.4' }}>
                      "{reflectionAnalysis.encouragement}"
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Daily Reflection & 6. Future Relief block (Combined Section at bottom) */}
          <section style={glassStyle}>
            <div style={cardTitleStyle}>Daily Reflection & Future Relief</div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
              gap: '1.5rem',
            }}>
              
              {/* Question 1 & Question 2 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Question 1: plan realism */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500' }}>
                    Did today's plan feel realistic?
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {[
                      { value: 'yes', label: 'Yes' },
                      { value: 'somewhat', label: 'Somewhat' },
                      { value: 'no', label: 'No' }
                    ].map((opt) => {
                      const active = reflectionRealistic === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setReflectionRealistic(opt.value as any);
                            setReflectionSaved(false);
                          }}
                          style={pillStyle(active)}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Question 2: Satisfaction progress slider */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500' }}>
                    Are you satisfied with today's progress? <span style={{ color: '#a78bfa', fontWeight: 'bold' }}>({reflectionSatisfaction}/10)</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={reflectionSatisfaction}
                    onChange={(e) => {
                      setReflectionSatisfaction(Number(e.target.value));
                      setReflectionSaved(false);
                    }}
                    style={{
                      width: '100%',
                      height: '6px',
                      background: 'rgba(255, 255, 255, 0.12)',
                      borderRadius: '3px',
                      WebkitAppearance: 'none',
                      margin: '10px 0',
                      cursor: 'pointer',
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b' }}>
                    <span>1</span>
                    <span>10</span>
                  </div>
                </div>
              </div>

              {/* Question 3: If you could change one thing */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500' }}>
                    If you could change one thing about today, what would it be?
                  </label>
                  <textarea
                    style={{
                      width: '100%',
                      height: '80px',
                      fontSize: '0.8rem',
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      borderRadius: '0.75rem',
                      padding: '0.75rem',
                      color: 'white',
                      outline: 'none',
                      resize: 'none',
                    }}
                    placeholder="Start deep work 30 mins earlier or reduce focus blocks..."
                    value={reflectionChange}
                    onChange={(e) => {
                      setReflectionChange(e.target.value);
                      setReflectionSaved(false);
                    }}
                  />
                </div>

                <button
                  type="button"
                  disabled={isSavingReflection}
                  onClick={handleSaveReflection}
                  style={{
                    background: isSavingReflection ? 'rgba(124, 58, 237, 0.5)' : (reflectionSaved ? '#10b981' : '#7c3aed'),
                    border: 'none',
                    padding: '0.6rem 1rem',
                    borderRadius: '0.75rem',
                    color: 'white',
                    fontWeight: 600,
                    cursor: isSavingReflection ? 'not-allowed' : 'pointer',
                    fontSize: '0.8rem',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: reflectionSaved ? '0 0 15px rgba(16, 185, 129, 0.3)' : '0 0 15px rgba(124, 58, 237, 0.3)',
                  }}
                >
                  {isSavingReflection ? (
                    <>
                      <span style={{ width: '12px', height: '12px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />
                      <span>Saving...</span>
                    </>
                  ) : reflectionSaved ? (
                    <>✓ Saved</>
                  ) : (
                    'Save Reflection'
                  )}
                </button>
              </div>

              {/* 6. Future Relief block */}
              <div style={{
                background: 'rgba(124, 58, 237, 0.05)',
                border: '1px solid rgba(124, 58, 237, 0.15)',
                borderRadius: '1rem',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}>
                {isSavingReflection ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '80px' }}>
                    <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#a78bfa', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Analyzing reflection...</span>
                  </div>
                ) : reflectionSaveError ? (
                  <>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <AlertCircle className="w-3.5 h-3.5" /> Error
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#f87171', lineHeight: '1.4', margin: 0 }}>
                      Unable to generate plan. Please try again.
                    </p>
                  </>
                ) : bottomReflectionAnalysis ? (
                  <>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      AI Reflection Summary
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#f8fafc', lineHeight: '1.4', margin: 0 }}>
                      {bottomReflectionAnalysis.reflection_summary}
                    </p>
                    
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f472b6', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.5rem' }}>
                      Tomorrow Improvement
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.4', margin: 0 }}>
                      {bottomReflectionAnalysis.tomorrow_improvement}
                    </p>

                    {bottomReflectionAnalysis.encouragement ? (
                      <div style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        background: 'rgba(244, 114, 182, 0.08)',
                        borderLeft: '3px solid #f472b6',
                        borderRadius: '0.25rem',
                      }}>
                        <div style={{ fontSize: '0.75rem', fontStyle: 'italic', color: '#f472b6', lineHeight: '1.4' }}>
                          "{bottomReflectionAnalysis.encouragement}"
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Tomorrow Feels Easier Because...
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.4', margin: 0 }}>
                      {futureReliefText}
                    </p>
                  </>
                )}
              </div>

            </div>
          </section>

        </div>

      </main>
    </div>
  );
}
