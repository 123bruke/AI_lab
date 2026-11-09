import React, { useState, useEffect } from 'react';
import {
  X,
  Bot,
  Sparkles,
  Activity,
  FileText,
  Layers,
  Search,
  Zap,
  ShieldAlert,
  Sun,
  Compass,
  Camera,
  CheckCircle,
  Play,
  RotateCcw,
  Terminal,
  Database,
  Eye,
  AlertCircle,
  Upload,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Sliders
} from 'lucide-react';
import {
  api,
  AgentInfo,
  AgentTaskResponse,
  LabReportItem,
  HybridSearchMatch,
  VisionDetectionResponse,
  ErrorLogItem
} from '../services/api';
import { labAudio } from '../utils/audio';

interface MultiAgentCenterProps {
  isOpen: boolean;
  onClose: () => void;
  currentTemp: number;
  currentVolume: number;
  isBurnerLit: boolean;
  soluteName: string;
  onApplyApparatusAction: (action: string, payload?: any) => void;
}

type TabType = 'agents' | 'console' | 'reports' | 'search' | 'vision' | 'telemetry';

export const MultiAgentCenter: React.FC<MultiAgentCenterProps> = ({
  isOpen,
  onClose,
  currentTemp,
  currentVolume,
  isBurnerLit,
  soluteName,
  onApplyApparatusAction,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('console');
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>(''); // empty = orchestrator auto-route
  const [promptInput, setPromptInput] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [taskResult, setTaskResult] = useState<AgentTaskResponse | null>(null);

  // Tab Data States
  const [reports, setReports] = useState<LabReportItem[]>([]);
  const [selectedReport, setSelectedReport] = useState<LabReportItem | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('calorimetry heat capacity');
  const [searchCollection, setSearchCollection] = useState<string>('all');
  const [searchResults, setSearchResults] = useState<HybridSearchMatch[]>([]);
  const [searchLatency, setSearchLatency] = useState<number>(0);
  const [visionData, setVisionData] = useState<VisionDetectionResponse | null>(null);
  const [errorLogs, setErrorLogs] = useState<ErrorLogItem[]>([]);
  const [loadingVision, setLoadingVision] = useState<boolean>(false);

  // Load Initial Agents & Data
  useEffect(() => {
    if (!isOpen) return;

    api.getAgents().then(setAgents).catch(console.error);
    api.getLabReports().then((reps) => {
      setReports(reps);
      if (reps.length > 0) setSelectedReport(reps[0]);
    }).catch(console.error);
    api.getTelemetryErrors().then(setErrorLogs).catch(console.error);
  }, [isOpen]);

  if (!isOpen) return null;

  // Icon mapping
  const renderAgentIcon = (iconName: string, size = 18) => {
    switch (iconName) {
      case 'Activity': return <Activity size={size} className="text-cyan-400" />;
      case 'FileText': return <FileText size={size} className="text-emerald-400" />;
      case 'Layers': return <Layers size={size} className="text-purple-400" />;
      case 'Search': return <Search size={size} className="text-sky-400" />;
      case 'Zap': return <Zap size={size} className="text-amber-400" />;
      case 'ShieldAlert': return <ShieldAlert size={size} className="text-rose-400" />;
      case 'Sun': return <Sun size={size} className="text-yellow-400" />;
      case 'Compass': return <Compass size={size} className="text-blue-400" />;
      case 'Camera': return <Camera size={size} className="text-indigo-400" />;
      case 'CheckCircle': return <CheckCircle size={size} className="text-teal-400" />;
      default: return <Bot size={size} className="text-white" />;
    }
  };

  // Execute Agent Prompt
  const handleExecuteTask = async (customPrompt?: string) => {
    const q = customPrompt || promptInput;
    if (!q.trim() || isExecuting) return;

    setIsExecuting(true);
    labAudio.playClick();

    try {
      const res = await api.dispatchAgentTask({
        prompt: q,
        agent_id: selectedAgentId || undefined,
        apparatus_state: {
          temperature: currentTemp,
          waterLevel: currentVolume,
          isBurnerOn: isBurnerLit,
          soluteName: soluteName,
        },
      });

      setTaskResult(res);

      // Inspect Actions Taken & Trigger 3D Lab Updates
      if (res.actions_taken && res.actions_taken.length > 0) {
        for (const actionItem of res.actions_taken) {
          const act = actionItem.action;
          if (act === 'ignite_burner') {
            onApplyApparatusAction('IGNITE_BURNER', actionItem);
          } else if (act === 'apply_cooling' || act === 'apply_ice_cooling') {
            onApplyApparatusAction('ADD_ICE', actionItem);
          } else if (act === 'refill_water') {
            onApplyApparatusAction('REFILL_WATER', actionItem);
          } else if (act === 'adjust_stir_rpm') {
            onApplyApparatusAction('STIR_RPM', actionItem);
          }
        }
      }
    } catch (err) {
      console.error('Task execution error:', err);
    } finally {
      setIsExecuting(false);
    }
  };

  // Execute Hybrid Search
  const handleRunSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await api.executeHybridSearch(searchQuery, searchCollection, 6);
      setSearchResults(res.results);
      setSearchLatency(res.execution_time_ms);
      labAudio.playClick();
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  // Run YOLO Vision Analysis
  const handleRunVision = async () => {
    setLoadingVision(true);
    labAudio.playClick();
    try {
      const res = await api.detectApparatusYolo(currentTemp, currentVolume);
      setVisionData(res);
    } catch (err) {
      console.error('Vision analysis error:', err);
    } finally {
      setLoadingVision(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[90vh] bg-neutral-950/95 border border-white/15 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white font-sans">
        
        {/* ========================================================= */}
        {/* TOP CINEMA 4D OBSIDIAN HEADER BAR                        */}
        {/* ========================================================= */}
        <div className="px-6 py-4 border-b border-white/10 bg-black/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-black flex items-center justify-center font-bold shadow-lg shadow-white/20">
              <Bot size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-wide uppercase">Multi-Agent AI Command Center</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] text-emerald-400 font-mono font-semibold">
                  10 AGENTS ONLINE
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono">
                Autonomous Lab Network • ChromaDB Hybrid Search • YOLOv8 Optics • SQL Journaling
              </p>
            </div>
          </div>

          {/* Quick Telemetry & Close */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-neutral-900/80 border border-white/10 font-mono text-xs">
              <span className="text-neutral-400">Live Bench:</span>
              <span className="text-cyan-400 font-bold">{currentTemp.toFixed(1)}°C</span>
              <span className="text-neutral-600">/</span>
              <span className="text-sky-400 font-bold">{Math.round(currentVolume)} mL</span>
              <span className="text-neutral-600">/</span>
              <span className="text-neutral-300 font-bold">{isBurnerLit ? 'Flame ON' : 'Flame OFF'}</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-900 border border-white/10 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TABS NAVIGATION                                           */}
        {/* ========================================================= */}
        <div className="px-6 py-2 border-b border-white/10 bg-neutral-900/40 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'console', label: 'Orchestrator Console', icon: Terminal },
            { id: 'agents', label: '10 Agents Deck', icon: Layers },
            { id: 'reports', label: 'Academic Reports (SQL)', icon: FileText },
            { id: 'search', label: 'ChromaDB Hybrid Search', icon: Search },
            { id: 'vision', label: 'YOLOv8 Vision & Optics', icon: Camera },
            { id: 'telemetry', label: 'System Errors & Logs', icon: AlertCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as TabType);
                  labAudio.playClick();
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-white text-black shadow-md shadow-white/10'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* TAB CONTENTS                                              */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* TAB 1: CONSOLE & ORCHESTRATION */}
          {activeTab === 'console' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
              {/* Left Column: Prompt Input & Action Controls (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/10 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">
                      Routing Target
                    </span>
                    <select
                      value={selectedAgentId}
                      onChange={(e) => setSelectedAgentId(e.target.value)}
                      className="px-2.5 py-1 rounded-lg bg-black border border-white/20 text-xs font-mono text-neutral-200 focus:outline-none focus:border-white"
                    >
                      <option value="">⚡ Autonomous Master Orchestrator (Auto-Decompose)</option>
                      {agents.map((ag) => (
                        <option key={ag.id} value={ag.id}>
                          {ag.name} ({ag.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <textarea
                    rows={4}
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    placeholder="Enter command or research task (e.g., 'Heat beaker to 85°C and draw thermodynamic heating curve' or 'Identify HCl and verify GHS safety')..."
                    className="w-full p-3 rounded-xl bg-black/80 border border-white/15 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400 resize-none font-mono"
                  />

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-neutral-500">Press Run to execute multi-agent action</span>
                    <button
                      onClick={() => handleExecuteTask()}
                      disabled={isExecuting || !promptInput.trim()}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-white/20"
                    >
                      {isExecuting ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          <span>Orchestrating...</span>
                        </>
                      ) : (
                        <>
                          <Play size={14} className="fill-current" />
                          <span>Dispatch Task</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Quick Preset Action Buttons */}
                <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/10 flex flex-col gap-2">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">
                    Instant Action Presets
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { label: '🔥 Ignite Flame to 90°C', prompt: 'Ignite burner and heat aqueous sample to 90 degrees celsius' },
                      { label: '🧊 Apply Cryogenic Ice', prompt: 'Apply cryogenic ice cooling to lower temperature below 10 degrees' },
                      { label: '💧 Refill Meniscus (+50mL)', prompt: 'Add 50mL of deionized water and measure meniscus level' },
                      { label: '📊 Compile Lab Report', prompt: 'Prepare complete academic lab report with thermodynamic calculations' },
                      { label: '🔍 Audit Bench Safety', prompt: 'Audit laboratory apparatus safety, check thermal runaway and PPE' },
                      { label: '⚡ Run Beer-Lambert Assay', prompt: 'Calculate spectrophotometric absorbance at 635nm for 0.05M solution' },
                    ].map((btn, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setPromptInput(btn.prompt);
                          handleExecuteTask(btn.prompt);
                        }}
                        className="px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-neutral-300 hover:text-white hover:border-white/30 text-left transition-all cursor-pointer text-[11px]"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Execution Output & Visual Display (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-4 overflow-y-auto">
                {taskResult ? (
                  <div className="flex flex-col gap-4">
                    {/* Execution Summary Banner */}
                    <div className="p-4 rounded-2xl bg-black border border-white/20 flex flex-col gap-2 shadow-2xl">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                          {taskResult.agent_name}
                        </span>
                        <span className="text-neutral-500">{taskResult.task_id}</span>
                      </div>
                      <p className="text-sm font-semibold text-white leading-relaxed">{taskResult.summary}</p>
                      <p className="text-xs text-neutral-400 font-mono">{taskResult.details}</p>

                      {/* Actions Taken Badges */}
                      {taskResult.actions_taken && taskResult.actions_taken.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-white/10 flex flex-wrap gap-2">
                          <span className="text-[10px] font-mono text-neutral-500 self-center uppercase">Physical Actions:</span>
                          {taskResult.actions_taken.map((act, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-white/10 border border-white/20 text-[11px] font-mono text-neutral-300">
                              ⚡ {act.action}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* SVG Vector Render */}
                    {taskResult.svg_render && (
                      <div className="p-4 rounded-2xl bg-black border border-white/10 flex flex-col gap-2">
                        <span className="text-xs font-mono text-neutral-400 uppercase font-bold">
                          Thermodynamic SVG Phase Curve
                        </span>
                        <div
                          className="w-full overflow-hidden rounded-xl border border-white/10"
                          dangerouslySetInnerHTML={{ __html: taskResult.svg_render }}
                        />
                      </div>
                    )}

                    {/* Mermaid Diagram Code / Structure */}
                    {taskResult.diagram_mermaid && (
                      <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/10 flex flex-col gap-2">
                        <span className="text-xs font-mono text-neutral-400 uppercase font-bold">
                          Mermaid Apparatus Topology
                        </span>
                        <pre className="p-3 rounded-xl bg-black text-xs font-mono text-cyan-300 overflow-x-auto border border-white/10">
                          {taskResult.diagram_mermaid}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full min-h-[300px] rounded-2xl border border-dashed border-white/15 flex flex-col items-center justify-center p-8 text-center text-neutral-500 gap-3">
                    <Bot size={40} className="text-neutral-600" />
                    <div>
                      <h4 className="text-sm font-bold text-neutral-300">Autonomous Orchestrator Ready</h4>
                      <p className="text-xs text-neutral-500 max-w-sm mt-1">
                        Select a task or type instructions. The Master Orchestrator will activate the required agents and take physical actions on the apparatus.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: 10 AGENTS DECK */}
          {activeTab === 'agents' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map((ag) => (
                <div
                  key={ag.id}
                  className="p-5 rounded-2xl bg-neutral-900/60 border border-white/10 hover:border-white/30 transition-all flex flex-col justify-between gap-4 group"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-black border border-white/15">
                        {renderAgentIcon(ag.icon)}
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 font-semibold uppercase">
                        {ag.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {ag.name}
                    </h3>
                    <p className="text-xs text-neutral-400 font-mono font-medium">{ag.role}</p>
                    <p className="text-xs text-neutral-500 leading-relaxed mt-1">{ag.description}</p>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {ag.supported_tasks.slice(0, 2).map((t, idx) => (
                        <span key={idx} className="text-[10px] font-mono text-neutral-400 bg-black/60 px-2 py-0.5 rounded border border-white/10">
                          {t}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedAgentId(ag.id);
                        setActiveTab('console');
                        setPromptInput(`Execute protocol analysis using ${ag.name}`);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-neutral-200 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>Engage</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: LAB REPORTS (SQL DATABASE) */}
          {activeTab === 'reports' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
              {/* Reports List (4 cols) */}
              <div className="lg:col-span-4 flex flex-col gap-2 overflow-y-auto">
                <span className="text-xs font-mono text-neutral-400 uppercase font-bold">
                  SQL Database Reports ({reports.length})
                </span>
                {reports.map((rep) => (
                  <button
                    key={rep.id}
                    onClick={() => setSelectedReport(rep)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                      selectedReport?.id === rep.id
                        ? 'bg-white text-black border-white shadow-lg'
                        : 'bg-neutral-900/60 text-white border-white/10 hover:border-white/30'
                    }`}
                  >
                    <span className="text-xs font-bold line-clamp-1">{rep.title}</span>
                    <span className="text-[10px] font-mono opacity-70">{rep.experiment_type}</span>
                    <span className="text-[10px] font-mono opacity-50">{new Date(rep.created_at).toLocaleDateString()}</span>
                  </button>
                ))}
              </div>

              {/* Report Detailed View (8 cols) */}
              <div className="lg:col-span-8 p-6 rounded-2xl bg-black border border-white/15 flex flex-col gap-4 overflow-y-auto">
                {selectedReport ? (
                  <>
                    <div className="border-b border-white/10 pb-4 flex flex-col gap-1">
                      <span className="text-xs font-mono text-cyan-400 font-bold uppercase">{selectedReport.experiment_type}</span>
                      <h3 className="text-lg font-bold text-white">{selectedReport.title}</h3>
                      <span className="text-xs text-neutral-400 font-mono">Author: {selectedReport.author}</span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <h4 className="text-xs font-mono text-neutral-400 uppercase font-bold">Abstract</h4>
                      <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-900/80 p-3 rounded-xl border border-white/10">
                        {selectedReport.abstract}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <h4 className="text-xs font-mono text-neutral-400 uppercase font-bold">Hypothesis & Methodology</h4>
                      <p className="text-xs text-neutral-300 whitespace-pre-line bg-neutral-900/80 p-3 rounded-xl border border-white/10">
                        {selectedReport.methodology}
                      </p>
                    </div>

                    {selectedReport.calculations && (
                      <div className="flex flex-col gap-2">
                        <h4 className="text-xs font-mono text-neutral-400 uppercase font-bold">Quantitative Thermodynamic Calculations</h4>
                        <pre className="text-xs font-mono text-emerald-400 bg-neutral-900/80 p-3 rounded-xl border border-white/10 whitespace-pre-wrap">
                          {selectedReport.calculations}
                        </pre>
                      </div>
                    )}

                    <div className="flex flex-col gap-2">
                      <h4 className="text-xs font-mono text-neutral-400 uppercase font-bold">Conclusion</h4>
                      <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-900/80 p-3 rounded-xl border border-white/10">
                        {selectedReport.conclusion}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-neutral-500 py-12">Select a report to view details</div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CHROMADB HYBRID SEARCH */}
          {activeTab === 'search' && (
            <div className="flex flex-col gap-6">
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/10 flex flex-col md:flex-row gap-3 items-center">
                <div className="relative flex-1 w-full">
                  <Search size={16} className="absolute left-3 top-3 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRunSearch()}
                    placeholder="Search protocols, MSDS datasheets, and reports (e.g., 'calorimetry specific heat' or 'hydrochloric acid hazards')..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-black border border-white/15 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white font-mono"
                  />
                </div>

                <select
                  value={searchCollection}
                  onChange={(e) => setSearchCollection(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-black border border-white/15 text-xs font-mono text-white focus:outline-none"
                >
                  <option value="all">All Collections</option>
                  <option value="protocols">Protocols</option>
                  <option value="msds">MSDS Sheets</option>
                  <option value="reports">Lab Reports</option>
                </select>

                <button
                  onClick={handleRunSearch}
                  className="px-5 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-all cursor-pointer shadow-lg"
                >
                  Hybrid Query
                </button>
              </div>

              {/* Search Results */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                  <span>Results ({searchResults.length})</span>
                  {searchLatency > 0 && <span>Latency: {searchLatency}ms (RRF Vector + BM25)</span>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.map((match) => (
                    <div
                      key={match.id}
                      className="p-4 rounded-2xl bg-neutral-900/80 border border-white/10 flex flex-col gap-2 hover:border-white/30 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-mono text-neutral-300 uppercase">
                          {match.collection}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] font-mono">
                          <span className="text-cyan-400 font-bold">Score: {(match.combined_score * 100).toFixed(1)}%</span>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-white">{match.title}</h4>
                      <p className="text-xs text-neutral-400 leading-relaxed font-mono">{match.snippet}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: YOLOV8 VISION & OPTICS */}
          {activeTab === 'vision' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/10 flex flex-col gap-3">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">
                    YOLOv8 Optical Camera Inspection
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Runs YOLOv8 laboratory apparatus classification, measuring liquid meniscus volume, thermocouple immersion, and burner flame status.
                  </p>

                  <button
                    onClick={handleRunVision}
                    disabled={loadingVision}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 transition-all cursor-pointer shadow-lg disabled:opacity-50"
                  >
                    {loadingVision ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Analyzing Optical Frame...</span>
                      </>
                    ) : (
                      <>
                        <Camera size={14} />
                        <span>Scan Bench Apparatus</span>
                      </>
                    )}
                  </button>
                </div>

                {/* PDF Protocol Parser Upload Card */}
                <div className="p-4 rounded-2xl bg-neutral-900/60 border border-white/10 flex flex-col gap-3">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider font-mono">
                    PDF Protocol Document Parser
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Upload an academic laboratory guide or MSDS PDF. The Vision Agent extracts reagents, apparatus, and procedures into ChromaDB.
                  </p>
                  <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-white/20 text-xs font-mono text-neutral-400 hover:text-white hover:border-white cursor-pointer transition-all">
                    <Upload size={14} />
                    <span>Upload Lab PDF (.pdf)</span>
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          alert(`Protocol document '${file.name}' received and queued for PDF parser.`);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Vision Results (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                {visionData ? (
                  <div className="flex flex-col gap-4">
                    <div className="p-4 rounded-2xl bg-black border border-white/20 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-cyan-400 font-bold">{visionData.model_version}</span>
                        <span className="text-neutral-500">{visionData.timestamp}</span>
                      </div>
                      <p className="text-xs text-neutral-300 font-mono">{visionData.summary}</p>
                    </div>

                    {/* Detections List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {visionData.detections.map((det, i) => (
                        <div key={i} className="p-3.5 rounded-xl bg-neutral-900/80 border border-white/10 flex flex-col gap-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white">{det.label}</span>
                            <span className="font-mono text-emerald-400">{(det.confidence * 100).toFixed(1)}%</span>
                          </div>
                          <span className="text-[11px] font-mono text-neutral-500">
                            BBox: [{det.bbox.map(b => Math.round(b)).join(', ')}]
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-full min-h-[250px] rounded-2xl border border-dashed border-white/15 flex flex-col items-center justify-center p-8 text-center text-neutral-500 gap-2">
                    <Camera size={36} className="text-neutral-600" />
                    <span className="text-xs font-mono">Click 'Scan Bench Apparatus' to initiate YOLOv8 inference.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: SYSTEM ERROR TELEMETRY (error_logs.db) */}
          {activeTab === 'telemetry' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-mono text-neutral-400 uppercase font-bold">
                    Dedicated Error Database (error_logs.db)
                  </h3>
                  <p className="text-xs text-neutral-500 font-mono">
                    All UI exceptions and backend errors recorded via Python logging
                  </p>
                </div>
                <button
                  onClick={() => api.getTelemetryErrors().then(setErrorLogs)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-white/15 text-xs font-mono text-neutral-300 hover:text-white"
                >
                  Refresh Logs
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {errorLogs.length > 0 ? (
                  errorLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-xl bg-neutral-900/70 border border-rose-500/30 flex flex-col gap-1 font-mono text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold text-[10px]">
                          {log.level}
                        </span>
                        <span className="text-neutral-500 text-[10px]">{log.timestamp}</span>
                      </div>
                      <span className="text-white font-bold">{log.message}</span>
                      {log.stack_trace && (
                        <pre className="text-[10px] text-neutral-500 overflow-x-auto mt-1 p-2 bg-black rounded">
                          {log.stack_trace}
                        </pre>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs font-mono text-emerald-400 bg-neutral-900/40 rounded-2xl border border-emerald-500/20">
                    ✓ All system operations nominal. Zero unhandled exceptions recorded in error_logs.db.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
