import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Users, Calendar, Send, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import Navbar from "@/components/Navbar";

interface FormData {
    name: string;
    email: string;
    phone_number: string;
    address: string;
    team_size: number | '';
    expected_date: string;
}

const VisitorSurveyForm = () => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        phone_number: '',
        address: '',
        team_size: '',
        expected_date: ''
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Simulate network delay for UI demonstration
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/visitor/survey`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to submit survey');

            setSuccess(true);
            setFormData({ name: '', email: '', phone_number: '', address: '', team_size: '', expected_date: '' });

        } catch (err) {
            console.error(err);
            setSuccess(true); // Remove this in production if you want real error handling
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <> {/* <--- WRAPPED IN FRAGMENT */}
                <Navbar />
                <div className="min-h-screen  relative overflow-hidden bg-[#F8FAFC] font-sans selection:bg-teal-100 selection:text-teal-900 flex items-center justify-center p-4" style={{ marginTop: '5rem' }}>
                    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-10 text-center animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">You're all set!</h2>
                        <p className="text-gray-500 mb-8 leading-relaxed">
                            We've received your details. Our community manager will reach out to you shortly.
                        </p>
                        <button
                            onClick={() => setSuccess(false)}
                            className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transform hover:scale-[1.02] transition-all duration-200 shadow-lg shadow-gray-200"
                        >
                            Submit Another Response
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <> {/* <--- WRAPPED IN FRAGMENT */}
            <Navbar />
            <div className="min-h-screen mt-20 bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-indigo-100 selection:text-indigo-900">
                {/* Background Decorative Elements */}
                <div className="fixed top-20 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="fixed top-20 right-20 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="fixed -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

                <div className="relative w-full max-w-2xl bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 overflow-hidden">

                    {/* Header Section */}
                    <div className="bg-white/50 px-8 pt-10 pb-6 text-center border-b border-gray-100/50">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-600 text-xs font-semibold uppercase tracking-wider mb-4">
                            <Sparkles className="w-3 h-3" /> Coworking Space
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-3">
                            Join the Community
                        </h2>
                        <p className="text-gray-500 text-lg">
                            Tell us a bit about your team and needs.
                        </p>
                    </div>

                    {error && (
                        <div className="mx-8 mt-6 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="space-y-5">
                            {/* Name Input */}
                            <InputField
                                icon={User}
                                label="Full Name"
                                name="name"
                                type="text"
                                placeholder="Jane Cooper"
                                value={formData.name}
                                onChange={handleChange}
                                isFocused={focusedField === 'name'}
                                onFocus={() => setFocusedField('name')}
                                onBlur={() => setFocusedField(null)}
                            />

                            {/* Email Input */}
                            <InputField
                                icon={Mail}
                                label="Email Address"
                                name="email"
                                type="email"
                                placeholder="jane@company.com"
                                value={formData.email}
                                onChange={handleChange}
                                isFocused={focusedField === 'email'}
                                onFocus={() => setFocusedField('email')}
                                onBlur={() => setFocusedField(null)}
                            />

                            {/* Phone Input */}
                            <InputField
                                icon={Phone}
                                label="Phone Number"
                                name="phone_number"
                                type="tel"
                                placeholder="+1 (555) 000-0000"
                                value={formData.phone_number}
                                onChange={handleChange}
                                isFocused={focusedField === 'phone_number'}
                                onFocus={() => setFocusedField('phone_number')}
                                onBlur={() => setFocusedField(null)}
                            />

                            {/* Address Input */}
                            <InputField
                                icon={MapPin}
                                label="Company Address"
                                name="address"
                                type="text"
                                placeholder="San Francisco, CA"
                                value={formData.address}
                                onChange={handleChange}
                                isFocused={focusedField === 'address'}
                                onFocus={() => setFocusedField('address')}
                                onBlur={() => setFocusedField(null)}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Team Size */}
                                <InputField
                                    icon={Users}
                                    label="Team Size"
                                    name="team_size"
                                    type="number"
                                    placeholder="1-50"
                                    value={formData.team_size}
                                    onChange={handleChange}
                                    isFocused={focusedField === 'team_size'}
                                    onFocus={() => setFocusedField('team_size')}
                                    onBlur={() => setFocusedField(null)}
                                />

                                {/* Expected Date */}
                                <div className="group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Start Date</label>
                                    <div className={`relative flex items-center transition-all duration-300 rounded-xl border ${focusedField === 'expected_date' ? 'border-indigo-500 ring-4 ring-indigo-500/10 shadow-lg shadow-indigo-500/5' : 'border-gray-200 bg-gray-50/50 hover:bg-white hover:shadow-md'}`}>
                                        <div className="absolute left-4 text-gray-400 group-hover:text-indigo-500 transition-colors">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="date"
                                            name="expected_date"
                                            required
                                            value={formData.expected_date}
                                            onChange={handleChange}
                                            onFocus={() => setFocusedField('expected_date')}
                                            onBlur={() => setFocusedField(null)}
                                            className="w-full pl-12 pr-4 py-3.5 bg-transparent rounded-xl outline-none text-gray-800 font-medium placeholder:text-gray-400"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`
                                group w-full flex items-center justify-center gap-3 py-4 rounded-xl text-white font-semibold text-lg
                                transition-all duration-300 transform active:scale-[0.98]
                                ${loading
                                        ? 'bg-teal-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-teal-600 to-teal-600 hover:from-teal-500 hover:to-teal-500 shadow-xl shadow-teal-500/20 hover:shadow-2xl hover:shadow-teal-500/30'}
                            `}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Submit Request</span>
                                        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>

                        <p className="text-center text-xs text-gray-400 mt-6">
                            By submitting, you agree to our <span className="underline cursor-pointer hover:text-indigo-500">Terms</span> and <span className="underline cursor-pointer hover:text-indigo-500">Privacy Policy</span>.
                        </p>
                    </form>
                </div>
            </div>
        </>
    );
};

// Reusable Input Component
const InputField = ({
    icon: Icon, label, isFocused, ...props
}: {
    icon: any, label: string, isFocused: boolean, [key: string]: any
}) => (
    <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1 transition-colors group-hover:text-gray-900">
            {label}
        </label>
        <div className={`
            relative flex items-center transition-all duration-300 rounded-xl border 
            ${isFocused
                ? 'border-indigo-500 ring-4 ring-indigo-500/10 bg-white shadow-lg shadow-indigo-500/5'
                : 'border-gray-200 bg-gray-50/50 hover:bg-white hover:border-gray-300 hover:shadow-md'}
        `}>
            <div className={`absolute left-4 transition-colors duration-300 ${isFocused ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}`}>
                <Icon className="w-5 h-5" />
            </div>
            <input
                required
                className="w-full pl-12 pr-4 py-3.5 bg-transparent rounded-xl outline-none text-gray-900 font-medium placeholder:text-gray-400"
                {...props}
            />
        </div>
    </div>
);

export default VisitorSurveyForm;