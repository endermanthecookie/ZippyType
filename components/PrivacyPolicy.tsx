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
        <p className="text-sm text-slate-500">Last updated: 23 February 2026</p>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white uppercase tracking-widest">1. Introduction</h2>
          <p className="text-sm">
            Welcome to ZippyType ('we', 'us', or 'our'). This Privacy Policy explains how we collect, use, and protect your personal data when you use our website and services at https://zippytype.vercel.app.
          </p>
          <p className="text-sm">
            ZippyType is operated from the Netherlands and is subject to the General Data Protection Regulation (GDPR) and Dutch data protection law.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white uppercase tracking-widest">2. Data We Collect</h2>
          
          <h3 className="text-md font-bold text-white uppercase tracking-wider">2.1 Account Information</h3>
          <p className="text-sm">
            When you sign in using Google OAuth, we request only the following basic profile scopes from Google:
          </p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Your name</li>
            <li>Your email address</li>
            <li>Your Google profile picture (avatar)</li>
          </ul>
          <p className="text-sm">
            We do not request access to any other Google services such as Google Drive, Gmail, or Calendar.
          </p>

          <h3 className="text-md font-bold text-white uppercase tracking-wider">2.2 Subscription & Payment Data</h3>
          <p className="text-sm">
            If you subscribe to a paid plan, payments are processed by Stripe. We do not store your credit card or payment details. Stripe may collect and process your payment information in accordance with their own privacy policy. We receive from Stripe:
          </p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Subscription status (active, cancelled, etc.)</li>
            <li>Subscription tier and billing period</li>
            <li>Transaction identifiers</li>
          </ul>

          <h3 className="text-md font-bold text-white uppercase tracking-wider">2.3 Usage & Analytics Data</h3>
          <p className="text-sm">
            We use Vercel Analytics to understand how our service is used. Vercel Analytics collects anonymised, privacy-friendly data including:
          </p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Page views and navigation patterns</li>
            <li>Browser and device type</li>
            <li>Country-level location (not precise location)</li>
          </ul>
          <p className="text-sm">
            Vercel Analytics does not use cookies and does not track you across websites. No personally identifiable information is sent to Vercel Analytics.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white uppercase tracking-widest">3. How We Use Your Data</h2>
          <p className="text-sm">
            We use the data we collect for the following purposes:
          </p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>To create and manage your account</li>
            <li>To provide access to features and content according to your subscription tier</li>
            <li>To process payments and manage your subscription via Stripe</li>
            <li>To improve and maintain our service using anonymised analytics</li>
            <li>To communicate with you about your account or subscription if necessary</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white uppercase tracking-widest">4. Legal Basis for Processing (GDPR)</h2>
          <p className="text-sm">
            Under the GDPR, we process your personal data on the following legal grounds:
          </p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li><strong>Performance of a contract:</strong> processing your account data and subscription information is necessary to provide our service to you.</li>
            <li><strong>Legitimate interests:</strong> we use anonymised analytics data to improve our service. This does not impact your privacy rights.</li>
            <li><strong>Legal obligation:</strong> we may retain certain data to comply with tax and accounting obligations.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white uppercase tracking-widest">5. Data Sharing</h2>
          <p className="text-sm">
            We do not sell your personal data. We share your data only with the following third parties as necessary to operate our service:
          </p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>Google (OAuth sign-in provider)</li>
            <li>Stripe (payment processing)</li>
            <li>Vercel (hosting and anonymised analytics)</li>
            <li>Supabase (authentication infrastructure and database hosting)</li>
          </ul>
          <p className="text-sm">
            Each of these parties acts as a data processor and is bound by their own privacy policies and, where applicable, GDPR-compliant data processing agreements.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white uppercase tracking-widest">6. Data Retention</h2>
          <p className="text-sm">
            We retain your personal data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where we are required to retain it for legal or accounting purposes (e.g. invoices, which are retained for 7 years under Dutch tax law).
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white uppercase tracking-widest">7. Your Rights (GDPR)</h2>
          <p className="text-sm">
            As a user in the European Economic Area, you have the following rights regarding your personal data:
          </p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li><strong>Right of access</strong> - you can request a copy of the data we hold about you</li>
            <li><strong>Right to rectification</strong> - you can ask us to correct inaccurate data</li>
            <li><strong>Right to erasure</strong> - you can request deletion of your personal data</li>
            <li><strong>Right to restriction</strong> - you can ask us to limit how we use your data</li>
            <li><strong>Right to data portability</strong> - you can request your data in a machine-readable format</li>
            <li><strong>Right to object</strong> - you can object to processing based on legitimate interests</li>
          </ul>
          <p className="text-sm">
            To exercise any of these rights, please contact us at zippytype@googlegroups.com. We will respond within 30 days.
          </p>
          <p className="text-sm">
            You also have the right to lodge a complaint with the Dutch Data Protection Authority (Autoriteit Persoonsgegevens) at https://autoriteitpersoonsgegevens.nl.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white uppercase tracking-widest">8. Cookies</h2>
          <p className="text-sm">
            ZippyType uses the following types of cookies:
          </p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li><strong>Essential cookies:</strong> required for authentication and session management. Without these, the service cannot function.</li>
            <li><strong>Functional cookies:</strong> used to remember your preferences such as display settings (e.g. dark mode). These are not strictly necessary but improve your experience.</li>
          </ul>
          <p className="text-sm">
            We do not use advertising or tracking cookies. Vercel Analytics operates without cookies.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white uppercase tracking-widest">9. Data Security</h2>
          <p className="text-sm">
            We take the security of your data seriously. We use HTTPS encryption for all data in transit and rely on industry-standard security practices provided by Supabase (our authentication and database provider) and Vercel (our hosting provider).
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white uppercase tracking-widest">10. Children's Privacy</h2>
          <p className="text-sm">
            ZippyType is not directed at children under the age of 16. We do not knowingly collect personal data from children under 16. If you believe a child has provided us with personal data, please contact us so we can delete it.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white uppercase tracking-widest">11. Changes to this Policy</h2>
          <p className="text-sm">
            We may update this Privacy Policy from time to time. When we do, we will update the 'Last updated' date at the top of this page. We encourage you to review this policy periodically.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white uppercase tracking-widest">12. Contact</h2>
          <p className="text-sm">
            If you have any questions about this Privacy Policy or how we handle your data, please contact us:
          </p>
          <div className="text-sm mt-2">
            <p><strong>ZippyType</strong></p>
            <p>Email: zippytype@googlegroups.com</p>
            <p>Website: https://zippytype.vercel.app</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
