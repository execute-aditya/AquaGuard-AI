import { useState } from 'react';
import { askGroq } from '../lib/groq';
import Layout from '../components/Layout';

const COLORS = [
  { id: 'clear', label: 'Clear', bg: 'bg-blue-100', checkColor: 'text-blue-500' },
  { id: 'yellow', label: 'Yellow', bg: 'bg-yellow-200', checkColor: 'text-yellow-700' },
  { id: 'brown', label: 'Brown', bg: 'bg-amber-800', checkColor: 'text-white' },
  { id: 'greenish', label: 'Greenish', bg: 'bg-green-200', checkColor: 'text-green-700' },
  { id: 'cloudy', label: 'Cloudy/White', bg: 'bg-gray-300', checkColor: 'text-gray-700' },
];

const SMELLS = ['None', 'Chlorine', 'Earthy / Musty', 'Rotten Egg', 'Metallic', 'Chemical'];
const TASTES = ['Normal / None', 'Salty', 'Metallic', 'Bitter', 'Sweet'];

const SYSTEM_PROMPT = `You are a water quality analyzer. The user will describe their water. Respond ONLY in valid JSON with no extra text, no markdown, no backticks. Use exactly this format: {"risk_level": "Low" or "Medium" or "High", "possible_cause": "one sentence", "recommendation": "one sentence"}`;

