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
  Check
} from 'lucide-react';

export default function App() {
  // Input states
  const [goal, setGoal] = useState('');
  const [energy, setEnergy] = useState('Medium');
  
  // Real backend loading & response states (Connecting directly to http://127.0.0.1:8000/generate-plan)
  const [plan, setPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reflection states (Managed entirely in local state, no API required)
  const [reflectionRealistic, setReflectionRealistic] = useState<'yes' | 'somewhat' | 'no' | null>(null);
  const [reflectionSatisfaction, setReflectionSatisfaction] = useState<number>(7);
  const [reflectionChange, setReflectionChange] = useState<string>('');
  const [reflectionSaved, setReflectionSaved] = useState<boolean>(false);

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
          energy: energy
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned error status: ${response.status}`);
      }

      const responseData = await response.json();
      setPlan(responseData);
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

  // Safe mapping of dynamic properties coming from FastAPI backend
  const summaryText = plan?.today_summary || "Submit your Daily Goal and Current Mental Stamina to fetch your customized agenda from the planner algorithm.";
  const tasksList = plan?.today_plan || [];
  const futureReliefText = plan?.future_relief || "Complete tasks today to earn cognitive freedom tomorrow.";
  
  const rawWhySuggested = plan?.reasoning || [];
  const whySuggestedList = Array.isArray(rawWhySuggested) 
    ? rawWhySuggested 
    : typeof rawWhySuggested === 'string' 
      ? [rawWhySuggested] 
      : [];

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
                    <span>Building your personalized schedule...</span>
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
                <span style={{ fontWeight: 'bold' }}>Failed to generate plan.</span> {error}
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
            <div style={{ ...cardTitleStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <span>Your Schedule</span>
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
                  onClick={() => setReflectionSaved(true)}
                  style={{
                    background: reflectionSaved ? '#10b981' : '#7c3aed',
                    border: 'none',
                    padding: '0.6rem 1rem',
                    borderRadius: '0.75rem',
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: reflectionSaved ? '0 0 15px rgba(16, 185, 129, 0.3)' : '0 0 15px rgba(124, 58, 237, 0.3)',
                  }}
                >
                  {reflectionSaved ? (
                    <>✓ Saved locally</>
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
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Tomorrow Feels Easier Because...
                </div>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.4', margin: 0 }}>
                  {futureReliefText}
                </p>
              </div>

            </div>
          </section>

        </div>

      </main>
    </div>
  );
}
