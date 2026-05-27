"use client";

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Users, Calendar, Send, CheckCircle2, Loader2, Sparkles, IndianRupee, NotebookIcon, LayoutDashboard, ArrowLeft } from 'lucide-react';
import Navbar from "@/components/Navbar";
import { apiClient } from "@/lib/api";

// --- Types ---
interface FormData {
    name: string;
    email: string;
    phone_number: string;
    address: string;
    team_size: number | '';
    expected_date: string;
    budget: number | '';
}

interface VisitorResponse {
    survey_id: string;
    name: string;
    email?: string | null;         // ← optional: old records may not have it
    phone_number: string;
    address?: string | null;
    team_size: number;
    expected_date: string;
    budget: number;
    created_at: string;
}

const VisitorSurveyForm = () => {
    const getTodayString = () => {
        return new Date().toISOString().split('T')[0];
    };

    const [view, setView] = useState<'form' | 'admin'>('form');
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        phone_number: '',
        address: '',
        team_size: 1,
        expected_date: getTodayString(),
        budget: ''
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const [visitors, setVisitors] = useState<VisitorResponse[]>([]);
    const [loadingAdmin, setLoadingAdmin] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.name.trim() || !formData.phone_number.trim()) {
            setError("Name and Phone Number are required.");
            setLoading(false);
            return;
        }

        const cleanPhone = formData.phone_number.replace(/\D/g, '') || 'unknown';
        const dummyEmail = `no-email-${cleanPhone}@placeholder.com`;

        const payload = {
            name: formData.name,
            phone_number: formData.phone_number,
            email: formData.email && formData.email.trim() !== '' ? formData.email : dummyEmail,
            address: formData.address || "",
            team_size: !formData.team_size ? 1 : Number(formData.team_size),
            expected_date: formData.expected_date || getTodayString(),
            budget: (formData.budget && Number(formData.budget) > 0) ? Number(formData.budget) : 1
        };

        try {
            await apiClient.post('/visitor/survey', payload);
            setSuccess(true);
            setFormData({
                name: '', email: '', phone_number: '', address: '',
                team_size: 1, expected_date: getTodayString(), budget: ''
            });
        } catch (err: any) {
            console.error("Survey Error:", err);
            setError(err.response?.data?.detail || 'Failed to submit survey.');
        } finally {
            setLoading(false);
        }
    };

    const fetchVisitors = async () => {
        setLoadingAdmin(true);
        try {
            const data = await apiClient.get<VisitorResponse[]>('/visitor/all');
            setVisitors(data);
        } catch (err) {
            console.error("Fetch Error", err);
        } finally {
            setLoadingAdmin(false);
        }
    };

    // Helper: show email or a readable fallback
    const displayEmail = (email?: string | null) => {
        if (!email) return null;
        if (email.startsWith('no-email-') && email.endsWith('@placeholder.com')) return null;
        return email;
    };

    useEffect(() => {
        if (view === 'admin') {
            fetchVisitors();
        }
    }, [view]);

    if (success) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen relative overflow-hidden bg-[#F8FAFC] flex items-center justify-center p-4 mt-20">
                    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 text-center animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">You're all set!</h2>
                        <p className="text-gray-500 mb-8">We've received your details. Our community manager will reach out shortly.</p>
                        <button onClick={() => setSuccess(false)} className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all shadow-lg">
                            Submit Another Response
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen mt-20 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 sm:p-6 lg:p-8 font-sans">
                {/* Admin / Form Toggle */}
                <div className="absolute top-24 right-8 z-50">
                    <button
                        onClick={() => setView(view === 'form' ? 'admin' : 'form')}
                        className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur border border-gray-200 rounded-full text-sm font-semibold text-gray-700 hover:bg-white hover:shadow-md transition-all"
                    >
                        {view === 'form'
                            ? <><LayoutDashboard className="w-4 h-4" /> Admin View</>
                            : <><ArrowLeft className="w-4 h-4" /> Back to Form</>}
                    </button>
                </div>

                <div className="flex items-center justify-center min-h-[80vh]">
                    {view === 'form' ? (
                        /* === FORM VIEW === */
                        <div className="relative w-full max-w-2xl bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                            <div className="bg-white/50 px-8 pt-10 pb-6 text-center border-b border-gray-100/50">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-600 text-xs font-semibold uppercase tracking-wider mb-4">
                                    <Sparkles className="w-3 h-3" /> Coworking Space
                                </div>
                                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Join the Community</h2>
                                <p className="text-gray-500 text-lg">Tell us a bit about your team and needs.</p>
                            </div>

                            {error && (
                                <div className="mx-8 mt-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                    {error}
                                </div>
                            )}

                            <div className="p-8 space-y-6">
                                <div className="space-y-5">
                                    <InputField icon={User} label="Full Name" name="name" type="text" placeholder="Jane Cooper" value={formData.name} onChange={handleChange} required isFocused={focusedField === 'name'} onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)} />
                                    <InputField icon={Mail} label="Email Address (Optional)" name="email" type="email" placeholder="jane@company.com" value={formData.email} onChange={handleChange} isFocused={focusedField === 'email'} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} />

                                    <div className="group">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Phone Number</label>
                                        <div className={`relative flex items-center transition-all duration-300 rounded-xl border ${focusedField === 'phone_number' ? 'border-indigo-500 ring-4 ring-indigo-500/10 bg-white' : 'border-gray-200 bg-gray-50/50'}`}>
                                            <div className="absolute left-4 flex items-center gap-2 text-gray-400">
                                                <Phone className="w-5 h-5" />
                                                <span className="text-gray-500 font-semibold border-l border-gray-300 pl-2 text-sm">+91</span>
                                            </div>
                                            <input className="w-full pl-24 pr-4 py-3.5 bg-transparent rounded-xl outline-none text-gray-900 font-medium" name="phone_number" type="tel" placeholder="98765 43210" value={formData.phone_number} onChange={handleChange} required onFocus={() => setFocusedField('phone_number')} onBlur={() => setFocusedField(null)} />
                                        </div>
                                    </div>

                                    <InputField icon={NotebookIcon} label="Notes (Optional)" name="address" type="text" placeholder="Enter any specific requirements" value={formData.address} onChange={handleChange} isFocused={focusedField === 'address'} onFocus={() => setFocusedField('address')} onBlur={() => setFocusedField(null)} />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <InputField icon={Users} label="Team Size" name="team_size" type="number" placeholder="1" min="1" value={formData.team_size} onChange={handleChange} isFocused={focusedField === 'team_size'} onFocus={() => setFocusedField('team_size')} onBlur={() => setFocusedField(null)} />
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Start Date</label>
                                            <div className={`relative flex items-center transition-all duration-300 rounded-xl border ${focusedField === 'expected_date' ? 'border-indigo-500 ring-4 ring-indigo-500/10' : 'border-gray-200 bg-gray-50/50'}`}>
                                                <div className="absolute left-4 text-gray-400"><Calendar className="w-5 h-5" /></div>
                                                <input type="date" name="expected_date" min={getTodayString()} value={formData.expected_date} onChange={handleChange} onFocus={() => setFocusedField('expected_date')} onBlur={() => setFocusedField(null)} className="w-full pl-12 pr-4 py-3.5 bg-transparent rounded-xl outline-none text-gray-800 font-medium" />
                                            </div>
                                        </div>
                                    </div>

                                    <InputField icon={IndianRupee} label="Budget (Optional)" name="budget" type="number" placeholder="10000" min="0" value={formData.budget} onChange={handleChange} isFocused={focusedField === 'budget'} onFocus={() => setFocusedField('budget')} onBlur={() => setFocusedField(null)} />
                                </div>

                                <button type="button" onClick={handleSubmit} disabled={loading} className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl text-white font-semibold text-lg transition-all ${loading ? 'bg-teal-400' : 'bg-teal-600 hover:bg-teal-500 shadow-xl'}`}>
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                    {loading ? 'Processing...' : 'Submit Request'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* === ADMIN VIEW === */
                        <div className="w-full max-w-7xl bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white/50">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Visitor Inquiries</h2>
                                    <p className="text-gray-500 text-sm mt-1">Total Requests: {visitors.length}</p>
                                </div>
                                <button onClick={fetchVisitors} className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Refresh">
                                    <Loader2 className={`w-5 h-5 text-gray-600 ${loadingAdmin ? 'animate-spin' : ''}`} />
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                                        <tr>
                                            <th className="px-6 py-4">Visitor</th>
                                            <th className="px-6 py-4">Contact</th>
                                            <th className="px-6 py-4">Details</th>
                                            <th className="px-6 py-4">Budget</th>
                                            <th className="px-6 py-4">Timeline</th>
                                            <th className="px-6 py-4 min-w-[200px]">Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {loadingAdmin && visitors.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center">
                                                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-2" />
                                                    <p>Loading records...</p>
                                                </td>
                                            </tr>
                                        ) : visitors.map((v) => (
                                            <tr key={v.survey_id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-gray-900">{v.name}</div>
                                                    {/* Only show email if it's a real one, not the placeholder */}
                                                    {displayEmail(v.email)
                                                        ? <div className="text-xs text-gray-400">{displayEmail(v.email)}</div>
                                                        : <div className="text-xs text-gray-300 italic">No email</div>
                                                    }
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-mono text-xs text-gray-700">{v.phone_number}</span>
                                                        <a href={`tel:${v.phone_number}`} className="flex items-center justify-center w-7 h-7 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                                                            <Phone className="w-3.5 h-3.5" />
                                                        </a>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-medium">{v.team_size} Seats</span>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    {v.budget > 1
                                                        ? `₹${Number(v.budget).toLocaleString()}`
                                                        : <span className="text-gray-300 italic">-</span>
                                                    }
                                                </td>
                                                <td className="px-6 py-4 text-xs">
                                                    <div className="text-gray-700">Start: {v.expected_date}</div>
                                                    <div className="text-gray-400 mt-1">Ref: {new Date(v.created_at).toLocaleDateString()}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div
                                                        className="text-xs text-gray-600 whitespace-normal break-words max-w-[250px] line-clamp-2 hover:line-clamp-none transition-all duration-200 cursor-help"
                                                        title={v.address ?? ''}
                                                    >
                                                        {v.address
                                                            ? v.address
                                                            : <span className="text-gray-300 italic text-[10px]">No notes provided</span>
                                                        }
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

const InputField = ({ icon: Icon, label, isFocused, ...props }: any) => (
    <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">{label}</label>
        <div className={`relative flex items-center transition-all duration-300 rounded-xl border ${isFocused ? 'border-indigo-500 ring-4 ring-indigo-500/10 bg-white shadow-sm' : 'border-gray-200 bg-gray-50/50 hover:bg-white'}`}>
            <div className={`absolute left-4 transition-colors ${isFocused ? 'text-indigo-500' : 'text-gray-400'}`}>
                <Icon className="w-5 h-5" />
            </div>
            <input className="w-full pl-12 pr-4 py-3.5 bg-transparent rounded-xl outline-none text-gray-900 font-medium placeholder:text-gray-400" {...props} />
        </div>
    </div>
);

export default VisitorSurveyForm;