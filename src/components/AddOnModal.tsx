// src/components/AddOnModal.tsx
"use client";

import React, { useState } from "react";
import { X, Layers, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface AddOn {
  id: string;
  name: string;
  type: string;
  dimensions: string;
}

interface AddOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (addOn: AddOn) => void;
}

export default function AddOnModal({ isOpen, onClose, onAdd }: AddOnModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("Structural");
  const [dimensions, setDimensions] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newAddOn: AddOn = {
      id: Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      type: type,
      dimensions: dimensions.trim() || "Standard",
    };

    onAdd(newAddOn);
    // Reset form
    setName("");
    setType("Structural");
    setDimensions("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.94, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 20 }}
            className="bg-[#111113] border border-neutral-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/40">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#C5A880]/10 border border-[#C5A880]/30 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-[#C5A880]" />
                </div>
                <div>
                  <h2 className="text-xs font-black text-neutral-100 uppercase tracking-[0.2em]">Add Feature</h2>
                  <p className="text-[9px] text-neutral-500 uppercase tracking-wider mt-0.5">Define New Spec Option</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[8px] font-bold tracking-[0.2em] text-neutral-500 uppercase">
                  Feature Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Double Height Ceilings"
                  className="w-full px-3 py-2.5 bg-black/60 border border-neutral-800 focus:border-[#C5A880]/50 rounded-lg text-xs text-neutral-200 outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-bold tracking-[0.2em] text-neutral-500 uppercase">
                  Feature Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2.5 bg-black/60 border border-neutral-800 focus:border-[#C5A880]/50 rounded-lg text-xs text-neutral-200 outline-none transition-all"
                >
                  <option value="Structural">Structural</option>
                  <option value="Eco-friendly">Eco-friendly</option>
                  <option value="Security">Security</option>
                  <option value="Interior Upgrade">Interior Upgrade</option>
                  <option value="Exterior Accents">Exterior Accents</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-bold tracking-[0.2em] text-neutral-500 uppercase">
                  Dimensions / Scope
                </label>
                <input
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  placeholder="e.g. 24' x 16' or Standard Pack"
                  className="w-full px-3 py-2.5 bg-black/60 border border-neutral-800 focus:border-[#C5A880]/50 rounded-lg text-xs text-neutral-200 outline-none transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-950 font-sans font-black text-[9px] tracking-[0.2em] rounded-lg flex items-center justify-center gap-1.5 transition-all uppercase"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Feature Option
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
