import React, { useState } from 'react';
import { X, Plus, Clock, Tag, DollarSign, FileText } from 'lucide-react';

export default function AddActivityModal({ isOpen, onClose, dayNumber, onAdd }) {
  const [formData, setFormData] = useState({
    name: '',
    time: '03:00 PM',
    slot: 'afternoon',
    category: 'Sightseeing',
    estimatedCost: 100,
    description: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(dayNumber, {
      ...formData,
      estimatedCost: Number(formData.estimatedCost) || 0
    });
    setFormData({
      name: '',
      time: '03:00 PM',
      slot: 'afternoon',
      category: 'Sightseeing',
      estimatedCost: 100,
      description: ''
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-elevated border border-charcoal-border">
        <div className="flex items-center justify-between pb-4 border-b border-charcoal-border/60">
          <div>
            <h3 className="text-lg font-bold text-charcoal">Add Custom Attraction</h3>
            <p className="text-xs text-charcoal-muted">Adding place to Day {dayNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-charcoal-muted hover:text-charcoal hover:bg-offwhite transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-charcoal mb-1">Place / Attraction Name</label>
            <input
              type="text"
              placeholder="e.g. Nahargarh Biological Park"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-border focus:border-forest text-sm bg-offwhite/50"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-forest" />
                <span>Visiting Time</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 04:30 PM"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-border focus:border-forest text-sm bg-offwhite/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">Time Slot</label>
              <select
                value={formData.slot}
                onChange={(e) => setFormData({ ...formData, slot: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-border focus:border-forest text-sm bg-offwhite/50"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-charcoal mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-forest" />
                <span>Category</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Scenic Viewpoint"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-border focus:border-forest text-sm bg-offwhite/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-forest" />
                <span>Estimated Cost</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.estimatedCost}
                onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-border focus:border-forest text-sm bg-offwhite/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-forest" />
              <span>Notes & Activity Highlights</span>
            </label>
            <textarea
              rows={3}
              placeholder="What makes this place special..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-border focus:border-forest text-sm bg-offwhite/50"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-charcoal-border/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-charcoal-border text-xs font-bold text-charcoal hover:bg-offwhite transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-forest text-offwhite text-xs font-bold hover:bg-forest-hover shadow-soft transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Day {dayNumber}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
