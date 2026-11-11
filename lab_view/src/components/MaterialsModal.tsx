import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Search,
  X,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  Flame,
  Eye,
  CheckCircle,
  HelpCircle,
  Maximize2,
  Minimize2,
  Sliders,
  Move,
} from 'lucide-react';
import { LAB_MATERIALS_DATABASE, LabMaterial, MaterialCategory } from '../data/materialsData';
import { BenchItemData, LabToolType } from '../types';
import { labAudio } from '../utils/audio';

interface MaterialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  benchItems: BenchItemData[];
  onAddMaterialToBench: (material: LabMaterial) => void;
  onRemoveBenchItem: (id: string) => void;
  onClearCustomItems: () => void;
}

export const MaterialsModal: React.FC<MaterialsModalProps> = ({
  isOpen,
  onClose,
  benchItems,
  onAddMaterialToBench,
  onRemoveBenchItem,
  onClearCustomItems,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MaterialCategory>('all');
  const [activeTab, setActiveTab] = useState<'catalog' | 'table_inventory'>('catalog');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const categories: { id: MaterialCategory; label: string; count?: number }[] = [
    { id: 'all', label: 'All Materials' },
    { id: 'optics', label: '✦ Optics & 4D (10 Tools)' },
    { id: 'fire_type', label: '🔥 Fire Types (12)' },
    { id: 'glassware', label: 'Glassware' },
    { id: 'metals', label: 'Metals & Alloys' },
    { id: 'ceramics', label: 'Ceramics' },
    { id: 'polymers', label: 'Polymers' },
    { id: 'crystals', label: 'Crystals' },
    { id: '4d_hyper', label: '✦ 4D Hyper-Matter (10)' },
  ];

  const filteredMaterials = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return LAB_MATERIALS_DATABASE.filter((mat) => {
      const matchesCategory =
        selectedCategory === 'all' || mat.category === selectedCategory;
      const matchesQuery =
        !q ||
        mat.name.toLowerCase().includes(q) ||
        mat.composition.toLowerCase().includes(q) ||
        mat.description.toLowerCase().includes(q) ||
        (mat.properties.functionPurpose && mat.properties.functionPurpose.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  const customPlacedItems = useMemo(() => {
    return benchItems.filter((i) => i.isRemovable || i.type === 'convex_lens' || i.type === 'concave_lens' || i.type === 'plane_mirror' || i.type === 'concave_mirror' || i.type === 'convex_mirror' || i.type === 'prism' || i.type === 'optical_bench' || i.type === 'light_source' || i.type === 'screen' || i.type === 'laser_pointer' || i.type === 'dynamic_material');
  }, [benchItems]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[88vh] flex flex-col rounded-3xl bg-neutral-950 border border-white/15 text-white shadow-2xl overflow-hidden font-sans">
        
        {/* 1. Header Bar: Clean White & Emerald Accents */}
        <div className="px-6 py-4 border-b border-white/10 bg-neutral-900/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Boxes size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-wide">
                  Laboratory Materials & Optics
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/20">
                  Interactive 4D Table
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Search, drag, or place optics tools, fire types, and 4D specimens directly onto the bench
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab Switcher: Catalog vs Table Inventory */}
            <div className="flex bg-neutral-900 border border-white/10 rounded-xl p-1 text-xs">
              <button
                onClick={() => setActiveTab('catalog')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                  activeTab === 'catalog'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Materials Catalog ({LAB_MATERIALS_DATABASE.length})
              </button>
              <button
                onClick={() => setActiveTab('table_inventory')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 font-medium ${
                  activeTab === 'table_inventory'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>On Table</span>
                <span className="px-1.5 py-0.2 rounded-full bg-black/40 text-[10px] font-mono">
                  {benchItems.length}
                </span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 2. Main Content Area */}
        {activeTab === 'catalog' ? (
          <div className="flex-1 flex flex-col p-6 overflow-hidden min-h-0 space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lenses, mirrors, prism, laser, fire materials, polymers..."
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-neutral-900 border border-white/10 focus:border-emerald-500 text-xs text-white placeholder-neutral-500 outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none shrink-0 text-xs font-medium">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl border whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? cat.id === 'optics'
                        ? 'bg-emerald-600 text-white border-emerald-500 font-bold shadow-lg shadow-emerald-600/30'
                        : 'bg-white text-black border-white font-bold'
                      : 'bg-neutral-900 border-white/10 text-neutral-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Materials Grid */}
            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 md:grid-cols-2 gap-3 min-h-0">
              {filteredMaterials.map((mat) => {
                const isOptics = mat.category === 'optics';
                const isFire = mat.isFireType;
                const is4D = mat.is4D;

                return (
                  <div
                    key={mat.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between group ${
                      isOptics
                        ? 'border-emerald-500/30 bg-emerald-950/15 hover:border-emerald-400'
                        : isFire
                        ? 'border-orange-500/30 bg-orange-950/15 hover:border-orange-400'
                        : is4D
                        ? 'border-purple-500/30 bg-purple-950/15 hover:border-purple-400'
                        : 'border-white/10 bg-neutral-900/60 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-4 h-4 rounded-full border border-white/30 shrink-0 shadow-md group-hover:scale-110 transition-transform"
                            style={{
                              backgroundColor: mat.color,
                              boxShadow: `0 0 10px ${mat.color}60`,
                            }}
                          />
                          <div>
                            <h3 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                              {mat.name}
                            </h3>
                            {mat.properties.functionPurpose && (
                              <p className="text-[11px] text-emerald-400 font-mono font-semibold">
                                {mat.properties.functionPurpose}
                              </p>
                            )}
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider bg-black/40 text-neutral-400 border border-white/10">
                          {mat.category}
                        </span>
                      </div>

                      <p className="text-[11px] text-neutral-300 font-sans mt-2 leading-relaxed">
                        {mat.description}
                      </p>

                      <div className="mt-2 text-[10px] text-neutral-400 font-mono flex items-center gap-2 flex-wrap">
                        <span className="px-1.5 py-0.5 rounded bg-black/50 border border-white/5 truncate max-w-[220px]">
                          {mat.composition}
                        </span>
                        {mat.properties.refractiveIndex && (
                          <span className="px-1.5 py-0.5 rounded bg-black/50 border border-white/5 text-cyan-300">
                            {mat.properties.refractiveIndex}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {isOptics ? 'Precision Optical Specimen' : is4D ? '4D Quantum Hyper-Matter' : 'Standard Laboratory Material'}
                      </span>

                      {/* Place on Table Button */}
                      <button
                        onClick={() => {
                          onAddMaterialToBench(mat);
                          labAudio.playGlassClink();
                          showToast(`Placed ${mat.name} onto 3D table!`);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-600/30 active:scale-95"
                      >
                        <Plus size={14} />
                        <span>Place on Table</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* 3. Table Inventory Tab: View & Delete Placed Items */
          <div className="flex-1 flex flex-col p-6 overflow-hidden min-h-0 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Apparatus & Materials on 3D Table</h3>
                <p className="text-xs text-neutral-400">
                  Select and delete any item from the table or drag to reposition
                </p>
              </div>

              {customPlacedItems.length > 0 && (
                <button
                  onClick={() => {
                    onClearCustomItems();
                    labAudio.playGlassClink();
                    showToast('Cleared custom materials from table');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Remove Added Materials ({customPlacedItems.length})</span>
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
              {benchItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center font-mono text-[10px] text-neutral-400">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{item.name}</span>
                        <span className="text-[10px] font-mono text-emerald-400 px-1.5 py-0.2 rounded bg-neutral-800">
                          {item.type}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-neutral-400">
                        Position: [{item.pos.map((n) => n.toFixed(2)).join(', ')}]
                      </span>
                    </div>
                  </div>

                  {/* Remove Button for each item */}
                  <button
                    onClick={() => {
                      onRemoveBenchItem(item.id);
                      labAudio.playGlassClink();
                      showToast(`Removed ${item.name} from table`);
                    }}
                    title="Remove this item from the 3D table"
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 size={14} />
                    <span className="text-xs font-semibold">Remove</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Footer Status Toast */}
        {toastMessage && (
          <div className="px-6 py-2.5 bg-emerald-950/80 border-t border-emerald-500/40 text-emerald-200 text-xs font-mono flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle size={14} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
