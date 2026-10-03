import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare } from 'lucide-react';

export function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 text-white shadow-lg mb-3">
          <MessageSquare className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">Get in Touch</h1>
        <p className="text-gray-500 mt-2">Have questions? We'd love to hear from you.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { icon: Mail, label: 'Email', value: 'support@yatraai.com' },
          { icon: Phone, label: 'Phone', value: '+91 98765 43210' },
          { icon: MapPin, label: 'Address', value: 'Bengaluru, Karnataka, India' },
        ].map((item) => (
          <div key={item.label} className="card p-6 text-center">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-700 mb-3">
              <item.icon className="h-5 w-5" />
            </div>
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="font-semibold text-gray-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="card p-8">
        {sent && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-success-50 border border-success-200 px-4 py-3 text-sm text-success-700">
            <CheckCircle2 className="h-5 w-5" /> Thank you! Your message has been sent. We'll get back to you soon.
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Your name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="you@example.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
            <input type="text" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input-field" placeholder="What's this about?" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
            <textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input-field min-h-[120px] resize-y" placeholder="Tell us how we can help..." />
          </div>
          <button type="submit" className="btn-primary w-full">
            <Send className="h-5 w-5" /> Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
