import React, { useState, useRef } from 'react';
import {
    Wifi, User, Smartphone, Loader2, Copy,
    Router, KeyRound, Network, ArrowRight, Sparkles, Zap
} from 'lucide-react';
import QRCode from 'react-qr-code';
import Navbar from "@/components/Navbar";
import { apiClient } from "@/lib/api";

// 1. Define Types for API Responses
interface WifiDetails {
    ssid: string;
    password: string;
}

interface ConnectResponse {
    message?: string;
    wifi_details: WifiDetails;
}

// 2. Define Providers
// CRITICAL: The 'id' must exist in your Database under 'network_name'
const PROVIDERS = [
    { id: 'CITYLINK', label: 'Citylink', display: 'Citylink Fiber' }, // Moved to top as default since it exists in DB
    { id: 'AIRTEL', label: 'Airtel', display: 'Airtel Fiber' }        // Will crash if not added to DB
];

const WifiCustomerPortal = () => {
    // Default to 'CITYLINK' to avoid the "NoneType" error on initial test
    const [step, setStep] = useState(1);
    const [network, setNetwork] = useState(PROVIDERS[0].id);
    const [guestName, setGuestName] = useState('');
    const [mobile, setMobile] = useState('');

    const [wifiData, setWifiData] = useState<WifiDetails | null>(null);

    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [connectStatus, setConnectStatus] = useState<'idle' | 'copied'>('idle');

    const cardRef = useRef(null);
    const currentUrl = typeof window !== 'undefined' ? window.location.href : 'http://localhost:3000';

    const handleLogin = async () => {
        if (mobile.length < 10 || guestName.length < 3) {
            alert("Please enter a valid name and mobile number");
            return;
        }
        setLoading(true);

        try {
            console.log("Sending Payload:", {
                guest_name: guestName,
                mobile_number: mobile,
                network_name: network
            });

            const response = await apiClient.post<ConnectResponse>('/wifi/guest/connect', {
                guest_name: guestName,
                mobile_number: mobile,
                network_name: network
            });

            if (response && response.wifi_details) {
                setWifiData(response.wifi_details);
                setStep(2);
            } else {
                throw new Error("Invalid response from server");
            }

        } catch (err: any) {
            console.error("Login Error:", err);
            // Improved error messaging for the user
            const backendDetail = err.response?.data?.detail;
            if (backendDetail && backendDetail.includes("NoneType")) {
                alert("System Error: The selected network is not configured in the database.");
            } else {
                const errorMsg = backendDetail || err.message || "Unable to fetch credentials.";
                alert(errorMsg);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDirectConnect = async () => {
        if (!wifiData) return;
        try {
            await navigator.clipboard.writeText(wifiData.password);
            setConnectStatus('copied');
            setTimeout(() => setConnectStatus('idle'), 3000);
        } catch (err) {
            console.error("Clipboard failed", err);
        }

        // Android/iOS WiFi URI Scheme
        const wifiString = `WIFI:S:${wifiData.ssid};T:WPA;P:${wifiData.password};;`;
        window.location.href = wifiString;
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen relative overflow-hidden bg-[#F8FAFC] font-sans flex items-center justify-center p-4" style={{ marginTop: '5rem' }}>

                <div className="w-full max-w-5xl z-10 grid lg:grid-cols-12 gap-6 items-start">

                    {/* LEFT PANEL */}
                    <div className="lg:col-span-8 w-full">
                        <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-10 relative overflow-hidden transition-all duration-500">

                            <div className="mb-8">
                                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
                                    The Living Desk
                                </h1>
                                <p className="text-gray-500 mt-2 text-lg">
                                    {step === 1 ? "Connect to our high-speed guest network." : "Here are your access details."}
                                </p>
                            </div>

                            {step === 1 ? (
                                // --- STEP 1: INPUT FORM ---
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {/* Network Selection */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-semibold text-gray-700 ml-1">Select Provider</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {PROVIDERS.map((provider) => (
                                                <button
                                                    key={provider.id}
                                                    onClick={() => setNetwork(provider.id)}
                                                    className={`
                                                    relative p-4 rounded-2xl border transition-all duration-300 flex items-center justify-center gap-3
                                                    ${network === provider.id
                                                            ? 'bg-teal-50 border-teal-200 ring-2 ring-teal-500/20 shadow-lg'
                                                            : 'bg-white border-gray-100 hover:bg-gray-50'}
                                                `}
                                                >
                                                    <div className={`p-2 rounded-full ${network === provider.id ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                        <Router size={18} />
                                                    </div>
                                                    <span className={`font-semibold ${network === provider.id ? 'text-teal-900' : 'text-gray-600'}`}>
                                                        {provider.display}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* User Inputs */}
                                    <div className="space-y-5">
                                        <InputField
                                            icon={User}
                                            label="Full Name"
                                            value={guestName}
                                            onChange={(e: any) => setGuestName(e.target.value)}
                                            placeholder="Jane Doe"
                                            isFocused={focusedField === 'name'}
                                            onFocus={() => setFocusedField('name')}
                                            onBlur={() => setFocusedField(null)}
                                        />
                                        <InputField
                                            icon={Smartphone}
                                            label="Mobile Number"
                                            value={mobile}
                                            onChange={(e: any) => setMobile(e.target.value)}
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
                                                : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500'}
                                    `}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="animate-spin w-5 h-5" />
                                                <span>Fetching Credentials...</span>
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
                                // --- STEP 2: CREDENTIALS DISPLAY ---
                                <div className="animate-in fade-in zoom-in duration-500 w-full flex flex-col items-center">
                                    <div className="w-full max-w-md" ref={cardRef}>
                                        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 relative group">
                                            <div className="bg-gray-900 p-6 flex justify-between items-center relative overflow-hidden">
                                                <div className="relative z-10">
                                                    <h2 className="text-white font-bold text-xl tracking-tight">WiFi Access Pass</h2>
                                                </div>
                                                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700">
                                                    <Wifi className="text-teal-400" size={20} />
                                                </div>
                                            </div>

                                            <div className="p-8">
                                                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-6">
                                                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                                                        <Network size={14} />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">Network Name (SSID)</span>
                                                    </div>
                                                    <div className="text-xl font-bold text-gray-900">
                                                        {wifiData?.ssid}
                                                    </div>
                                                </div>

                                                <div className="bg-teal-50 rounded-2xl p-5 border border-teal-100">
                                                    <div className="flex items-center gap-2 text-teal-600 mb-2">
                                                        <KeyRound size={14} />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">Password</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-2xl font-mono font-bold text-teal-900 tracking-wider">
                                                            {wifiData?.password}
                                                        </span>
                                                        <button
                                                            onClick={() => {
                                                                if (wifiData?.password) {
                                                                    navigator.clipboard.writeText(wifiData.password);
                                                                    alert('Password Copied');
                                                                }
                                                            }}
                                                            className="p-2 hover:bg-white rounded-lg text-teal-600 transition-colors"
                                                        >
                                                            <Copy size={18} />
                                                        </button>
                                                    </div>
                                                </div>

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
                                                        <span>Password Copied!</span>
                                                    ) : (
                                                        <>
                                                            <Zap size={18} className="text-yellow-400 fill-yellow-400" />
                                                            <span className="font-semibold">Click to Connect</span>
                                                        </>
                                                    )}
                                                </button>
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

                    {/* RIGHT PANEL (Helper) */}
                    <div className="lg:col-span-4 w-full h-full">
                        <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl p-8 h-full flex flex-col justify-center items-center text-center shadow-sm">
                            <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-full flex items-center justify-center mb-6">
                                {step === 1 ? <Smartphone className="text-teal-600 w-8 h-8" /> : <Sparkles className="text-teal-600 w-8 h-8" />}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                {step === 1 ? "Mobile Access" : "You're Online!"}
                            </h3>
                            <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 mb-6 group transition-transform hover:scale-105 duration-300">
                                <QRCode
                                    value={
                                        step === 1
                                            ? currentUrl
                                            : `WIFI:S:${wifiData?.ssid};T:WPA;P:${wifiData?.password};;`
                                    }
                                    size={140}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const InputField = ({ icon: Icon, label, isFocused, ...props }: any) => (
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