
import React, { useState } from 'react';
import { Users, UserPlus, FileText, Calendar, Clock, ShieldCheck, Search, Briefcase } from 'lucide-react';
import { wimMasterData } from '../../services/wimMasterData';

export const HRDashboard: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    
    // Use master data or mock data
    const staffList = wimMasterData.hr_management?.staff_count ? [
        { id: 'S-001', name: 'Ahmet Yılmaz', role: 'Security Chief', status: 'ON_DUTY', shift: '08:00-16:00', location: 'Gate A' },
        { id: 'S-002', name: 'Murat Kaya', role: 'Security Officer', status: 'ON_DUTY', shift: '08:00-16:00', location: 'Patrol' },
        { id: 'P-001', name: 'Hasan Vural', role: 'Palamar (Linesman)', status: 'ON_DUTY', shift: '08:00-16:00', location: 'Pontoon C' },
        { id: 'P-002', name: 'Ismail Çetin', role: 'Palamar (Linesman)', status: 'OFF_DUTY', shift: '16:00-24:00', location: 'Home' },
        { id: 'A-001', name: 'Zeynep Aydın', role: 'Front Desk', status: 'ON_DUTY', shift: '09:00-18:00', location: 'Office' },
    ] : [];

    const filteredStaff = staffList.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.role.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="h-full flex flex-col bg-zinc-50 dark:bg-[#020617] animate-in fade-in duration-500 p-6 space-y-6 overflow-y-auto">
            
            {/* HR Header */}
            <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-zinc-800 dark:text-zinc-100 flex items-center gap-3">
                        <Users className="text-indigo-500" /> Human Resources
                    </h2>
                    <p className="text-sm text-zinc-500 mt-1">Personnel Management & Shift Rosters</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-indigo-500/20">
                        <UserPlus size={14} /> Add Staff
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border border-zinc-200 dark:border-zinc-700">
                        <FileText size={14} /> Payroll
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Total Staff</div>
                    <div className="text-3xl font-black text-zinc-800 dark:text-zinc-100">{staffList.length}</div>
                    <div className="text-xs text-emerald-500 font-bold mt-2 flex items-center gap-1"><ShieldCheck size={12}/> 100% Compliant</div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">On Duty Now</div>
                    <div className="text-3xl font-black text-indigo-500">{staffList.filter(s => s.status === 'ON_DUTY').length}</div>
                    <div className="text-xs text-zinc-500 mt-2">Shift A (08:00 - 16:00)</div>
                </div>
                <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Pending Leave</div>
                    <div className="text-3xl font-black text-amber-500">2</div>
                    <div className="text-xs text-zinc-500 mt-2">Requests awaiting approval</div>
                </div>
            </div>

            {/* Staff List */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col flex-1">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                    <h3 className="font-bold text-zinc-700 dark:text-zinc-300">Staff Directory</h3>
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-2.5 text-zinc-400"/>
                        <input 
                            type="text" 
                            placeholder="Search personnel..." 
                            className="pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 uppercase text-[10px] font-bold">
                            <tr>
                                <th className="px-6 py-3">Employee</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Shift</th>
                                <th className="px-6 py-3">Location</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {filteredStaff.map((staff) => (
                                <tr key={staff.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                    <td className="px-6 py-4 font-bold text-zinc-800 dark:text-zinc-200">
                                        {staff.name}
                                        <div className="text-[10px] text-zinc-400 font-normal">{staff.id}</div>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                                        <Briefcase size={12}/> {staff.role}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                            staff.status === 'ON_DUTY' 
                                            ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' 
                                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700'
                                        }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${staff.status === 'ON_DUTY' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'}`}></div>
                                            {staff.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400 font-mono text-xs">
                                        <Clock size={12} className="inline mr-1"/> {staff.shift}
                                    </td>
                                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                                        {staff.location}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs font-bold">Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
