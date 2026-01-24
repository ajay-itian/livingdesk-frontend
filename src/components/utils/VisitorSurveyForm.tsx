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
    email: string;
    phone_number: string;
    address: string;
    team_size: number;
    expected_date: string;
    budget: number;
    created_at: string;
}

const VisitorSurveyForm = () => {
    // --- Helper to get Today's Date in YYYY-MM-DD ---
    const getTodayString = () => {
        return new Date().toISOString().split('T')[0];
    };

    // --- State ---
    const [view, setView] = useState<'form' | 'admin'>('form');

    // Updated Initial State
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        phone_number: '',
        address: '',
        team_size: 1,            // Default to 1
        expected_date: getTodayString(), // Default to Today
        budget: ''
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [focusedField, setFocusedField] = useState<string | null>(null);

    // Admin State
    const [visitors, setVisitors] = useState<VisitorResponse[]>([]);
    const [loadingAdmin, setLoadingAdmin] = useState(false);

    // --- Handlers ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // --- VALIDATION: Only Name and Phone are strictly required ---
        if (!formData.name.trim() || !formData.phone_number.trim()) {
            setError("Name and Phone Number are required.");
            setLoading(false);
            return;
        }

        // --- PREPARE PAYLOAD ---
        const cleanPhone = formData.phone_number.replace(/\D/g, '') || 'unknown';
        const dummyEmail = `no-email-${cleanPhone}@placeholder.com`;

        const payload = {
            name: formData.name,
            phone_number: formData.phone_number,

            // Email: Use input or dummy
            email: formData.email && formData.email.trim() !== ''
                ? formData.email
                : dummyEmail,

            // Address: Send empty string if not provided
            address: formData.address || "",

            // Team Size: Default to 1 if empty/zero
            team_size: !formData.team_size ? 1 : Number(formData.team_size),

            // Date: Default to today if empty
            expected_date: formData.expected_date || getTodayString(),

            // --- FIX IS HERE ---
            // Backend Constraints: Required, Integer, Greater than 0.
            // Logic: If user provides a valid budget > 0, send it.
            //        Otherwise, send '1' as a placeholder to pass validation.
            //        (We will hide '1' in the Admin View).
            budget: (formData.budget && Number(formData.budget) > 0)
                ? Number(formData.budget)
                : 1
        };

        try {
            await apiClient.post('/visitor/survey', payload);
            setSuccess(true);
            setFormData({
                name: '',
                email: '',
                phone_number: '',
                address: '',
                team_size: 1,
                expected_date: getTodayString(),
                budget: ''
            });
        } catch (err: any) {
            console.error("Survey Error Full Details:", JSON.stringify(err.response?.data || err, null, 2));

            let errorMessage = 'Failed to submit survey.';

            if (err.response?.data?.detail) {
                const detail = err.response.data.detail;
                if (Array.isArray(detail)) {
                    errorMessage = detail.map((item: any) => `${item.loc?.[1] || 'Field'}: ${item.msg}`).join(' | ');
                } else if (typeof detail === 'object') {
                    errorMessage = detail.msg || JSON.stringify(detail);
                } else {
                    errorMessage = String(detail);
                }
            } else if (err.message) {
                errorMessage = err.message;
            }

            setError(errorMessage);
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

    useEffect(() => {
        if (view === 'admin') {
            fetchVisitors();
        }
    }, [view]);

    // --- Renders ---
    if (success) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen relative overflow-hidden bg-[#F8FAFC] font-sans flex items-center justify-center p-4 mt-20">
                    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 text-center animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">You're all set!</h2>
                        <p className="text-gray-500 mb-8">We've received your details. Our community manager will reach out shortly.</p>
                        <button
                            onClick={() => setSuccess(false)}
                            className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all shadow-lg"
                        >
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
                {/* Background Decor */}
                <div className="fixed top-20 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="fixed top-20 right-20 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

                {/* --- Admin / Form Toggle --- */}
                <div className="absolute top-24 right-8 z-50">
                    <button
                        onClick={() => setView(view === 'form' ? 'admin' : 'form')}
                        className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur border border-gray-200 rounded-full text-sm font-semibold text-gray-700 hover:bg-white hover:shadow-md transition-all"
                    >
                        {view === 'form' ? (
                            <>
                                <LayoutDashboard className="w-4 h-4" /> Admin View
                            </>
                        ) : (
                            <>
                                <ArrowLeft className="w-4 h-4" /> Back to Form
                            </>
                        )}
                    </button>
                </div>

                {/* --- Main Content Container --- */}
                <div className="flex items-center justify-center min-h-[80vh]">

                    {view === 'form' ? (
                        // === FORM VIEW ===
                        <div className="relative w-full max-w-2xl bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                            <div className="bg-white/50 px-8 pt-10 pb-6 text-center border-b border-gray-100/50">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-600 text-xs font-semibold uppercase tracking-wider mb-4">
                                    <Sparkles className="w-3 h-3" /> Coworking Space
                                </div>
                                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-3">Join the Community</h2>
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
                                    {/* Name - REQUIRED */}
                                    <InputField
                                        icon={User}
                                        label="Full Name"
                                        name="name"
                                        type="text"
                                        placeholder="Jane Cooper"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        isFocused={focusedField === 'name'}
                                        onFocus={() => setFocusedField('name')}
                                        onBlur={() => setFocusedField(null)}
                                    />

                                    {/* Email - OPTIONAL */}
                                    <InputField
                                        icon={Mail}
                                        label="Email Address (Optional)"
                                        name="email"
                                        type="email"
                                        placeholder="jane@company.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        isFocused={focusedField === 'email'}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                    />

                                    {/* Phone - REQUIRED */}
                                    <div className="group">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1 group-hover:text-gray-900 transition-colors">Phone Number</label>
                                        <div className={`relative flex items-center transition-all duration-300 rounded-xl border ${focusedField === 'phone_number' ? 'border-indigo-500 ring-4 ring-indigo-500/10 bg-white shadow-lg shadow-indigo-500/5' : 'border-gray-200 bg-gray-50/50 hover:bg-white hover:border-gray-300 hover:shadow-md'}`}>
                                            <div className={`absolute left-4 flex items-center gap-2 transition-colors duration-300 ${focusedField === 'phone_number' ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}`}>
                                                <Phone className="w-5 h-5" />
                                                <span className="text-gray-500 font-semibold border-l border-gray-300 pl-2 text-sm">+91</span>
                                            </div>
                                            <input
                                                className="w-full pl-24 pr-4 py-3.5 bg-transparent rounded-xl outline-none text-gray-900 font-medium placeholder:text-gray-400"
                                                name="phone_number"
                                                type="tel"
                                                placeholder="98765 43210"
                                                value={formData.phone_number}
                                                onChange={handleChange}
                                                required
                                                onFocus={() => setFocusedField('phone_number')}
                                                onBlur={() => setFocusedField(null)}
                                            />
                                        </div>
                                    </div>

                                    {/* Company Notes - OPTIONAL */}
                                    <InputField
                                        icon={NotebookIcon}
                                        label="Company Notes (Optional)"
                                        name="address"
                                        type="text"
                                        placeholder="Enter your company notes"
                                        value={formData.address}
                                        onChange={handleChange}
                                        // Removed required
                                        isFocused={focusedField === 'address'}
                                        onFocus={() => setFocusedField('address')}
                                        onBlur={() => setFocusedField(null)}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {/* Team Size - OPTIONAL */}
                                        <InputField
                                            icon={Users}
                                            label="Team Size (Optional)"
                                            name="team_size"
                                            type="number"
                                            placeholder="1"
                                            min="1"
                                            value={formData.team_size}
                                            onChange={handleChange}
                                            // Removed required
                                            isFocused={focusedField === 'team_size'}
                                            onFocus={() => setFocusedField('team_size')}
                                            onBlur={() => setFocusedField(null)}
                                        />

                                        {/* Start Date - OPTIONAL */}
                                        <div className="group">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Start Date <span className="text-gray-400 font-normal text-xs ml-1">(Optional)</span></label>
                                            <div className={`relative flex items-center transition-all duration-300 rounded-xl border ${focusedField === 'expected_date' ? 'border-indigo-500 ring-4 ring-indigo-500/10 shadow-lg shadow-indigo-500/5' : 'border-gray-200 bg-gray-50/50 hover:bg-white hover:shadow-md'}`}>
                                                <div className="absolute left-4 text-gray-400 group-hover:text-indigo-500 transition-colors">
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                                <input
                                                    type="date"
                                                    name="expected_date"
                                                    // Removed required
                                                    min={getTodayString()}
                                                    value={formData.expected_date}
                                                    onChange={handleChange}
                                                    onFocus={() => setFocusedField('expected_date')}
                                                    onBlur={() => setFocusedField(null)}
                                                    className="w-full pl-12 pr-4 py-3.5 bg-transparent rounded-xl outline-none text-gray-800 font-medium placeholder:text-gray-400"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Budget Input - OPTIONAL */}
                                    <div className="group">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">
                                            Budget <span className="text-gray-400 font-normal text-xs ml-1">(Optional)</span>
                                        </label>
                                        <div className={`relative flex items-center transition-all duration-300 rounded-xl border ${focusedField === 'budget' ? 'border-indigo-500 ring-4 ring-indigo-500/10 shadow-lg shadow-indigo-500/5' : 'border-gray-200 bg-gray-50/50 hover:bg-white hover:shadow-md'}`}>
                                            <div className={`absolute left-4 transition-colors duration-300 ${focusedField === 'budget' ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}`}>
                                                <IndianRupee className="w-5 h-5" />
                                            </div>
                                            <input
                                                type="number"
                                                name="budget"
                                                value={formData.budget}
                                                onChange={handleChange}
                                                placeholder="10000"
                                                min="0"
                                                onFocus={() => setFocusedField('budget')}
                                                onBlur={() => setFocusedField(null)}
                                                className="w-full pl-12 pr-4 py-3.5 bg-transparent rounded-xl outline-none text-gray-800 font-medium placeholder:text-gray-400"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button type="button" onClick={handleSubmit} disabled={loading} className={`group w-full flex items-center justify-center gap-3 py-4 rounded-xl text-white font-semibold text-lg transition-all duration-300 transform active:scale-[0.98] ${loading ? 'bg-teal-400 cursor-not-allowed' : 'bg-gradient-to-r from-teal-600 to-teal-600 hover:from-teal-500 hover:to-teal-500 shadow-xl shadow-teal-500/20'}`}>
                                        {loading ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Processing...</span></> : <><Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" /><span>Submit Request</span></>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // === ADMIN VIEW ===
                        <div className="w-full max-w-7xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-right-4">
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
                                <table className="w-full text-left text-sm text-gray-600">
                                    <thead className="bg-gray-50/50 text-xs uppercase font-semibold text-gray-500">
                                        <tr>
                                            <th className="px-6 py-4">Name & Email</th>
                                            <th className="px-6 py-4">Contact</th>
                                            <th className="px-6 py-4">Details</th>
                                            <th className="px-6 py-4">Budget</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Notes</th>
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
                                                    <div className="text-xs text-gray-400">{v.email || 'No Email'}</div>
                                                </td>
                                                {/* --- Updated Contact Column with Call Button --- */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-mono text-xs text-gray-700">{v.phone_number}</span>
                                                        <a
                                                            href={`tel:${v.phone_number}`}
                                                            className="flex items-center justify-center w-8 h-8 bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-500 hover:text-white hover:scale-110 transition-all shadow-sm border border-emerald-100"
                                                            title="Call Now"
                                                        >
                                                            <Phone className="w-3.5 h-3.5" />
                                                        </a>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-xs font-medium">{v.team_size} Seats</span>
                                                    </div>
                                                </td>

                                                {/* --- ADMIN BUDGET VIEW FIX --- */}
                                                {/* We check if budget > 1 because we are sending 1 as the dummy value for "Empty" */}
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    {v.budget && v.budget > 1
                                                        ? `₹${Number(v.budget).toLocaleString()}`
                                                        : <span className="text-gray-400 italic">-</span>}
                                                </td>

                                                <td className="px-6 py-4 text-xs">
                                                    <div>Start: {v.expected_date}</div>
                                                    <div className="text-gray-400 mt-1">Submitted: {new Date(v.created_at).toLocaleDateString()}</div>
                                                </td>
                                                <td className="px-6 py-4 max-w-xs truncate" title={v.address}>
                                                    {v.address}
                                                </td>
                                            </tr>
                                        ))}
                                        {!loadingAdmin && visitors.length === 0 && (
                                            <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No inquiries found.</td></tr>
                                        )}
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

// Helper Input Component
const InputField = ({ icon: Icon, label, isFocused, ...props }: any) => (
    <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1 group-hover:text-gray-900 transition-colors">{label}</label>
        <div className={`relative flex items-center transition-all duration-300 rounded-xl border ${isFocused ? 'border-indigo-500 ring-4 ring-indigo-500/10 bg-white shadow-lg shadow-indigo-500/5' : 'border-gray-200 bg-gray-50/50 hover:bg-white hover:border-gray-300 hover:shadow-md'}`}>
            <div className={`absolute left-4 transition-colors duration-300 ${isFocused ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}`}>
                <Icon className="w-5 h-5" />
            </div>
            <input className="w-full pl-12 pr-4 py-3.5 bg-transparent rounded-xl outline-none text-gray-900 font-medium placeholder:text-gray-400" {...props} />
        </div>
    </div>
);

export default VisitorSurveyForm;