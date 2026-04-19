import { Video, Phone, MessageSquare } from "lucide-react";

export default function Services() {
  const features = [
    {
      Icon: Video,
      title: "Video Chat",
      description: "Face-to-face conversations with crystal-clear video quality.",
    },
    {
      Icon: Phone,
      title: "Voice Call",
      description: "High-quality audio calls for expert consultations.",
    },
    {
      Icon: MessageSquare,
      title: "Text Chat",
      description: "Quick messaging for instant expert responses.",
    },
  ];

  return (
    <section className="py-24 bg-white" id="services">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 mb-4">
            Our Services
          </span>
          <h2
            className="text-4xl md:text-5xl text-slate-900"
            style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 600 }}
          >
            Seamless Communication
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map(({ Icon, title, description }) => (
            <div
              key={title}
              className="group p-8 border border-slate-200 rounded-xl bg-white hover:border-blue-200 hover:shadow-sm transition-all duration-200"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-5 group-hover:bg-blue-100 transition-colors duration-200">
                <Icon size={20} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}