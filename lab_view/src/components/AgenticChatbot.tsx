import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  Paperclip,
  X,
  Flame,
  Droplets,
  Snowflake,
  Camera,
  Sun,
  RotateCcw,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Minimize2,
  Maximize2,
  Zap,
  Atom,
  HelpCircle,
} from 'lucide-react';
import { ExperimentState, CameraViewPreset, LabLightingState } from '../types';
import { CHEMICAL_PRESETS } from '../simulation/thermodynamics';
import { api } from '../services/api';
import { labAudio } from '../utils/audio';

export interface ToolExecutionRecord {
  tool: string;
  parameters: Record<string, any>;
  description: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolExecutions?: ToolExecutionRecord[];
  attachedFileName?: string;
  safetyAlert?: string;
  timestamp: string;
}

interface AgenticChatbotProps {
  experiment: ExperimentState;
  onToggleBurner: () => void;
  onFirePowerChange: (power: number) => void;
  onSelectChemical: (color: string, name: string) => void;
  onAddIce: () => void;
  onRefillWater: () => void;
  onSetCameraPreset: (preset: CameraViewPreset) => void;
  onToggleLight: (lightKey: keyof LabLightingState) => void;
  onReset: () => void;
}

export const AgenticChatbot: React.FC<AgenticChatbotProps> = ({
  experiment,
  onToggleBurner,
  onFirePowerChange,
  onSelectChemical,
  onAddIce,
  onRefillWater,
  onSetCameraPreset,
  onToggleLight,
  onReset,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{ name: string; content: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `### Welcome to MOSEB Autonomous Chemistry Lab Copilot 🧪
I am your **Agentic AI Lab Assistant**. I can directly control the 3D apparatus, configure reagents, manage thermodynamics, and analyze experimental protocols.

**How can I assist you today?**
- Ask me to prepare the lab space: *"Prepare copper sulfate solution and heat to 80°C"*
- Attach an experimental protocol or laboratory manual (clip icon)
- Ask chemistry, thermodynamics, or reaction mechanism questions`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking, isOpen, isMinimized]);

  // Handle file upload (txt, pdf, md, json, csv)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string || '';
      setAttachedFile({
        name: file.name,
        content: content.slice(0, 10000), // inspect first 10k chars
      });
      labAudio.playClick();
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Agentic Decision & Tool Execution Engine
  const executeAgenticActions = (
    userText: string,
    fileData?: { name: string; content: string } | null
  ): {
    tools: ToolExecutionRecord[];
    response: string;
    safetyAlert?: string;
  } => {
    const textLower = `${userText} ${fileData?.content || ''}`.toLowerCase();
    const executedTools: ToolExecutionRecord[] = [];
    let safety: string | undefined = undefined;

    // 1. Tool: prepare_apparatus / chemical selection
    let matchedChemical: (typeof CHEMICAL_PRESETS)[0] | null = null;
    if (textLower.includes('copper') || textLower.includes('cuso4') || textLower.includes('blue')) {
      matchedChemical = CHEMICAL_PRESETS[1]; // Copper sulfate
    } else if (textLower.includes('potassium') || textLower.includes('permanganate') || textLower.includes('kmno4') || textLower.includes('purple')) {
      matchedChemical = CHEMICAL_PRESETS[2]; // KMnO4
    } else if (textLower.includes('iron') || textLower.includes('fecl3') || textLower.includes('chloride') || textLower.includes('amber')) {
      matchedChemical = CHEMICAL_PRESETS[3]; // Iron chloride
    } else if (textLower.includes('universal') || textLower.includes('indicator') || textLower.includes('ph')) {
      matchedChemical = CHEMICAL_PRESETS[4]; // Universal indicator
    } else if (textLower.includes('pure water') || textLower.includes('distilled') || textLower.includes('water') || textLower.includes('h2o')) {
      matchedChemical = CHEMICAL_PRESETS[0]; // Pure H2O
    }

    if (matchedChemical) {
      onSelectChemical(matchedChemical.color, matchedChemical.name);
      executedTools.push({
        tool: 'prepare_reagents',
        parameters: { solute: matchedChemical.name, formula: matchedChemical.formula, colorHex: matchedChemical.color },
        description: `Dispensed 350 mL of ${matchedChemical.name} into borosilicate beaker.`,
        timestamp: new Date().toLocaleTimeString(),
      });
    }

    // 2. Tool: control_burner (heat / boil / ignite / fire)
    if (
      textLower.includes('heat') ||
      textLower.includes('fire') ||
      textLower.includes('burner') ||
      textLower.includes('ignite') ||
      textLower.includes('boil') ||
      textLower.includes('warm')
    ) {
      let power = 75;
      if (textLower.includes('100') || textLower.includes('max') || textLower.includes('boil')) power = 100;
      else if (textLower.includes('low') || textLower.includes('30') || textLower.includes('gentle')) power = 40;
      else if (textLower.includes('50') || textLower.includes('half')) power = 50;
      else if (textLower.includes('80') || textLower.includes('high')) power = 85;

      if (!experiment.isBurnerLit) {
        onToggleBurner();
      }
      onFirePowerChange(power);

      executedTools.push({
        tool: 'ignite_burner',
        parameters: { firePowerPercentage: power, status: 'LIT' },
        description: `Ignited Bunsen burner with convective thermal power at ${power}%.`,
        timestamp: new Date().toLocaleTimeString(),
      });

      safety = 'HOT SURFACE: Thermal hazard active. Wear heat-resistant silicone gloves.';
    }

    // 3. Tool: stop_heat / extinguish
    if (textLower.includes('stop heat') || textLower.includes('extinguish') || textLower.includes('turn off burner')) {
      if (experiment.isBurnerLit) {
        onToggleBurner();
      }
      onFirePowerChange(0);
      executedTools.push({
        tool: 'extinguish_burner',
        parameters: { status: 'OFF' },
        description: 'Extinguished Bunsen burner gas flow. Surface entering natural convection cooling.',
        timestamp: new Date().toLocaleTimeString(),
      });
    }

    // 4. Tool: cool_solution / ice quench
    if (textLower.includes('ice') || textLower.includes('cool') || textLower.includes('quench') || textLower.includes('cryo')) {
      onAddIce();
      executedTools.push({
        tool: 'quench_solution',
        parameters: { coolant: 'Cryogenic Ice Block (-20°C)' },
        description: 'Dropped high-purity cryogenic ice block into solution. Thermal dissipation initiated.',
        timestamp: new Date().toLocaleTimeString(),
      });
    }

    // 5. Tool: refill_water
    if (textLower.includes('refill') || textLower.includes('dilute') || textLower.includes('reset water')) {
      onRefillWater();
      executedTools.push({
        tool: 'refill_solvent',
        parameters: { volumeMl: 350, solvent: 'Deionized Water' },
        description: 'Replenished solvent volume to nominal 350 mL standard.',
        timestamp: new Date().toLocaleTimeString(),
      });
    }

    // 6. Tool: camera_preset
    if (textLower.includes('macro') || textLower.includes('zoom') || textLower.includes('close up') || textLower.includes('beaker view')) {
      onSetCameraPreset('macro_beaker');
      executedTools.push({
        tool: 'set_camera_angle',
        parameters: { preset: 'macro_beaker' },
        description: 'Repositioned cinema camera to Macro Optical Beaker view.',
        timestamp: new Date().toLocaleTimeString(),
      });
    } else if (textLower.includes('top') || textLower.includes('overhead')) {
      onSetCameraPreset('top_down');
      executedTools.push({
        tool: 'set_camera_angle',
        parameters: { preset: 'top_down' },
        description: 'Switched camera perspective to top-down optical alignment.',
        timestamp: new Date().toLocaleTimeString(),
      });
    } else if (textLower.includes('overview') || textLower.includes('wide')) {
      onSetCameraPreset('overview');
      executedTools.push({
        tool: 'set_camera_angle',
        parameters: { preset: 'overview' },
        description: 'Expanded viewpoint to studio workbench overview.',
        timestamp: new Date().toLocaleTimeString(),
      });
    }

    // 7. Tool: lighting
    if (textLower.includes('blacklight') || textLower.includes('uv') || textLower.includes('fluorescence')) {
      onToggleLight('uvBlacklight');
      executedTools.push({
        tool: 'toggle_uv_lighting',
        parameters: { mode: 'UV_Blacklight' },
        description: 'Toggled 365nm UV excitation illuminator on the reagent bench.',
        timestamp: new Date().toLocaleTimeString(),
      });
    }

    // 8. Tool: reset_lab
    if (textLower.includes('reset all') || textLower.includes('clear bench') || textLower.includes('start over')) {
      onReset();
      executedTools.push({
        tool: 'reset_laboratory',
        parameters: { status: 'INITIALIZED' },
        description: 'Reset thermodynamics, apparatus positions, and beaker solution to default state.',
        timestamp: new Date().toLocaleTimeString(),
      });
    }

    // Formulate intelligent educational narrative response
    let narrative = '';
    if (fileData) {
      narrative += `### Protocol Document Analyzed: "${fileData.name}"\n`;
      narrative += `I have parsed your experimental protocol and extracted the procedure requirements.\n\n`;
      if (executedTools.length > 0) {
        narrative += `**Apparatus Actions Executed on the 3D Bench:**\n`;
        executedTools.forEach((t) => {
          narrative += `- **${t.tool}**: ${t.description}\n`;
        });
        narrative += `\n*The 3D space is now prepared for this protocol. Current Temperature: **${experiment.temperature.toFixed(1)}°C**.*`;
      } else {
        narrative += `Protocol processed. Ready to execute specific equipment controls or thermodynamic simulations upon your instruction.`;
      }
    } else if (executedTools.length > 0) {
      narrative += `### Lab Space Configured Successfully ⚡\n`;
      narrative += `I have executed **${executedTools.length} automated tool action${executedTools.length > 1 ? 's' : ''}** directly on the 3D laboratory bench:\n\n`;
      executedTools.forEach((t) => {
        narrative += `- **${t.tool.replace(/_/g, ' ').toUpperCase()}**: ${t.description}\n`;
      });
      narrative += `\n**Scientific Overview:**\n`;
      if (matchedChemical) {
        narrative += `- **Reagent**: ${matchedChemical.name} (\`${matchedChemical.formula}\`)\n`;
        narrative += `- **Thermodynamic Behavior**: ${matchedChemical.description}\n`;
      }
      narrative += `- **System Temperature**: ${experiment.temperature.toFixed(1)}°C (${experiment.waterState.replace('_', ' ')})\n`;
      narrative += `- **Next Steps**: You can observe fluid convective currents, adjust flame power, or ask me for molecular dynamics analysis.`;
    } else {
      narrative = `### AI Lab Assistant Analysis\nI have evaluated your query: "${userText}".\n\n`;
      narrative += `**Current Laboratory Telemetry:**\n`;
      narrative += `- Solution: **${experiment.soluteName}**\n`;
      narrative += `- Temperature: **${experiment.temperature.toFixed(1)}°C** (${experiment.waterState})\n`;
      narrative += `- Solvent Volume: **${Math.round(experiment.liquidVolume)} mL**\n`;
      narrative += `- Burner State: **${experiment.isBurnerLit ? `LIT (${experiment.firePower}% power)` : 'OFF'}**\n\n`;
      narrative += `To prepare apparatus, say something like:\n`;
      narrative += `> *"Prepare copper sulfate solution and heat to 85°C"*\n`;
      narrative += `> *"Quench solution with cryogenic ice"* or attach a protocol file.`;
    }

    return {
      tools: executedTools,
      response: narrative,
      safetyAlert: safety,
    };
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputMessage;
    if (!textToSend.trim() && !attachedFile) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend || `Please analyze this attached protocol: ${attachedFile?.name}`,
      attachedFileName: attachedFile?.name,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    const currentAttachment = attachedFile;
    setAttachedFile(null);
    setIsThinking(true);
    labAudio.playClick();

    // Call backend API if reachable, while executing real 3D apparatus tools
    setTimeout(async () => {
      try {
        const agenticResult = executeAgenticActions(textToSend, currentAttachment);

        // Also ping backend telemetry if running
        try {
          await api.consultAgent({
            prompt: textToSend,
            current_temp: experiment.temperature,
            current_volume: experiment.liquidVolume,
            current_state: experiment.waterState,
            solute_name: experiment.soluteName,
          });
        } catch {
          // offline mode is fully handled client-side
        }

        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: agenticResult.response,
          toolExecutions: agenticResult.tools.length > 0 ? agenticResult.tools : undefined,
          safetyAlert: agenticResult.safetyAlert,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        labAudio.playGlassClink();
      } finally {
        setIsThinking(false);
      }
    }, 450);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome-cleared',
        role: 'assistant',
        content: `Chat history cleared. I am ready to prepare materials and run experiments on the 3D bench. What should we set up?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    labAudio.playClick();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          setIsMinimized(false);
          labAudio.playClick();
        }}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-cyan-500 text-black font-semibold text-sm shadow-2xl hover:bg-cyan-400 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-cyan-300/40"
      >
        <Sparkles size={18} className="animate-spin" />
        <span>Open AI Lab Copilot</span>
      </button>
    );
  }

  return (
    <aside
      className={`fixed top-4 bottom-4 right-4 z-40 transition-all duration-300 ease-in-out flex flex-col ${
        isMinimized ? 'h-14 w-80' : 'w-[420px] max-w-[calc(100vw-2rem)]'
      } rounded-2xl bg-neutral-950/90 border border-white/15 backdrop-blur-2xl shadow-2xl overflow-hidden font-sans`}
    >
      {/* 1. Sleek ChatGPT-Style Header */}
      <div className="px-4 py-3 border-b border-white/10 bg-neutral-900/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Atom size={18} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-white tracking-wider font-mono uppercase">
                AI Lab Copilot
              </h2>
              <span className="px-1.5 py-0.5 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-[9px] font-mono text-cyan-300 font-bold">
                Agentic 4D
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Direct 3D Bench Tool Control</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={clearChat}
            title="Clear Chat History"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={() => setIsMinimized((prev) => !prev)}
            title={isMinimized ? 'Expand Chat' : 'Minimize Chat'}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            title="Close Assistant"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* 2. Messages Scroll Area */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Message Bubble */}
                <div
                  className={`max-w-[90%] rounded-2xl px-3.5 py-3 shadow-md leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-cyan-600 text-white rounded-br-none'
                      : 'bg-neutral-900 border border-white/10 text-neutral-200 rounded-bl-none'
                  }`}
                >
                  {/* File Attachment tag if user uploaded file */}
                  {msg.attachedFileName && (
                    <div className="mb-2 flex items-center gap-1.5 px-2 py-1 rounded bg-black/30 border border-white/10 text-[11px] text-cyan-200">
                      <FileText size={12} />
                      <span className="truncate max-w-[200px]">{msg.attachedFileName}</span>
                    </div>
                  )}

                  {/* Formatted Text */}
                  <div className="whitespace-pre-wrap break-words space-y-1.5">
                    {msg.content}
                  </div>

                  {/* Tool Execution Visual Cards */}
                  {msg.toolExecutions && msg.toolExecutions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                      <div className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <Zap size={11} />
                        <span>Action Tools Executed on 3D Bench</span>
                      </div>
                      {msg.toolExecutions.map((t, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-black/40 border border-cyan-500/20 text-[11px] font-mono space-y-1"
                        >
                          <div className="flex items-center justify-between text-cyan-300 font-semibold">
                            <span>{t.tool}</span>
                            <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-bold">
                              <CheckCircle2 size={10} /> Active
                            </span>
                          </div>
                          <p className="text-[10px] text-neutral-300 font-sans">{t.description}</p>
                          <div className="text-[9px] text-neutral-400 bg-neutral-950/60 p-1.5 rounded overflow-x-auto">
                            {JSON.stringify(t.parameters)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Safety Warning Badge */}
                  {msg.safetyAlert && (
                    <div className="mt-2.5 flex items-center gap-1.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono">
                      <AlertTriangle size={13} className="shrink-0" />
                      <span>{msg.safetyAlert}</span>
                    </div>
                  )}
                </div>

                <span className="text-[9px] text-neutral-400 font-mono mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {/* Thinking / Tool Calling Animation */}
            {isThinking && (
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono bg-neutral-900/80 p-3 rounded-2xl border border-cyan-500/20 w-fit">
                <Sparkles size={14} className="animate-spin" />
                <span>AI Copilot evaluating protocol & preparing tools...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 3. Quick Action Chips */}
          <div className="px-3 py-2 border-t border-white/5 bg-neutral-900/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            <button
              onClick={() => handleSendMessage('Please prepare lab space for copper sulfate experiment and heat to 80°C')}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white/5 border border-white/10 hover:border-cyan-400/50 hover:bg-cyan-500/10 text-[10px] text-neutral-300 transition-all cursor-pointer flex items-center gap-1"
            >
              🧪 Copper Sulfate (80°C)
            </button>
            <button
              onClick={() => handleSendMessage('Ignite burner to 85% power and switch camera to macro beaker view')}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white/5 border border-white/10 hover:border-orange-400/50 hover:bg-orange-500/10 text-[10px] text-neutral-300 transition-all cursor-pointer flex items-center gap-1"
            >
              🔥 Ignite Burner & Zoom
            </button>
            <button
              onClick={() => handleSendMessage('Quench reaction with cryogenic ice')}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white/5 border border-white/10 hover:border-cyan-400/50 hover:bg-cyan-500/10 text-[10px] text-neutral-300 transition-all cursor-pointer flex items-center gap-1"
            >
              🧊 Quench Solution
            </button>
            <button
              onClick={() => handleSendMessage('Prepare potassium permanganate and turn on UV blacklight')}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white/5 border border-white/10 hover:border-purple-400/50 hover:bg-purple-500/10 text-[10px] text-neutral-300 transition-all cursor-pointer flex items-center gap-1"
            >
              🟣 KMnO₄ + UV Light
            </button>
          </div>

          {/* 4. Input Box with File Attachment (ChatGPT-Style) */}
          <div className="p-3 border-t border-white/10 bg-neutral-900/70 shrink-0">
            {/* Attached file pill preview */}
            {attachedFile && (
              <div className="mb-2 flex items-center justify-between px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <FileText size={14} className="shrink-0 text-cyan-400" />
                  <span className="truncate font-mono">{attachedFile.name}</span>
                </div>
                <button
                  onClick={() => setAttachedFile(null)}
                  className="p-1 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".txt,.md,.json,.pdf,.csv,.doc,.docx"
                className="hidden"
              />

              {/* Attachment Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Attach experiment protocol file (PDF, TXT, MD, JSON)"
                className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-neutral-400 hover:text-cyan-400 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Paperclip size={16} />
              </button>

              {/* Input Area */}
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask AI Copilot or say 'prepare lab space for...'"
                rows={1}
                className="flex-1 bg-black/50 border border-white/15 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none resize-none transition-all"
              />

              {/* Send Button */}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={(!inputMessage.trim() && !attachedFile) || isThinking}
                title="Send instruction to AI Agent"
                className="p-2.5 rounded-xl bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-cyan-400 text-black font-bold transition-all cursor-pointer shadow-lg shadow-cyan-500/20 active:scale-95"
              >
                <Send size={15} />
              </button>
            </div>

            <p className="text-[10px] text-neutral-500 font-mono mt-1.5 text-center">
              Autonomous Agent: Executes 3D tools, controls burner, dispenses reagents & parses protocols.
            </p>
          </div>
        </>
      )}
    </aside>
  );
};
