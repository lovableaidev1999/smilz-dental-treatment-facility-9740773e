import { Link } from "react-router-dom";
import { Star, ShieldCheck, Award, Calendar, MessageCircle } from "lucide-react";

interface LandingHeroProps {
  eyebrow: string;
  h1: string;
  subhead: string;
  imageSrc?: string;
  imageAlt: string;
  whatsappMessage: string;
  phone?: string;
}

const LandingHero = ({
  eyebrow,
  h1,
  subhead,
  imageSrc = "/images/hero-dental.webp",
  imageAlt,
  whatsappMessage,
  phone = "918961775554",
}: LandingHeroProps) => {
  const wa = `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}`;
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#0f2547] to-[#1A365D] text-white">
      <div className="container mx-auto px-4 py-14 md:py-20 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-300">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl md:text-5xl font-bold leading-tight font-heading">
            {h1}
          </h1>
          <p className="mt-4 text-base md:text-lg text-white/85 max-w-xl">
            {subhead}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/contact/"
              className="inline-flex items-center gap-2 rounded-md bg-amber-400 px-5 py-3 text-sm font-semibold text-[#1A365D] hover:bg-amber-300 transition"
            >
              <Calendar className="h-4 w-4" aria-hidden="true" />
              Book Appointment
            </Link>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-dental-green px-5 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              WhatsApp Inquiry
            </a>
          </div>

          <ul className="mt-8 flex flex-wrap gap-4 text-sm text-white/90">
            <li className="inline-flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-300" aria-hidden="true" />
              4.8★ on Google (44+ reviews)
            </li>
            <li className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-300" aria-hidden="true" />
              Serving Garia &amp; South Kolkata since 1999
            </li>
            <li className="inline-flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-300" aria-hidden="true" />
              5000+ patients treated
            </li>
          </ul>
        </div>

        <div className="relative">
          <img
            src={imageSrc}
            alt={imageAlt}
            width={640}
            height={480}
            loading="eager"
            className="w-full h-auto rounded-xl shadow-2xl ring-1 ring-white/10 object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
