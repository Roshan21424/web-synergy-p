import { Search, CreditCard, MessageCircle } from "lucide-react";

const steps = [
  {
    n: "01",
    icon: Search,
    title: "Find Your Expert",
    text: "Browse our curated list of verified professionals. Filter by expertise, ratings, and availability to find your perfect match.",
  },
  {
    n: "02",
    icon: CreditCard,
    title: "Pay Securely",
    text: "Complete the payment process with transparent pricing. Only pay for the time you use, with rates shown upfront.",
  },
  {
    n: "03",
    icon: MessageCircle,
    title: "Start Your Session",
    text: "Connect instantly via video, voice, or chat. Get personalized guidance and expert insights in real time.",
  },
];

export default function ProcessSteps() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 mb-4">
            How It Works
          </span>
          <h2
            className="text-4xl md:text-5xl text-slate-900"
            style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600 }}
          >
            Three Simple Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map(({ n, icon: Icon, title, text }) => (
            <div key={n} className="bg-white border border-slate-200 rounded-xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <span
                  className="text-4xl text-slate-200"
                  style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 700 }}
                >
                  {n}
                </span>
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Icon size={18} className="text-blue-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}