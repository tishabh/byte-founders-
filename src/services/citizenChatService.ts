/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Citizen AI Emergency Lifeline Service
 * Powered by Gemini 2.5 Flash via @google/genai with offline safety fallback
 */

import { GoogleGenAI } from '@google/genai';
import { Shelter, Incident } from '../types/disaster';

export interface ChatMessage {
  id: string;
  sender: 'CITIZEN' | 'AI_LIFELINE' | 'SYSTEM';
  text: string;
  timestamp: string;
  suggestedAction?: {
    type: 'DISPATCH_SOS' | 'NAVIGATE_SHELTER' | 'CALL_HELPLINE';
    label: string;
    payload?: string;
  };
  language?: 'hi' | 'en' | 'hinglish';
}

const CITIZEN_SYSTEM_INSTRUCTION = `
You are the official "Suraksha AI Citizen Disaster Lifeline" (सुरक्षा नागरिक आपदा सहायता) for flood-affected citizens in Assam / India, coordinated with NDRF, SDRF, and ASDMA (Assam State Disaster Management Authority).

Your duty is to assist distressed citizens in simple, empathetic, and urgent language.
Languages supported: Hindi, Hinglish, Assamese, and English. Respond in the same language or Hinglish/Hindi as the user asks.

Key Guidelines:
1. Life Safety First: Tell them immediately to move to higher ground, never touch electric wires/submerged transformers, turn off the main switch, and avoid walking through moving floodwater.
2. Shelter guidance: You will be provided a list of current dry relief camps with capacities. Suggest the nearest camp with available space.
3. Medical & First Aid: In case of snake bites, tell them to keep calm, immobilize the limb below heart level, do NOT cut or suck venom, and await NDRF medic boat.
4. Keep answers concise, actionable, and formatted with bullet points for readability during an emergency.
5. Emphasize that help is being coordinated by the autonomous NDRF Swarm.
`;

