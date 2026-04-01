import { motion } from "framer-motion";
import { Award, Heart, Shield, Users } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { CLINIC_INFO } from "@/lib/constants";
import doctorImg from "@/assets/doctor.jpg";

const About = () => {
  return (
    <>
      <SEOHead
        title="About Us - Dr. Dibyendu Dutta"
        description="Learn about Smilz Dental Treatment Facility, led by Dr. Dibyendu Dutta. Trusted dental care in Garia, South Kolkata since 1999. 25+ years of experience."
        keywords="best dentist Garia, Dr Dibyendu Dutta, dental clinic South Kolkata"
        canonicalUrl={`${CLINIC_INFO.website}/about`}
        breadcrumbs={[
          { name: "Home", url: CLINIC_INFO.website },
          { name: "About Us", url: `${CLINIC_INFO.website}/about` },
        ]}
      />

      <section className="bg-gradient-primary text-primary-foreground section-padding">
        <div className="container-narrow mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">About Us</h1>
          <p className="text-primary-foreground/85 max-w-xl mx-auto">
            Over 25 years of dedicated dental care in the heart of Garia, South Kolkata.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-narrow mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <motion.img
              src={doctorImg}
              alt="Dr. Dibyendu Dutta - Dentist at Smilz Dental Garia Kolkata"
              className="rounded-2xl shadow-elevated w-full"
              loading="lazy"
              width={800}
              height={1024}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            />
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-heading font-bold text-foreground mb-4">
                Meet {CLINIC_INFO.doctorName}
              </h2>
              <p className="text-muted-foreground mb-4">
                With over 25 years of experience in dentistry, {CLINIC_INFO.doctorName} founded Smilz Dental Treatment Facility in {CLINIC_INFO.yearEstablished} with a vision to provide accessible, honest, and high-quality dental care to the community of South Kolkata.
              </p>
              <p className="text-muted-foreground mb-4">
                Conveniently situated in the heart of Garia at <strong>21, Garia Park, Kolkata 700084</strong>, our clinic is equipped with the latest dental technologies to provide the most effective treatments with precision and care.
              </p>
              <p className="text-muted-foreground">
                At Smilz, we believe exceptional dental care should be accessible to everyone. Our goal is to provide high-quality treatments that combine cutting-edge technology with a personalized and thoughtful approach to dentistry.
              </p>
            </motion.div>
          </div>

          {/* Values */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Heart, title: "Patient-Centric", desc: "Every patient receives undivided attention and personalized care." },
              { icon: Shield, title: "Honest Care", desc: "Transparent treatment plans with no unnecessary procedures." },
              { icon: Award, title: "25+ Years", desc: "Trusted expertise serving Garia and South Kolkata since 1999." },
              { icon: Users, title: "Family Friendly", desc: "Comprehensive dental solutions for patients of all ages." },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-xl p-6 shadow-card text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary mb-4">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
