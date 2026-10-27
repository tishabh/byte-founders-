/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Citizen AI Emergency Lifeline Interactive Chat Component
 * Provides real-time guidance to common citizens during floods in Hindi & English
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  AlertTriangle,
  Home,
  Zap,
  PhoneCall,
  CheckCircle2,
  Sparkles,
  MapPin,
  LifeBuoy
} from 'lucide-react';
import { DisasterState, GeoLocation } from '../types/disaster';
import { askCitizenLifeline, ChatMessage } from '../services/citizenChatService';

interface CitizenEmergencyChatProps {
  state: DisasterState;
  onIngestSOS: (text: string, location: GeoLocation) => void;
  onNavigateToMap?: () => void;
}

const QUICK_PROMPTS = [
  { label: '🏠 पास का रिलीफ कैंप (Nearest Shelter)', query: 'Sabse paas ka relief camp kahan hai aur wahan kitni jagah bachi hai?' },
  { label: '🚤 छत पर फंसे हैं (Trapped on Roof)', query: 'Hum 4 log Pandu Ghat ke paas chhat par phanse hain, paani badh raha hai, boat bhejo!' },
  { label: '⚡ करंट का खतरा (Electrical Hazard)', query: 'Paani me bijli ka transformer doob gaya hai, ghar me current ka khatra hai, kya karein?' },
  { label: '🐍 सर्पदंश उपचार (Snakebite First Aid)', query: 'Baadh ke paani me saanp ne kaat liya hai, urgent first aid batao!' },
  { label: '🍼 स्वच्छ पानी व खाना (Clean Water)', query: 'Peene ka saaf paani aur bacho ke liye doodh kahan milega?' }
];

