import React from 'react';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Privacy & Policy</h1>
        </div>
      </div>

      <div className="glass border border-white/10 rounded-[2rem] p-8 md:p-10 space-y-8 text-slate-300 leading-relaxed">
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white uppercase tracking-widest">1. Data Collection</h2>
          <p className="text-sm">
            We collect minimal data necessary to provide the ZippyType experience. This includes your typing statistics (WPM, accuracy, errors), game history, and user preferences. If you sign in with Google or GitHub, we store your email and basic profile information for authentication purposes.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white uppercase tracking-widest">2. Usage of Information</h2>
          <p className="text-sm">
            Your data is used solely to track your progress, generate personalized typing challenges, and maintain your account settings. We do not sell your personal data to third parties.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white uppercase tracking-widest">3. AI Processing</h2>
          <p className="text-sm">
            ZippyType uses AI (Gemini or GitHub Models) to generate typing content. Your typing inputs are processed locally or sent securely to these services only for the purpose of generating text or analyzing performance. No personal identifiers are shared with AI providers beyond what is necessary for the service.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white uppercase tracking-widest">4. Cookies & Storage</h2>
          <p className="text-sm">
            We use local storage and cookies to save your preferences and session state. This ensures a seamless experience across visits. You can clear your browser data at any time to remove this information.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white uppercase tracking-widest">5. Contact Us</h2>
          <p className="text-sm">
            If you have any questions about our privacy practices, please contact us at support@zippytype.com.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
