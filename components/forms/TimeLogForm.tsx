
import React, { useState, useEffect } from 'react';
import Modal from '../Modal';

interface TimeLogFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (logData: { date: string, hours: number, description: string }) => void;
  initialHours?: number;
}

const TimeLogForm: React.FC<TimeLogFormProps> = ({ isOpen, onClose, onSave, initialHours }) => {
  const [date, setDate] = useState('');
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDate(new Date().toISOString().split('T')[0]);
      setHours(initialHours ? initialHours.toFixed(2) : '');
      setDescription('');
    }
  }, [isOpen, initialHours]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hoursNum = parseFloat(hours);
    if (isNaN(hoursNum) || hoursNum <= 0) {
      alert("Veuillez entrer un nombre d'heures valide.");
      return;
    }
    onSave({ date, hours: hoursNum, description });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enregistrer des heures">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-slate-300 mb-1">Date</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="block w-full rounded-md shadow-sm form-input text-slate-100"
              required
            />
          </div>
          <div>
            <label htmlFor="hours" className="block text-sm font-medium text-slate-300 mb-1">Heures</label>
            <input
              type="number"
              id="hours"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="block w-full rounded-md shadow-sm form-input text-slate-100"
              placeholder="ex: 2.5"
              step="0.01"
              min="0.01"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="block w-full rounded-md shadow-sm form-input text-slate-100"
              placeholder="Décrivez brièvement la tâche effectuée..."
              required
            />
          </div>
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-600 text-slate-200 hover:bg-slate-500 font-semibold transition-colors">
            Annuler
          </button>
          <button type="submit" className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold transition-colors shadow-lg shadow-green-600/20 hover:shadow-green-600/30">
            Enregistrer
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TimeLogForm;