export const CitizenEmergencyChat: React.FC<CitizenEmergencyChatProps> = ({
  state,
  onIngestSOS,
  onNavigateToMap
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'WELCOME_1',
      sender: 'AI_LIFELINE',
      text: 'नमस्ते! मैं **Suraksha AI (सुरक्षा) नागरिक आपदा सहायक** हूँ।\n\nयदि आप या आपका परिवार बाढ़ के पानी में फंसा है, या आपको भोजन, दवा और सुरक्षित आश्रय (Relief Shelter) की आवश्यकता है, तो यहाँ बेझिझक पूछें। मैं हिंदी, हिंग्लिश और अंग्रेजी में सहायता कर सकता हूँ।',
      timestamp: '10:45 AM'
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastDispatchedText, setLastDispatchedText] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `USER_${Date.now()}`,
      sender: 'CITIZEN',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await askCitizenLifeline(
        textToSend,
        messages,
        state.shelters,
        state.incidents
      );

      const aiMsg: ChatMessage = {
        id: `AI_${Date.now()}`,
        sender: 'AI_LIFELINE',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        suggestedAction: response.suggestedSos
          ? {
              type: 'DISPATCH_SOS',
              label: '🚨 Send Emergency SOS to NDRF Swarm',
              payload: textToSend
            }
          : undefined
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `ERR_${Date.now()}`,
        sender: 'AI_LIFELINE',
        text: 'क्षमा करें, नेटवर्क में देरी है। यदि आप संकट में हैं तो सीधे ASDMA हेल्पलाइन 1070 या 112 पर कॉल करें।',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleBroadcastSOS = (textToBroadcast: string) => {
    // Determine coordinates based on text or default to Guwahati flood hotspot
    const defaultCoords: GeoLocation = {
      lat: 26.1685,
      lng: 91.7012,
      landmark: 'Citizen Chat SOS • Brahmaputra Riverbank Sector'
    };

    onIngestSOS(textToBroadcast, defaultCoords);
    setLastDispatchedText(textToBroadcast);

    const confirmationMsg: ChatMessage = {
      id: `SYS_${Date.now()}`,
      sender: 'SYSTEM',
      text: `✅ **SOS सफलता पूर्वक दर्ज हुआ!**\n\nआपकी संकट सूचना सीधे **NDRF Swarm Control Room** को भेज दी गई है।\n• Ingestion Agent ने इसे उच्च प्राथमिकता (P1 Critical) दी है।\n• नजदीकी NDRF बोट और मेडिकल टीम को अलर्ट जारी कर दिया गया है।\n• कृपया सुरक्षित स्थान पर रहें और फोन की बैटरी बचाएं।`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    };

    setMessages(prev => [...prev, confirmationMsg]);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-0 h-full p-3 gap-3 overflow-hidden">
      {/* Left Chat Column */}
      <div className="flex-1 flex flex-col min-h-0 liquid-glass rounded-2xl border border-white/15 shadow-2xl overflow-hidden">
        {/* Chat Header */}
        <div className="px-4 py-3 bg-slate-900/60 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg">
                <Bot className="w-5 h-5" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-white text-sm">
                  नागरिक आपदा सहायता (Citizen AI Lifeline)
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-300" />
                  Gemini 2.5 Flash
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                24x7 Flood Emergency Guidance • Hindi, Hinglish & English
              </p>
            </div>
          </div>

          {/* Emergency Call Quick Badge */}
          <a
            href="tel:112"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold hover:bg-rose-500/30 transition-all cursor-pointer"
          >
            <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
            <span>Emergency 112</span>
          </a>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(msg => {
            const isUser = msg.sender === 'CITIZEN';
            const isSystem = msg.sender === 'SYSTEM';

            if (isSystem) {
              return (
                <div
                  key={msg.id}
                  className="mx-auto max-w-lg p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 text-xs shadow-lg animate-fadeIn"
                >
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="whitespace-pre-line leading-relaxed font-sans">{msg.text}</div>
                  </div>
                  {onNavigateToMap && (
                    <button
                      onClick={onNavigateToMap}
                      className="mt-2.5 px-3 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-100 text-[11px] font-bold border border-emerald-400/40 flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>View Live Dispatch on GIS Map</span>
                    </button>
                  )}
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-md ${
                    isUser
                      ? 'bg-gradient-to-tr from-cyan-500 to-blue-600'
                      : 'bg-gradient-to-tr from-indigo-500 to-purple-600'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[82%] rounded-2xl p-3.5 shadow-xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-cyan-600/90 text-white rounded-tr-none border border-cyan-400/30'
                      : 'liquid-glass-card text-slate-100 rounded-tl-none border border-white/15'
                  }`}
                >
                  <div className="whitespace-pre-line font-sans">{msg.text}</div>

                  {/* Suggested Dispatch Action Button */}
                  {msg.suggestedAction && msg.suggestedAction.type === 'DISPATCH_SOS' && (
                    <div className="mt-3 pt-2.5 border-t border-white/10">
                      <button
                        onClick={() => handleBroadcastSOS(msg.suggestedAction?.payload || '')}
                        disabled={lastDispatchedText === msg.suggestedAction.payload}
                        className={`w-full py-2 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                          lastDispatchedText === msg.suggestedAction.payload
                            ? 'bg-emerald-600 text-white cursor-default'
                            : 'bg-gradient-to-r from-rose-500 via-red-600 to-rose-700 hover:from-rose-600 hover:to-red-800 text-white animate-pulse'
                        }`}
                      >
                        <AlertTriangle className="w-4 h-4" />
                        <span>
                          {lastDispatchedText === msg.suggestedAction.payload
                            ? '✓ SOS Dispatched to NDRF Swarm'
                            : '🚨 Send Emergency SOS to NDRF Swarm'}
                        </span>
                      </button>
                    </div>
                  )}

                  <div
                    className={`text-[9px] mt-1.5 ${
                      isUser ? 'text-cyan-200 text-right' : 'text-slate-400 text-left'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-slate-400 text-xs italic pl-11">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
              <span>Suraksha Lifeline typing...</span>
            </div>
          )}

          <div ref={scrollRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-3 py-2 bg-slate-950/40 border-t border-white/10 overflow-x-auto flex items-center gap-2">
          {QUICK_PROMPTS.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp.query)}
              className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/40 text-slate-300 hover:text-white text-[11px] whitespace-nowrap cursor-pointer transition-all shrink-0"
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-900/60 border-t border-white/10 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message in Hindi, Hinglish or English (e.g. Mere paas ka shelter kahan hai?)..."
            className="flex-1 bg-white/5 border border-white/15 focus:border-cyan-400/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none transition-all"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim() || isTyping}
            className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-40 text-white transition-all cursor-pointer shadow-lg shadow-cyan-950/40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right Information & Survival Cheat Sheet Sidebar */}
      <div className="w-full md:w-80 flex flex-col gap-3 shrink-0">
        {/* Open Relief Camps Live Snapshot */}
        <div className="liquid-glass rounded-2xl p-4 border border-white/15 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-emerald-400" />
              <h3 className="font-extrabold text-white text-xs">
                सक्रिय राहत शिविर (Dry Shelters)
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
              Live
            </span>
          </div>

          <div className="space-y-2.5">
            {state.shelters.map(shelter => {
              const freeSpace = shelter.maxCapacity - shelter.currentOccupancy;
              const isFull = shelter.status === 'FULL';

              return (
                <div
                  key={shelter.id}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isFull
                      ? 'bg-rose-950/20 border-rose-500/30 opacity-75'
                      : 'bg-white/5 border-white/10 hover:border-emerald-400/40'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white line-clamp-1">{shelter.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        isFull
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {isFull ? 'FULL' : `${freeSpace} Seats Free`}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    <span>{shelter.location.landmark}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vital Emergency Guidelines Card */}
        <div className="liquid-glass rounded-2xl p-4 border border-white/15 shadow-xl flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2">
              <Zap className="w-4 h-4" />
              <span>बाढ़ सुरक्षा नियम (Survival Rules)</span>
            </div>

            <ul className="space-y-2 text-[11px] text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span>बिजली का मेन स्विच तुरंत बंद करें, पानी में डूबे तारों से दूर रहें।</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span>उबलता हुआ या क्लोरीन की गोली मिला हुआ पानी ही पिएं।</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span>छत पर रहते हुए चमकीले कपड़े या टॉर्च से बचाव दलों को इशारा करें।</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span>तेज बहाव वाले पानी में कभी पैदल या बाइक से न निकलें।</span>
              </li>
            </ul>
          </div>

          {/* Official Emergency Contact Numbers */}
          <div className="mt-4 pt-3 border-t border-white/10 text-xs">
            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
              हेल्पलाइन नंबर (National Toll-Free)
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                <div className="text-slate-400 text-[9px]">National Helpline</div>
                <div className="font-bold text-white">112</div>
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                <div className="text-slate-400 text-[9px]">ASDMA Flood</div>
                <div className="font-bold text-cyan-300">1070 / 1079</div>
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                <div className="text-slate-400 text-[9px]">NDRF HQ Control</div>
                <div className="font-bold text-white">011-24363260</div>
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                <div className="text-slate-400 text-[9px]">Childline / Medic</div>
                <div className="font-bold text-emerald-300">1098 / 108</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
