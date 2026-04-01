import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Shield, Clock, Award, ChevronRight, Phone } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { CLINIC_INFO, SERVICES, REVIEWS } from "@/lib/constants";
import heroImg from "@/assets/hero-dental.jpg";
import doctorImg from "@/assets/doctor.jpg";

const serviceIcons: Record<string, string> = {
  "dental-implants": "🦷",
  "root-canal": "🔬",
  "orthodontics": "😬",
  "smile-designing": "✨",
  "tooth-whitening": "🌟",
  "scaling-polishing": "🪥",
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const Home = () => {
  return (
    <>
      <SEOHead
        title="Best Dental Clinic in Garia, South Kolkata"
        description="Smilz Dental Treatment Facility - Trusted dental clinic in Garia Park, Kolkata since 1999. Dental implants, root canal, braces, smile designing. Call 8961775554."
        keywords="dental clinic Garia Kolkata, dentist South Kolkata, best dentist Garia"
        breadcrumbs={[{ name: "Home", url: CLINIC_INFO.website }]}
      />

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Modern dental clinic interior at Smilz Dental Treatment Facility Garia Kolkata"
            className="w-full h-full object-cover"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-hero" />
        </div>
        <div className="relative container-narrow mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <p className="text-dental-gold font-semibold text-sm uppercase tracking-wider mb-4">
              {CLINIC_INFO.tagline}
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-primary-foreground leading-tight mb-6">
              Your Trusted <span className="text-dental-gold">Dental Partner</span> in South Kolkata
            </h1>
            <p className="text-lg text-primary-foreground/85 mb-8 max-w-xl">
              Comprehensive, affordable dental care since {CLINIC_INFO.yearEstablished}. From routine check-ups to advanced treatments, we deliver exceptional results with a gentle touch.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href={`https://wa.me/${CLINIC_INFO.whatsapp}?text=Hi, I would like to book an appointment.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-accent text-accent-foreground px-7 py-3.5 rounded-lg font-semibold text-base hover:opacity-90 transition-opacity"
              >
                Book Appointment
              </a>
              <a
                href={`tel:${CLINIC_INFO.phone}`}
                className="inline-flex items-center gap-2 border-2 border-primary-foreground/40 text-primary-foreground px-7 py-3.5 rounded-lg font-semibold text-base hover:bg-primary-foreground/10 transition-colors"
              >
                <Phone className="h-4 w-4" />
                Call Now
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-6 mt-10">
              {[
                { icon: Star, label: `${CLINIC_INFO.googleRating} Google Rating` },
                { icon: Clock, label: `Since ${CLINIC_INFO.yearEstablished}` },
                { icon: Shield, label: "Advanced Technology" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-primary-foreground/80 text-sm">
                  <Icon className="h-5 w-5 text-dental-gold" />
                  <span className="font-medium">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section-padding bg-dental-surface">
        <div className="container-narrow mx-auto">
          <div className="text-center mb-14">
            <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-2">What We Offer</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              Comprehensive Dental Services
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              From preventive care to advanced procedures, we provide complete dental solutions for your entire family.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service, i) => (
              <motion.div
                key={service.id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
              >
                <Link
                  to={`/services/${service.id}`}
                  className="group block bg-card rounded-xl p-6 shadow-card hover:shadow-hover transition-all duration-300 h-full"
                >
                  <div className="text-4xl mb-4">{serviceIcons[service.id]}</div>
                  <h3 className="text-lg font-heading font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                    {service.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">{service.shortDesc}</p>
                  <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    Learn More <ChevronRight className="h-4 w-4" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="section-padding">
        <div className="container-narrow mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img
                src={doctorImg}
                alt="Dr. Dibyendu Dutta at Smilz Dental Treatment Facility"
                className="rounded-2xl shadow-elevated w-full"
                loading="lazy"
                width={800}
                height={1024}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-2">About Us</p>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-6">
                Your Trusted Dental Partner Since 1999
              </h2>
              <p className="text-muted-foreground mb-4">
                Located at <strong>21, Garia Park, South Kolkata</strong>, Smilz Dental Treatment Facility has been a trusted name in dental care for over 25 years. Led by <strong>{CLINIC_INFO.doctorName}</strong>, we deliver top-notch dental services with precision, care, and honesty.
              </p>
              <ul className="space-y-3 mb-6">
                {[
                  "Comprehensive dental solutions for all ages",
                  "Affordable pricing with transparent treatment plans",
                  "Latest dental technology and equipment",
                  "Personalized, appointment-based patient care",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-foreground">
                    <Award className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                Learn More About Us
                <ChevronRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="section-padding bg-dental-surface">
        <div className="container-narrow mx-auto">
          <div className="text-center mb-14">
            <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-2">Patient Testimonials</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              What Our Patients Say
            </h2>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-dental-gold text-dental-gold" />
                ))}
              </div>
              <span className="text-foreground font-semibold">{CLINIC_INFO.googleRating}</span>
              <span className="text-muted-foreground">({CLINIC_INFO.reviewCount} reviews on Google)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {REVIEWS.map((review, i) => (
              <motion.div
                key={review.name}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                className="bg-card rounded-xl p-6 shadow-card"
              >
                <div className="flex mb-3">
                  {[...Array(review.rating)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-dental-gold text-dental-gold" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-4">"{review.text}"</p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-foreground">{review.name}</span>
                  <span className="text-xs text-muted-foreground">{review.date}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <a
              href={CLINIC_INFO.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium text-sm hover:underline"
            >
              See all reviews on Google →
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary" />
        <div className="relative container-narrow mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground mb-4">
            Ready for a Healthier Smile?
          </h2>
          <p className="text-primary-foreground/85 max-w-xl mx-auto mb-8">
            Book your appointment today and experience the Smilz difference. Walk-ins welcome, appointments preferred.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={`https://wa.me/${CLINIC_INFO.whatsapp}?text=Hi, I would like to book an appointment.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-7 py-3.5 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Book on WhatsApp
            </a>
            <a
              href={`tel:${CLINIC_INFO.phone}`}
              className="inline-flex items-center gap-2 border-2 border-primary-foreground/40 text-primary-foreground px-7 py-3.5 rounded-lg font-semibold hover:bg-primary-foreground/10 transition-colors"
            >
              <Phone className="h-4 w-4" />
              {CLINIC_INFO.phoneFormatted}
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
