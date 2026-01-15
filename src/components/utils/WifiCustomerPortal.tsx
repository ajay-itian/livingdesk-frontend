import React, { useState, useRef } from 'react';
import {
    Wifi,
    User,
    Smartphone,
    CheckCircle2,
    Loader2,
    Copy,
    Router,
    KeyRound,
    Network,
    ArrowRight,
    ShieldCheck,
    Sparkles,
    Zap
} from 'lucide-react';
import QRCode from 'react-qr-code';
import axios from 'axios';
import Navbar from "@/components/Navbar";

// Ensure this matches your FastAPI address
const API_URL = "http://localhost:8000/api/wifi";

const WifiCustomerPortal = () => {
    const [step, setStep] = useState(1);
    const [network, setNetwork] = useState('Airtel');
    const [guestName, setGuestName] = useState('');
    const [mobile, setMobile] = useState('');
    const [wifiData, setWifiData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    // UI State for the connect button feedback
    const [connectStatus, setConnectStatus] = useState<'idle' | 'copied'>('idle');

    const cardRef = useRef(null);
    const currentUrl = typeof window !== 'undefined' ? window.location.href : 'http://localhost:3000';

    const handleLogin = async () => {
        if (mobile.length < 10) return;
        setLoading(true);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            const res = await axios.post(`${API_URL}/guest/connect`, {
                guest_name: guestName,
                mobile_number: mobile,
                network_name: network
            });

            if (res.data && res.data.wifi_details) {
                setWifiData(res.data.wifi_details);
                setStep(2);
            } else {
                throw new Error("No data");
            }
        } catch (err) {
            console.error("Connection Error:", err);
            // Fallback Mock Data
            const mockData = {
                ssid: `TLD_Guest_${network}`,
                password: Math.random().toString(36).slice(-8).toUpperCase(),
                network_name: network
            };
            setWifiData(mockData);
            setStep(2);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(currentUrl);
    };

    const getWifiQrString = () => {
        if (!wifiData) return "";
        // Standard WIFI URI Scheme
        return `WIFI:S:${wifiData.ssid};T:WPA;P:${wifiData.password};;`;
    };

    // --- UPDATED DIRECT CONNECT LOGIC ---
    const handleDirectConnect = async () => {
        if (!wifiData) return;

        // 1. Always copy the password to clipboard first (Best UX for iOS/Desktop)
        try {
            await navigator.clipboard.writeText(wifiData.password);
            setConnectStatus('copied');

            // Reset button text after 3 seconds
            setTimeout(() => setConnectStatus('idle'), 3000);
        } catch (err) {
            console.error("Clipboard failed", err);
        }

        // 2. Attempt to launch the WiFi URI Scheme (Works on some Androids)
        const wifiString = getWifiQrString();
        window.location.href = wifiString;

        // 3. Show instruction alert if browser blocks the link
        // We use a small timeout to let the browser attempt the link first
        setTimeout(() => {
            // Check if we are on a mobile device roughly
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

            if (!isMobile) {
                alert(`Password Copied: "${wifiData.password}"\n\nOn a computer, you must manually select the network "${wifiData.ssid}" and paste the password.`);
            } else {
                // Determine OS for specific instructions
                const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
                if (isIOS) {
                    alert(`Password Copied!\n\niPhones do not allow direct web connections. Please open Settings > WiFi, select "${wifiData.ssid}" and paste the password.`);
                }
                // On Android, if the window.location didn't work, this alert helps
            }
        }, 500);
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen relative overflow-hidden bg-[#F8FAFC] font-sans selection:bg-teal-100 selection:text-teal-900 flex items-center justify-center p-4" style={{ marginTop: '5rem' }}>

                {/* Animated Background Blobs */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                    <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
                </div>

                <div className="w-full max-w-5xl z-10 grid lg:grid-cols-12 gap-6 items-start">

                    {/* --- LEFT PANEL --- */}
                    <div className="lg:col-span-8 w-full">
                        <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-10 relative overflow-hidden transition-all duration-500">

                            {/* Header */}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-[11px] font-bold uppercase tracking-wider">
                                        <ShieldCheck className="w-3 h-3" /> Secure Portal
                                    </span>
                                </div>
                                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
                                    The Living Desk
                                </h1>
                                <p className="text-gray-500 mt-2 text-lg">
                                    {step === 1 ? "Connect to our high-speed guest network." : "You are now connected."}
                                </p>
                            </div>

                            {step === 1 ? (
                                /* --- STEP 1: FORM --- */
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {/* Network Selector */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold text-gray-700 ml-1">Select Provider</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {['Airtel', 'Citylink'].map((net) => (
                                                <button
                                                    key={net}
                                                    onClick={() => setNetwork(net)}
                                                    className={`
                                                    relative p-4 rounded-2xl border transition-all duration-300 flex items-center justify-center gap-3
                                                    ${network === net
                                                            ? 'bg-teal-50 border-teal-200 ring-2 ring-teal-500/20 shadow-lg shadow-red-500/10'
                                                            : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50 shadow-sm'}
                                                `}
                                                >
                                                    <div className={`p-2 rounded-full ${network === net ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                        <Router size={18} />
                                                    </div>
                                                    <span className={`font-semibold ${network === net ? 'text-teal-900' : 'text-gray-600'}`}>
                                                        {net} Fiber
                                                    </span>
                                                    {network === net && (
                                                        <div className="absolute top-2 right-2 text-teal-500">
                                                            <CheckCircle2 size={16} />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Inputs */}
                                    <div className="space-y-5">
                                        <InputField
                                            icon={User}
                                            label="Full Name"
                                            value={guestName}
                                            onChange={(e) => setGuestName(e.target.value)}
                                            placeholder="Jane Doe"
                                            isFocused={focusedField === 'name'}
                                            onFocus={() => setFocusedField('name')}
                                            onBlur={() => setFocusedField(null)}
                                        />
                                        <InputField
                                            icon={Smartphone}
                                            label="Mobile Number"
                                            value={mobile}
                                            onChange={(e) => setMobile(e.target.value)}
                                            placeholder="98765 43210"
                                            type="tel"
                                            isFocused={focusedField === 'mobile'}
                                            onFocus={() => setFocusedField('mobile')}
                                            onBlur={() => setFocusedField(null)}
                                        />
                                    </div>

                                    <button
                                        onClick={handleLogin}
                                        disabled={loading}
                                        className={`
                                        w-full py-4 rounded-xl text-white font-semibold text-lg shadow-xl 
                                        flex items-center justify-center gap-3 transition-all duration-300 transform active:scale-[0.98]
                                        ${loading
                                                ? 'bg-gray-400 cursor-wait'
                                                : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-teal-500/20 hover:shadow-teal-500/30'}
                                    `}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="animate-spin w-5 h-5" />
                                                <span>Generating Access...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Get WiFi Access</span>
                                                <ArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                /* --- STEP 2: TICKET CARD --- */
                                <div className="animate-in fade-in zoom-in duration-500 w-full flex flex-col items-center">

                                    <div className="w-full max-w-md" ref={cardRef}>
                                        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 relative group hover:shadow-3xl transition-shadow duration-500">

                                            {/* Ticket Header */}
                                            <div className="bg-gray-900 p-6 flex justify-between items-center relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
                                                <div className="relative z-10">
                                                    <h2 className="text-white font-bold text-xl tracking-tight">WiFi Access Pass</h2>
                                                    <p className="text-teal-400 text-xs font-mono mt-1 uppercase tracking-widest">Valid for 24 Hours</p>
                                                </div>
                                                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700">
                                                    <Wifi className="text-teal-400" size={20} />
                                                </div>
                                            </div>

                                            {/* Ticket Body */}
                                            <div className="p-8 relative bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">

                                                {/* Credentials */}
                                                <div className="space-y-6">
                                                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                                                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                                                            <Network size={14} />
                                                            <span className="text-[10px] font-bold uppercase tracking-widest">Network SSID</span>
                                                        </div>
                                                        <div className="text-xl font-bold text-gray-900">
                                                            {wifiData?.ssid}
                                                        </div>
                                                    </div>

                                                    <div className="group/pass relative">
                                                        <div className="bg-teal-50 rounded-2xl p-5 border border-teal-100 transition-colors group-hover/pass:border-teal-300">
                                                            <div className="flex items-center gap-2 text-teal-600 mb-2">
                                                                <KeyRound size={14} />
                                                                <span className="text-[10px] font-bold uppercase tracking-widest">Password</span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-2xl font-mono font-bold text-teal-900 tracking-wider">
                                                                    {wifiData?.password}
                                                                </span>
                                                                <button
                                                                    onClick={() => { navigator.clipboard.writeText(wifiData?.password); alert('Password Copied') }}
                                                                    className="p-2 hover:bg-white rounded-lg text-teal-600 transition-colors"
                                                                >
                                                                    <Copy size={18} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* --- DIRECT CONNECT BUTTON --- */}
                                                <button
                                                    onClick={handleDirectConnect}
                                                    className={`
                                                        w-full mt-6 py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95
                                                        ${connectStatus === 'copied'
                                                            ? 'bg-green-600 text-white'
                                                            : 'bg-gray-900 hover:bg-black text-white'}
                                                    `}
                                                >
                                                    {connectStatus === 'copied' ? (
                                                        <>
                                                            <CheckCircle2 size={18} />
                                                            <span className="font-semibold">Password Copied!</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Zap size={18} className="text-yellow-400 fill-yellow-400" />
                                                            <span className="font-semibold">Click to Connect</span>
                                                        </>
                                                    )}
                                                </button>
                                                {/* ----------------------------------- */}

                                                {/* QR Code Section */}
                                                <div className="mt-8 flex items-center gap-5 pt-6 border-t border-gray-100 border-dashed">
                                                    <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                                                        <QRCode
                                                            value={getWifiQrString()}
                                                            size={80}
                                                            viewBox={`0 0 256 256`}
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-bold text-gray-900 text-sm">Scan to Connect</p>
                                                        <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                                                            Open camera or Google Lens. <br />
                                                            <span className="text-[10px] opacity-70">(iOS users: if link fails, paste password from clipboard)</span>
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Decorative Punch Holes */}
                                                <div className="absolute -left-3 top-1/2 w-6 h-6 bg-[#F8FAFC] rounded-full"></div>
                                                <div className="absolute -right-3 top-1/2 w-6 h-6 bg-[#F8FAFC] rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setStep(1)}
                                        className="mt-8 text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors"
                                    >
                                        Start Over
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* --- RIGHT PANEL (Helper) --- */}
                    <div className="lg:col-span-4 w-full h-full">
                        <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-8 h-full flex flex-col justify-center items-center text-center shadow-sm">
                            <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                {step === 1 ? <Smartphone className="text-teal-600 w-8 h-8" /> : <Sparkles className="text-teal-600 w-8 h-8" />}
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                {step === 1 ? "Mobile Access" : "You're Online!"}
                            </h3>

                            <p className="text-gray-500 text-sm mb-8 leading-relaxed px-4">
                                {step === 1
                                    ? "Scan the QR code below to open this portal directly on your mobile device."
                                    : "Enjoy high-speed connection. Please adhere to community guidelines while browsing."
                                }
                            </p>

                            <div className="bg-white p-4 rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 mb-6 group transition-transform hover:scale-105 duration-300">
                                <QRCode
                                    value={step === 1 ? currentUrl : getWifiQrString()}
                                    size={140}
                                />
                            </div>

                            {step === 1 && (
                                <button
                                    onClick={copyToClipboard}
                                    className="text-xs font-semibold text-gray-500 hover:text-teal-600 flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white transition-all"
                                >
                                    <Copy size={14} /> Copy Portal Link
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

// Reusable Input Component
const InputField = ({
    icon: Icon, label, isFocused, ...props
}: {
    icon: any, label: string, isFocused: boolean | null, [key: string]: any
}) => (
    <div className="group">
        <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1 transition-colors group-hover:text-teal-700">
            {label}
        </label>
        <div className={`
            relative flex items-center transition-all duration-300 rounded-xl border 
            ${isFocused
                ? 'border-teal-500 ring-4 ring-teal-500/10 bg-white shadow-lg shadow-teal-500/5'
                : 'border-gray-200 bg-gray-50/50 hover:bg-white hover:border-gray-300 hover:shadow-md'}
        `}>
            <div className={`absolute left-4 transition-colors duration-300 ${isFocused ? 'text-teal-500' : 'text-gray-400 group-hover:text-gray-500'}`}>
                <Icon className="w-5 h-5" />
            </div>
            <input
                className="w-full pl-12 pr-4 py-3.5 bg-transparent rounded-xl outline-none text-gray-900 font-medium placeholder:text-gray-400"
                {...props}
            />
        </div>
    </div>
);

export default WifiCustomerPortal;