import React from 'react';
import Link from 'next/link';
import {
  Landmark, Brain, CreditCard, MessageSquare, MapPin,
  Cloud, Shield, Truck, ArrowRight
} from 'lucide-react';



const categories = [
  {
    id: 'cat-government',
    icon: Landmark,
    label: 'Government',
    count: '340+ APIs',
    description: 'UIDAI, GSTN, DigiLocker, India Post & more',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20',
    hoverBorder: 'hover:border-violet-500/40',
  },
  {
    id: 'cat-ai',
    icon: Brain,
    label: 'AI / ML',
    count: '180+ APIs',
    description: 'LLMs, vision, speech, embeddings',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    hoverBorder: 'hover:border-blue-500/40',
  },
  {
    id: 'cat-payments',
    icon: CreditCard,
    label: 'Payments',
    count: '95+ APIs',
    description: 'UPI, NEFT, IMPS, payment gateways',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    hoverBorder: 'hover:border-amber-500/40',
  },
  {
    id: 'cat-messaging',
    icon: MessageSquare,
    label: 'Messaging',
    count: '72+ APIs',
    description: 'SMS, WhatsApp, email, push notifications',
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/20',
    hoverBorder: 'hover:border-sky-500/40',
  },
  {
    id: 'cat-location',
    icon: MapPin,
    label: 'Location & Maps',
    count: '58+ APIs',
    description: 'Geocoding, routing, pincode, geofencing',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    hoverBorder: 'hover:border-emerald-500/40',
  },
  {
    id: 'cat-weather',
    icon: Cloud,
    label: 'Weather & Climate',
    count: '44+ APIs',
    description: 'IMD data, forecasts, historical weather',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
    hoverBorder: 'hover:border-cyan-500/40',
  },
  {
    id: 'cat-security',
    icon: Shield,
    label: 'Security & Fraud',
    count: '63+ APIs',
    description: 'OTP, fraud scoring, device fingerprinting',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/20',
    hoverBorder: 'hover:border-rose-500/40',
  },
  {
    id: 'cat-logistics',
    icon: Truck,
    label: 'Logistics',
    count: '81+ APIs',
    description: 'Shipment tracking, courier aggregators',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
    hoverBorder: 'hover:border-orange-500/40',
  },
];

export default function CategoriesSection() {
  return (
    <section className="py-20 xl:py-28 dark:bg-[#080f20]/40 bg-slate-100/60 transition-colors duration-300">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 xl:px-10 2xl:px-16">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-2">
            Browse by Category
          </p>
          <h2 className="text-3xl xl:text-4xl font-bold dark:text-white text-slate-900 mb-3">
            Every API category, covered
          </h2>
          <p className="dark:text-slate-400 text-slate-600 text-base max-w-xl mx-auto">
            From government data portals to cutting-edge AI models — find the exact API your product needs.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 xl:gap-4">
          {categories?.map((cat) => {
            const Icon = cat?.icon;
            return (
              <Link
                key={cat?.id}
                href="/api-marketplace"
                className={`
                  group flex flex-col p-5 dark:bg-[#080f20] bg-white border rounded-2xl
                  transition-all duration-300 ${cat?.borderColor} ${cat?.hoverBorder}
                  hover:-translate-y-0.5 hover:shadow-lg
                `}
              >
                <div className={`w-10 h-10 rounded-xl ${cat?.bgColor} flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300`}>
                  <Icon size={18} className={cat?.color} />
                </div>
                <h3 className="text-sm font-semibold dark:text-white text-slate-900 mb-0.5">{cat?.label}</h3>
                <p className={`text-xs font-semibold ${cat?.color} mb-2`}>{cat?.count}</p>
                <p className="text-xs dark:text-slate-500 text-slate-500 leading-relaxed">{cat?.description}</p>
                <div className={`mt-3 flex items-center gap-1 text-xs font-medium ${cat?.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  Browse
                  <ArrowRight size={10} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
