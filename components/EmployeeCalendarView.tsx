
import React, { useState } from 'react';
import { Project, User } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface EmployeeCalendarViewProps {
    currentUser: User;
    projects: Project[];
}

const EmployeeCalendarView: React.FC<EmployeeCalendarViewProps> = ({ currentUser, projects }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const myProjects = projects.filter(p => p.assignedEmployeeIds.includes(currentUser.id) && p.dueDate);

    const startDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

    const changeMonth = (offset: number) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

    return (
        <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-4xl tracking-wide text-white">Planning</h2>
                <div className="flex items-center space-x-4">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-full text-slate-400 hover:bg-slate-700/50"><ChevronLeftIcon className="w-5 h-5"/></button>
                    <h3 className="font-semibold text-xl text-white w-40 text-center">
                        {currentDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-full text-slate-400 hover:bg-slate-700/50"><ChevronRightIcon className="w-5 h-5"/></button>
                </div>
            </div>

            <div className="bg-slate-900/40 rounded-2xl border border-white/10 grid grid-cols-7">
                {days.map(day => (
                    <div key={day} className="text-center font-bold text-xs text-slate-400 py-3 border-b border-r border-slate-800">{day}</div>
                ))}
                
                {Array.from({ length: startDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="border-r border-b border-slate-800 min-h-[120px]"></div>
                ))}

                {Array.from({ length: daysInMonth }).map((_, day) => {
                    const dayNumber = day + 1;
                    const today = new Date();
                    const isToday = today.getDate() === dayNumber && today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear();
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);

                    const projectsDue = myProjects.filter(p => {
                        if (!p.dueDate) return false;
                        const dueDate = new Date(p.dueDate);
                        return dueDate.toISOString().slice(0,10) === date.toISOString().slice(0,10);
                    });

                    return (
                        <div key={dayNumber} className="border-r border-b border-slate-800 p-2 min-h-[120px] flex flex-col">
                            <span className={`font-semibold text-sm ${isToday ? 'bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center' : 'text-slate-300'}`}>
                                {dayNumber}
                            </span>
                            <div className="mt-1 space-y-1 overflow-y-auto">
                                {projectsDue.map(p => (
                                    <div key={p.id} className="text-xs bg-blue-500/20 text-blue-300 p-1 rounded">
                                        {p.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default EmployeeCalendarView;