export default function CheckerPage() {
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSmell, setSelectedSmell] = useState(null);
  const [selectedTaste, setSelectedTaste] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const allSelected = selectedColor && selectedSmell && selectedTaste;

  const analyze = async () => {
    if (!allSelected) return;
    setLoading(true);
    setResult(null);

    try {
      const userMsg = `Water color: ${selectedColor}, Smell: ${selectedSmell}, Taste: ${selectedTaste}`;
      const raw = await askGroq(userMsg, SYSTEM_PROMPT);
      try {
        // Try to extract JSON from response (handle markdown wrapping)
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        setResult(JSON.parse(jsonMatch ? jsonMatch[0] : raw));
      } catch {
        setResult({ risk_level: 'Unknown', possible_cause: raw, recommendation: 'Consult local water authority.' });
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setResult({ risk_level: 'Error', possible_cause: 'Failed to analyze. Please try again.', recommendation: 'Check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSelectedColor(null); setSelectedSmell(null); setSelectedTaste(null); setResult(null);
  };

  const riskConfig = {
    Low: { border: 'border-green-500', bg: 'bg-green-100', icon: 'check_circle', iconColor: 'text-green-600', label: 'LOW RISK', sub: 'Generally Safe' },
    Medium: { border: 'border-yellow-500', bg: 'bg-yellow-100', icon: 'warning', iconColor: 'text-yellow-600', label: 'MEDIUM RISK', sub: 'Caution Advised' },
    High: { border: 'border-red-500', bg: 'bg-red-100', icon: 'dangerous', iconColor: 'text-red-600', label: 'HIGH RISK', sub: 'Do Not Consume' },
    Unknown: { border: 'border-gray-500', bg: 'bg-gray-100', icon: 'help', iconColor: 'text-gray-600', label: 'UNKNOWN', sub: 'Unable to Determine' },
    Error: { border: 'border-red-500', bg: 'bg-red-100', icon: 'error', iconColor: 'text-red-600', label: 'ERROR', sub: 'Analysis Failed' },
  };

  return (
    <Layout>
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-x py-stack-lg flex flex-col gap-stack-lg">
        {/* Header */}
        <section className="text-center max-w-2xl mx-auto mb-4">
          <h1 className="font-headline-xl text-headline-xl text-primary mb-stack-sm">Water Safety Checker</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Describe your water to get instant AI analysis and actionable safety recommendations aligned with SDG 6.</p>
        </section>

        {/* Selectors */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {/* Color */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-soft flex flex-col gap-4 border border-outline-variant/30">
            <div className="flex items-center gap-3 border-b border-surface-variant pb-3">
              <span className="material-symbols-outlined text-primary text-[24px]">water_drop</span>
              <h2 className="font-headline-md text-headline-md text-primary">Water Color</h2>
            </div>
            <p className="font-label-md text-label-md text-on-surface-variant">Select the closest match to what you see.</p>
            <div className="grid grid-cols-3 gap-4 mt-2">
              {COLORS.map(c => (
                <button key={c.id} className="flex flex-col items-center gap-2 group focus:outline-none" onClick={() => setSelectedColor(c.id)}>
                  <div className={`w-12 h-12 rounded-full border-2 ${selectedColor === c.id ? 'border-[#06b6d4] ring-2 ring-[#06b6d4]/30' : 'border-transparent'} hover:border-secondary transition-all ${c.bg} flex items-center justify-center`}>
                    {selectedColor === c.id && <span className={`material-symbols-outlined ${c.checkColor}`}>check</span>}
                  </div>
                  <span className="font-label-sm text-label-sm text-on-surface">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Smell */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-soft flex flex-col gap-4 border border-outline-variant/30">
            <div className="flex items-center gap-3 border-b border-surface-variant pb-3">
              <span className="material-symbols-outlined text-primary text-[24px]">air</span>
              <h2 className="font-headline-md text-headline-md text-primary">Smell</h2>
            </div>
            <p className="font-label-md text-label-md text-on-surface-variant">Identify any distinct odors.</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {SMELLS.map(s => (
                <button key={s} className={`px-4 py-2 rounded-full border font-label-md text-label-md transition-all ${selectedSmell === s ? 'bg-secondary-container border-secondary text-on-secondary-container' : 'border-outline-variant text-on-surface hover:border-secondary hover:text-secondary'}`} onClick={() => setSelectedSmell(s)}>{s}</button>
              ))}
            </div>
          </div>

          {/* Taste */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-soft flex flex-col gap-4 border border-outline-variant/30">
            <div className="flex items-center gap-3 border-b border-surface-variant pb-3">
              <span className="material-symbols-outlined text-primary text-[24px]">restaurant</span>
              <h2 className="font-headline-md text-headline-md text-primary">Taste</h2>
            </div>
            <p className="font-label-md text-label-md text-on-surface-variant">If safe to do so, describe the taste.</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {TASTES.map(t => (
                <button key={t} className={`px-4 py-2 rounded-full border font-label-md text-label-md transition-all ${selectedTaste === t ? 'bg-secondary-container border-secondary text-on-secondary-container' : 'border-outline-variant text-on-surface hover:border-secondary hover:text-secondary'}`} onClick={() => setSelectedTaste(t)}>{t}</button>
              ))}
            </div>
          </div>
        </section>

        {/* Analyze Button */}
        <section className="w-full mt-4">
          <button className="w-full bg-[#06b6d4] hover:bg-[#0891b2] text-white font-headline-md text-headline-md font-semibold py-4 rounded-xl shadow-soft transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!allSelected || loading} onClick={analyze}>
            {loading ? (
              <><span className="material-symbols-outlined animate-spin">progress_activity</span>Analyzing...</>
            ) : (
              <><span className="material-symbols-outlined">science</span>Analyze Water Safety</>
            )}
          </button>
        </section>

        {/* Results */}
        {result && (() => {
          const rc = riskConfig[result.risk_level] || riskConfig.Unknown;
          return (
            <section className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-gutter transition-opacity duration-500">
              {/* Risk Badge */}
              <div className={`md:col-span-4 bg-surface-container-lowest rounded-xl p-6 shadow-soft border-t-4 ${rc.border} flex flex-col items-center justify-center text-center gap-4`}>
                <div className={`w-20 h-20 rounded-full ${rc.bg} flex items-center justify-center`}>
                  <span className={`material-symbols-outlined ${rc.iconColor} text-[40px]`}>{rc.icon}</span>
                </div>
                <div>
                  <h3 className="font-headline-lg text-headline-lg text-primary">{rc.label}</h3>
                  <p className="font-label-md text-label-md text-on-surface-variant mt-1">{rc.sub}</p>
                </div>
                <button className="mt-4 px-6 py-2 rounded-lg border border-outline-variant text-on-surface-variant font-label-md text-label-md hover:bg-surface-container transition-colors" onClick={reset}>Check Again</button>
              </div>

              {/* Details */}
              <div className="md:col-span-8 flex flex-col gap-4">
                <div className="bg-surface-container-lowest rounded-xl p-6 shadow-soft flex gap-4">
                  <div className="mt-1"><span className="material-symbols-outlined text-secondary text-[24px]">plumbing</span></div>
                  <div>
                    <h4 className="font-headline-md text-headline-md text-primary mb-2">Likely Cause</h4>
                    <p className="font-body-md text-body-md text-on-surface-variant">{result.possible_cause}</p>
                  </div>
                </div>
                <div className="bg-surface-container-lowest rounded-xl p-6 shadow-soft flex gap-4">
                  <div className="mt-1"><span className="material-symbols-outlined text-green-600 text-[24px]">verified_user</span></div>
                  <div>
                    <h4 className="font-headline-md text-headline-md text-primary mb-2">Recommendation</h4>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-4">{result.recommendation}</p>
                    <button className="border border-[#06b6d4] text-[#06b6d4] font-label-md text-label-md px-4 py-2 rounded-lg hover:bg-[#06b6d4]/10 transition-colors">Report to Local Authority</button>
                  </div>
                </div>
              </div>
            </section>
          );
        })()}
      </main>
    </Layout>
  );
}