export async function askCitizenLifeline(
  userQuery: string,
  history: ChatMessage[],
  shelters: Shelter[],
  recentIncidents: Incident[]
): Promise<{ reply: string; suggestedSos?: boolean }> {
  const apiKey = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GEMINI_API_KEY ||
    (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '');

  // Prepare shelter context
  const shelterContext = shelters
    .map(s => `• ${s.name} (${s.location.landmark}): Capacity ${s.currentOccupancy}/${s.maxCapacity} (${s.status})`)
    .join('\n');

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
Current Active Relief Camps:
${shelterContext}

River Brahmaputra Water Level: 1.14 meters above extreme danger mark at Saraighat Gauge.

Recent User Chat History:
${history.slice(-4).map(h => `${h.sender}: ${h.text}`).join('\n')}

Citizen's Current Message:
"${userQuery}"

Provide a compassionate, urgent, and clear response in the citizen's language (Hindi, Hinglish, or English). If their message indicates they are currently trapped, have injured people, or need rescue boat/medical evacuation, clearly state that you are flagging this for the NDRF Swarm Dispatch.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction: CITIZEN_SYSTEM_INSTRUCTION,
          temperature: 0.2,
          maxOutputTokens: 600
        }
      });

      const reply = response.text || '';
      const isUrgent = /(trapped|chhat|doob|bachao|rescue|boat|pregnant|pani|paani|flood|injured|bleeding|emergency)/i.test(userQuery);

      return { reply, suggestedSos: isUrgent };
    } catch {
      // Fallback gracefully to offline rule-based knowledge engine
    }
  }

  // Resilient Offline Fallback (Guaranteed to always work)
  const queryLower = userQuery.toLowerCase();

  if (queryLower.includes('shelter') || queryLower.includes('camp') || queryLower.includes('rahat') || queryLower.includes('kahan jau')) {
    const available = shelters.find(s => s.status !== 'FULL') || shelters[0];
    return {
      reply: `🏠 **निकटतम सक्रिय राहत शिविर (Nearest Dry Relief Camp):**\n\n• **${available.name}**\n• स्थान: ${available.location.landmark}\n• वर्तमान क्षमता: ${available.maxCapacity - available.currentOccupancy} सीटें अभी खाली हैं।\n• यहां भोजन, स्वच्छ पेयजल और NDRF मेडिकल टीम उपलब्ध है।\n\n⚠️ कृपया सुरक्षित ऊंचे रास्तों से जाएं, पानी भरे रास्तों पर पैदल न चलें।`,
      suggestedSos: false
    };
  }

  if (queryLower.includes('bijli') || queryLower.includes('current') || queryLower.includes('wire') || queryLower.includes('electric')) {
    return {
      reply: `⚡ **बिजली करंट से सुरक्षा निर्देश (Electrical Hazard Warning):**\n\n1. तुरंत अपने घर का **Main MCB / Switch बंद करें**।\n2. पानी में डूबे ट्रांसफार्मर या खंभों से कम से कम 20 मीटर दूर रहें।\n3. बिजली का तार पानी में गिरा दिखे तो 1912 (Assam Power Helpline) या 112 डायल करें।\n4. किसी को करंट लगे तो सूखे बांस या लकड़ी से अलग करें, खुद हाथ न लगाएं।`,
      suggestedSos: false
    };
  }

  if (queryLower.includes('saanp') || queryLower.includes('snake') || queryLower.includes('bite') || queryLower.includes('chot')) {
    return {
      reply: `🐍 **सर्पदंश / चोट प्राथमिक उपचार (Snakebite First Aid):**\n\n1. मरीज को शांत रखें और ज्यादा हिलने-डुलने न दें।\n2. काटे गए अंग को दिल के स्तर से नीचे रखें।\n3. घाव पर चीरा न लगाएं और न ही मुंह से जहर चूसें।\n4. तंग कपड़े, अंगूठी या घड़ी तुरंत उतार दें।\n5. NDRF रेस्क्यू बोट मेडिकल किट और एंटी-वेनम के साथ रवाना हो रही है।`,
      suggestedSos: true
    };
  }

  if (queryLower.includes('boat') || queryLower.includes('chhat') || queryLower.includes('fas') || queryLower.includes('trapped') || queryLower.includes('madad')) {
    return {
      reply: `🚨 **NDRF रेस्क्यू अलर्ट दर्ज किया जा रहा है!**\n\n• शांत रहें और छत या सबसे ऊंचे सुरक्षित स्थान पर जाएं।\n• चमकीले कपड़े या टॉर्च हिलाकर हेलीकॉप्टर / NDRF बोट को संकेत दें।\n• मोबाइल फोन की बैटरी बचाएं (Battery Saver On करें)।\n• नीचे दिए गए **"🚨 Send Emergency SOS to NDRF Swarm"** बटन पर क्लिक करें ताकि आपकी लोकेशन सीधे कमांडर को भेज दी जाए।`,
      suggestedSos: true
    };
  }

  return {
    reply: `नमस्ते! मैं Suraksha AI (सुरक्षा) नागरिक आपदा सहायक हूँ।\n\nब्रह्मपुत्र नदी का जलस्तर सरायघाट पर खतरे के निशान से 1.14 मीटर ऊपर है।\n\nआप मुझसे पूछ सकते हैं:\n1. 🏠 **निकटतम सुरक्षित कैंप (Relief Shelter) कहां है?**\n2. 🚤 **छत पर फंसे हैं, रेस्क्यू बोट कैसे बुलाएं?**\n3. ⚡ **बिजली और बाढ़ के पानी से सुरक्षा कैसे करें?**\n4. 🏥 **सर्पदंश या चोट लगने पर प्राथमिक उपचार क्या है?**\n\nयदि आप तुरंत संकट में हैं, तो नीचे अपनी लोकेशन लिखकर भेजें।`,
    suggestedSos: false
  };
}
