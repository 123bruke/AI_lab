import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  ArrowUp,
  Paperclip,
  X,
  RotateCcw,
  Minimize2,
  Maximize2,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Flame,
  Snowflake,
  Droplets,
  Layers,
  Zap,
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
  onOpenMaterials?: () => void;
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
  onOpenMaterials,
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
      content: `Hello! I'm your AI Lab Assistant.

I can help you explore materials, set up optical experiments (lenses, mirrors, prisms, laser), manage chemical reactions, or simulate thermodynamics on the 3D bench.

What would you like to explore today?`,
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
      const content = (event.target?.result as string) || '';
      setAttachedFile({
        name: file.name,
        content: content.slice(0, 10000),
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

    // 1. Tool: Chemical Selection
    let matchedChemical: (typeof CHEMICAL_PRESETS)[0] | null = null;
    if (textLower.includes('copper') || textLower.includes('cuso4') || textLower.includes('blue')) {
      matchedChemical = CHEMICAL_PRESETS[1];
    } else if (textLower.includes('potassium') || textLower.includes('permanganate') || textLower.includes('kmno4') || textLower.includes('purple')) {
      matchedChemical = CHEMICAL_PRESETS[2];
    } else if (textLower.includes('iron') || textLower.includes('fecl3') || textLower.includes('amber')) {
      matchedChemical = CHEMICAL_PRESETS[3];
    } else if (textLower.includes('indicator') || textLower.includes('ph')) {
      matchedChemical = CHEMICAL_PRESETS[4];
    } else if (textLower.includes('pure water') || textLower.includes('distilled') || textLower.includes('water')) {
      matchedChemical = CHEMICAL_PRESETS[0];
    }

    if (matchedChemical) {
      onSelectChemical(matchedChemical.color, matchedChemical.name);
      executedTools.push({
        tool: 'prepare_reagents',
        parameters: { solute: matchedChemical.name, formula: matchedChemical.formula },
        description: `Dispensed 350 mL of ${matchedChemical.name} into the reaction beaker.`,
        timestamp: new Date().toLocaleTimeString(),
      });
    }

    // 2. Tool: Burner & Heat Control
    if (
      textLower.includes('ignite') ||
      textLower.includes('heat') ||
      textLower.includes('boil') ||
      textLower.includes('fire') ||
      textLower.includes('burner')
    ) {
      if (!experiment.isBurnerLit) {
        onToggleBurner();
      }
      let power = 85;
      if (textLower.includes('max') || textLower.includes('100%') || textLower.includes('high')) {
        power = 100;
      } else if (textLower.includes('gentle') || textLower.includes('low') || textLower.includes('simmer')) {
        power = 40;
      }
      onFirePowerChange(power);
      executedTools.push({
        tool: 'control_burner',
        parameters: { isLit: true, firePower: power },
        description: `Ignited Bunsen burner to ${power}% power for solution heating.`,
        timestamp: new Date().toLocaleTimeString(),
      });
    } else if (textLower.includes('extinguish') || textLower.includes('turn off burner')) {
      if (experiment.isBurnerLit) {
        onToggleBurner();
        executedTools.push({
          tool: 'control_burner',
          parameters: { isLit: false, firePower: 0 },
          description: `Extinguished burner flame to safely cool apparatus.`,
          timestamp: new Date().toLocaleTimeString(),
        });
      }
    }

    // 3. Tool: Cryogenic Ice Quench
    if (textLower.includes('ice') || textLower.includes('cool') || textLower.includes('quench')) {
      onAddIce();
      executedTools.push({
        tool: 'thermal_quench',
        parameters: { deltaTemp: -20, coolant: 'Cryogenic Ice' },
        description: `Added thermal ice cubes to rapidly quench beaker temperature.`,
        timestamp: new Date().toLocaleTimeString(),
      });
    }

    // 4. Tool: Refill Water
    if (textLower.includes('refill') || textLower.includes('add water')) {
      onRefillWater();
      executedTools.push({
        tool: 'refill_water',
        parameters: { targetVolume: 350 },
        description: `Refilled beaker meniscus to 350 mL pure distilled water.`,
        timestamp: new Date().toLocaleTimeString(),
      });
    }

    // 5. Tool: Camera Positioning
    if (textLower.includes('macro') || textLower.includes('zoom') || textLower.includes('close-up')) {
      onSetCameraPreset('macro_beaker');
      executedTools.push({
        tool: 'set_camera_view',
        parameters: { preset: 'macro_beaker' },
        description: `Switched viewport to high-magnification macro focus.`,
        timestamp: new Date().toLocaleTimeString(),
      });
    } else if (textLower.includes('top') || textLower.includes('overhead')) {
      onSetCameraPreset('top_down');
      executedTools.push({
        tool: 'set_camera_view',
        parameters: { preset: 'top_down' },
        description: `Positioned camera for top-down meniscus and convection viewing.`,
        timestamp: new Date().toLocaleTimeString(),
      });
    }

    // 6. Tool: Materials Drawer trigger
    if (textLower.includes('material') || textLower.includes('lens') || textLower.includes('mirror') || textLower.includes('prism') || textLower.includes('optic')) {
      if (onOpenMaterials) {
        onOpenMaterials();
        executedTools.push({
          tool: 'open_materials_catalog',
          parameters: { section: 'optics_and_materials' },
          description: `Opened Materials drawer with 10 optical instruments and 4D specimens.`,
          timestamp: new Date().toLocaleTimeString(),
        });
      }
    }

    // 7. Dynamic Natural Response Formulation
    let responseText = '';
    if (textLower.includes('lens') || textLower.includes('convex') || textLower.includes('concave')) {
      responseText = `**Optical Lens Fundamentals:**
- **Convex Lens (Converging):** Thicker in the center than at the edges. Parallel incident rays converge at a real focal point ($f > 0$). Used for real image projection and magnification.
- **Concave Lens (Diverging):** Thinner in the middle. Parallel rays diverge as if originating from a virtual focal point ($f < 0$).

You can click the **Materials** button to place both lenses onto your 3D optical bench!`;
    } else if (textLower.includes('mirror') || textLower.includes('reflection')) {
      responseText = `**Specular Reflection Dynamics:**
- **Plane Mirror:** Angle of incidence equals angle of reflection ($\\theta_i = \\theta_r$). Forms a virtual, erect, and laterally inverted image.
- **Concave Mirror:** Curved converging reflector. Focuses parallel light to an intense focal point.
- **Convex Mirror:** Curved diverging reflector. Produces upright, diminished virtual images with a wide field of view.

Check the **Materials** drawer to add and position mirrors on the 3D table!`;
    } else if (textLower.includes('prism') || textLower.includes('refraction') || textLower.includes('rainbow')) {
      responseText = `**Prism Dispersion & Snell's Law:**
When polychromatic light enters an optical prism, different wavelengths experience varying refractive indices ($n_{red} < n_{violet}$). As a result, violet light bends the most while red bends the least, separating into constituent spectral colors.

You can inspect the 4D dispersion fan directly on the 3D bench!`;
    } else if (executedTools.length > 0) {
      responseText = `I have updated the 3D bench according to your instructions. All actions have been executed in real-time. Let me know what else you'd like to investigate!`;
    } else {
      responseText = `I'm monitoring your 3D laboratory bench. You can ask me to:
- Explain optical physics (lenses, reflection, prism dispersion, laser tracing)
- Balance chemical reactions or calculate thermodynamic heat transfer ($Q = mc\\Delta T$)
- Directly prepare apparatus, ignite burners, or open the Materials catalog`;
    }

    return {
      tools: executedTools,
      response: responseText,
      safetyAlert: safety,
    };
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() && !attachedFile) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      attachedFileName: attachedFile?.name,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    const currentAttachment = attachedFile;
    setAttachedFile(null);
    setIsThinking(true);
    labAudio.playClick();

    // Execute agentic tools
    const localResult = executeAgenticActions(textToSend, currentAttachment);

    // Call Backend / Gemini LLM
    let aiText = localResult.response;
    try {
      const response = await api.consultAgent({
        prompt: textToSend,
        current_temp: experiment.temperature,
        current_volume: experiment.liquidVolume,
        is_burner_lit: experiment.isBurnerLit,
        solute_name: experiment.soluteName,
      });

      if (response && response.response) {
        aiText = response.response;
      }
    } catch {
      // Use refined response
    }

    const assistantMsg: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: aiText,
      toolExecutions: localResult.tools.length > 0 ? localResult.tools : undefined,
      safetyAlert: localResult.safetyAlert,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setIsThinking(false);
    setMessages((prev) => [...prev, assistantMsg]);
    labAudio.playGlassClink();
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
        content: `Chat history cleared. How can I help you with your laboratory experiments today?`,
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
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#10a37f] text-white font-medium text-sm shadow-2xl hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-emerald-400/40"
      >
        <Sparkles size={18} />
        <span>Ask AI Assistant</span>
      </button>
    );
  }

  return (
    <aside
      className={`fixed top-4 bottom-4 right-4 z-40 transition-all duration-300 ease-in-out flex flex-col ${
        isMinimized ? 'h-14 w-80' : 'w-[410px] max-w-[calc(100vw-2rem)]'
      } rounded-3xl bg-neutral-950/95 border border-white/15 backdrop-blur-2xl shadow-2xl overflow-hidden font-sans`}
    >
      {/* 1. Clean ChatGPT-Style Header: White & Emerald Green */}
      <div className="px-4 py-3.5 border-b border-white/10 bg-neutral-900/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {/* OpenAI-Style Green Icon */}
          <div className="w-8 h-8 rounded-full bg-[#10a37f] flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white tracking-wide">
                AI Assistant
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-neutral-400 font-normal">
              Scientific Paired Copilot
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-neutral-400">
          <button
            onClick={clearChat}
            title="New Chat"
            className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors"
          >
            <RotateCcw size={15} />
          </button>
          <button
            onClick={() => setIsMinimized((prev) => !prev)}
            title={isMinimized ? 'Expand' : 'Minimize'}
            className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors"
          >
            {isMinimized ? <Maximize2 size={15} /> : <Minimize2 size={15} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            title="Close"
            className="p-1.5 rounded-lg hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* 2. Messages List (ChatGPT Clean Aesthetics) */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Assistant Avatar */}
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-[#10a37f] shrink-0 flex items-center justify-center text-white mt-0.5 shadow-sm">
                    <Bot size={14} />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-[#10a37f] text-white rounded-tr-sm font-normal'
                      : 'bg-neutral-900 border border-white/10 text-neutral-200 rounded-tl-sm'
                  }`}
                >
                  {/* File Attachment Pill */}
                  {msg.attachedFileName && (
                    <div className="mb-2 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/30 border border-white/10 text-[11px] text-emerald-200">
                      <FileText size={12} />
                      <span className="truncate max-w-[200px]">{msg.attachedFileName}</span>
                    </div>
                  )}

                  {/* Formatted Content */}
                  <div className="whitespace-pre-wrap break-words space-y-1.5 text-xs">
                    {msg.content}
                  </div>

                  {/* Executed Tools Cards (Clean Green Badges) */}
                  {msg.toolExecutions && msg.toolExecutions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-white/10 space-y-1.5">
                      {msg.toolExecutions.map((t, idx) => (
                        <div
                          key={idx}
                          className="px-2.5 py-1.5 rounded-xl bg-black/40 border border-emerald-500/20 text-[11px] flex items-center gap-2"
                        >
                          <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                          <span className="text-neutral-300 font-sans">{t.description}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Safety Warning */}
                  {msg.safetyAlert && (
                    <div className="mt-2.5 flex items-center gap-1.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px]">
                      <AlertTriangle size={13} className="shrink-0" />
                      <span>{msg.safetyAlert}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Thinking Animation (Clean 3 Bouncing Dots) */}
            {isThinking && (
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[#10a37f] shrink-0 flex items-center justify-center text-white">
                  <Bot size={14} />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-neutral-900 border border-white/10 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 3. Helpful Quick Prompt Suggestions */}
          <div className="px-3 py-2 border-t border-white/5 bg-neutral-900/40 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 text-xs">
            <button
              onClick={() => handleSendMessage('Explain convex lens converging vs concave lens diverging')}
              className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-emerald-400/50 hover:bg-emerald-500/10 text-neutral-300 transition-all cursor-pointer"
            >
              Convex vs Concave Lens
            </button>
            <button
              onClick={() => handleSendMessage('How does an optical prism disperse white light?')}
              className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-emerald-400/50 hover:bg-emerald-500/10 text-neutral-300 transition-all cursor-pointer"
            >
              Prism Dispersion
            </button>
            <button
              onClick={() => handleSendMessage('Ignite burner to 85% power and switch camera to macro beaker view')}
              className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-orange-400/50 hover:bg-orange-500/10 text-neutral-300 transition-all cursor-pointer"
            >
              🔥 Heat Solution
            </button>
            <button
              onClick={() => handleSendMessage('Quench reaction with cryogenic ice')}
              className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-cyan-400/50 hover:bg-cyan-500/10 text-neutral-300 transition-all cursor-pointer"
            >
              🧊 Quench to 0°C
            </button>
          </div>

          {/* 4. Signature ChatGPT-Style Input Bar */}
          <div className="p-3 border-t border-white/10 bg-neutral-900/70 shrink-0">
            {/* Attached file tag preview */}
            {attachedFile && (
              <div className="mb-2 flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <FileText size={14} className="shrink-0 text-emerald-400" />
                  <span className="truncate">{attachedFile.name}</span>
                </div>
                <button
                  onClick={() => setAttachedFile(null)}
                  className="p-1 hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Input Pill Box */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-neutral-900 border border-white/15 focus-within:border-emerald-500 transition-all">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".txt,.md,.json,.pdf,.csv,.doc,.docx"
                className="hidden"
              />

              {/* Paperclip */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Attach experiment protocol or document"
                className="p-2 rounded-xl text-neutral-400 hover:text-emerald-400 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <Paperclip size={16} />
              </button>

              {/* Text Input Area */}
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message AI Assistant..."
                rows={1}
                className="flex-1 bg-transparent px-1 py-1.5 text-xs text-white placeholder-neutral-500 outline-none resize-none leading-relaxed"
              />

              {/* Signature Circular Green ArrowUp Send Button */}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={(!inputMessage.trim() && !attachedFile) || isThinking}
                title="Send message"
                className="w-8 h-8 rounded-full bg-[#10a37f] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-emerald-500 text-white flex items-center justify-center transition-all cursor-pointer shadow-md shadow-emerald-600/30 active:scale-95 shrink-0"
              >
                <ArrowUp size={16} />
              </button>
            </div>

            <p className="text-[10px] text-neutral-500 mt-1.5 text-center font-normal">
              AI Assistant can control 3D tools, manage materials & analyze experimental protocols.
            </p>
          </div>
        </>
      )}
    </aside>
  );
};
