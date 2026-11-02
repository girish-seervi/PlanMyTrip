import React, { useState, useEffect } from 'react';
import { X, Clock, DollarSign, Tag, FileText, Check } from 'lucide-react';

export default function EditActivityModal({ isOpen, onClose, activity, dayNumber, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    time: '',
    slot: 'morning',
    category: 'Sightseeing',
    estimatedCost: 0,
    description: ''
  });

  useEffect(() => {
    if (activity) {
      setFormData({
        name: activity.name || '',
        time: activity.time || '09:00 AM',
        slot: activity.slot || 'morning',
        category: activity.category || 'Sightseeing',
        estimatedCost: activity.estimatedCost || 0,
        description: activity.description || ''
      });
    }
  }, [activity]);

  if (!isOpen || !activity) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(dayNumber, activity.id, {
      ...formData,
      estimatedCost: Number(formData.estimatedCost) || 0
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-elevated border border-charcoal-border">
        <div className="flex items-center justify-between pb-4 border-b border-charcoal-border/60">
          <div>
            <h3 className="text-lg font-bold text-charcoal">Edit Attraction Details</h3>
            <p className="text-xs text-charcoal-muted">Day {dayNumber} · Modifying activity</p>
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
            <label className="block text-xs font-bold text-charcoal mb-1">Attraction Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-border focus:border-forest focus:ring-1 focus:ring-forest text-sm bg-offwhite/50"
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
                placeholder="e.g. 10:00 AM"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-border focus:border-forest text-sm bg-offwhite/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1">Day Segment</label>
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
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-border focus:border-forest text-sm bg-offwhite/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-forest" />
                <span>Entry / Activity Fee</span>
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
              <span>Activity Description & Tips</span>
            </label>
            <textarea
              rows={3}
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
              <Check className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
