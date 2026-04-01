import { supabase } from "@/integrations/supabase/client";

/**
 * Seed services data scraped from smilz.net
 * Run this once from browser console or admin panel:
 *   import { seedServices } from '@/lib/seedServices'; seedServices();
 */
export const servicesData = [
  {
    title: "Comprehensive Consultation",
    slug: "comprehensive-consultation",
    icon: "🩺",
    short_desc: "A thorough dental check-up is of utmost importance before any treatment. Get a comprehensive assessment of your dental condition using advanced diagnostic tools.",
    description: `At Smilz, your journey to optimal oral health begins with a thorough dental consultation. You'll benefit from our expert assessment of your dental condition, using advanced diagnostic tools to identify any issues or potential concerns. This personalized approach allows us to create a tailored treatment plan that addresses your specific needs and goals. By understanding your oral health status comprehensively, you'll be empowered to make informed decisions about your dental care.

Book your consultation today at Smilz or Call us at 8961775554.`,
    featured_image: "https://smilz.net/wp-content/uploads/2025/02/Dental-Services-1.png",
    keywords: "dental consultation Kolkata, dental check-up Garia, comprehensive dental examination South Kolkata, dentist consultation near me",
    seo_title: "Comprehensive Dental Consultation in Garia, Kolkata | Smilz",
    seo_description: "Get a thorough dental consultation and comprehensive check-up at Smilz Dental Treatment Facility, Garia, Kolkata. Advanced diagnostic tools for personalized treatment plans. Call 8961775554.",
    sort_order: 1,
    is_active: true,
    is_featured: true,
    faqs: [
      { q: "What happens during a dental consultation?", a: "During your consultation, the dentist examines your teeth, gums, and oral tissues, takes necessary X-rays, and discusses your dental history to create a personalized treatment plan." },
      { q: "How often should I have a dental check-up?", a: "It's recommended to have a check-up every six months. However, your dentist may suggest more frequent visits based on your individual needs." },
    ],
  },
  {
    title: "Preventive Dental Care",
    slug: "preventive-dental-care",
    icon: "🛡️",
    short_desc: "Routine check-ups, scaling and polishing, cavity detection and filling to maintain your healthy smile with preventive dental care services.",
    description: `Maintain your healthy smile with our preventive dental care services. You'll enjoy regular check-ups, professional cleanings, and early detection of potential issues before they become serious problems. Our preventive approach not only saves you from future discomfort but also helps you avoid costly treatments down the line. By investing in preventive care, you're securing long-term oral health and a beautiful smile that lasts.

Our preventive services include routine dental check-ups, scaling and polishing, cavity detection and filling, fluoride treatments, and oral hygiene guidance.`,
    featured_image: "https://smilz.net/wp-content/uploads/2025/03/2025-02-10-123458742462.png",
    keywords: "preventive dental care Kolkata, dental scaling Garia, teeth cleaning South Kolkata, cavity detection Kolkata, dental polishing near me",
    seo_title: "Preventive Dental Care in Garia, Kolkata | Scaling & Polishing | Smilz",
    seo_description: "Professional preventive dental care at Smilz, Garia - routine check-ups, scaling, polishing, cavity detection & filling. Affordable dental cleaning in South Kolkata. Call 8961775554.",
    sort_order: 2,
    is_active: true,
    is_featured: true,
    faqs: [
      { q: "How often should I get my teeth cleaned?", a: "Professional cleaning is recommended every 6 months for most people. Those with gum disease may need more frequent cleanings." },
      { q: "Does scaling damage teeth?", a: "No, professional scaling does not damage teeth. It removes harmful tartar buildup that brushing alone cannot remove." },
    ],
  },
  {
    title: "Cosmetic Dentistry",
    slug: "cosmetic-dentistry",
    icon: "✨",
    short_desc: "Transform your smile with cosmetic fillings, laminates, veneers, zirconia crowns, composites, dental jewellery and more.",
    description: `Transform your smile with our range of cosmetic dentistry services. Whether you're looking for teeth whitening, veneers, or a complete smile makeover, you'll achieve the radiant smile you've always dreamed of. Our cosmetic treatments not only enhance your appearance but also boost your confidence, allowing you to smile freely in any situation. Experience the life-changing effects of a beautiful smile tailored specifically for you.

Our cosmetic services include cosmetic fillings, porcelain laminates, dental veneers, zirconia crowns, composite bonding, dental jewellery, and complete smile makeovers.`,
    featured_image: "https://smilz.net/wp-content/uploads/2025/03/dental-jewel.png",
    keywords: "cosmetic dentistry Kolkata, dental veneers Garia, zirconia crown South Kolkata, smile makeover Kolkata, dental jewellery, teeth whitening Garia",
    seo_title: "Cosmetic Dentistry in Garia, Kolkata | Veneers, Crowns & Smile Makeover | Smilz",
    seo_description: "Expert cosmetic dentistry at Smilz, Garia - veneers, zirconia crowns, laminates, dental jewellery & complete smile makeovers. Transform your smile in South Kolkata. Call 8961775554.",
    sort_order: 3,
    is_active: true,
    is_featured: true,
    faqs: [
      { q: "How long do dental veneers last?", a: "Porcelain veneers can last 10-15 years with proper care, while composite veneers typically last 5-7 years." },
      { q: "Is cosmetic dentistry painful?", a: "Most cosmetic procedures involve minimal discomfort. We use local anesthesia when needed to ensure a pain-free experience." },
    ],
  },
  {
    title: "Restorative Dentistry",
    slug: "restorative-dentistry",
    icon: "🔧",
    short_desc: "Complete dental restoration with fillings, crown and bridges, post core treatments, and cosmetic fillings for damaged or missing teeth.",
    description: `Restore your oral health and function with our advanced restorative dentistry services. From fillings and crowns to bridges and implants, you'll benefit from durable, natural-looking solutions that repair damaged teeth and replace missing ones. Our restorative treatments not only improve your ability to eat and speak comfortably but also prevent further dental issues. Reclaim your confident smile and enjoy the benefits of a fully functional set of teeth.

Our restorative services include all types of fillings, ceramic and zirconia crowns, single and multi-unit bridges, post and core treatments, full-mouth restorations, and cosmetic fillings.`,
    featured_image: "https://smilz.net/wp-content/uploads/2025/03/scaling.png",
    keywords: "restorative dentistry Kolkata, dental crown Garia, dental bridge South Kolkata, tooth filling Kolkata, zirconia crown cost Garia",
    seo_title: "Restorative Dentistry in Garia, Kolkata | Crowns, Bridges & Fillings | Smilz",
    seo_description: "Expert restorative dentistry at Smilz, Garia - crowns, bridges, fillings, post core & full-mouth restoration. Durable, natural-looking dental solutions in South Kolkata. Call 8961775554.",
    sort_order: 4,
    is_active: true,
    is_featured: true,
    faqs: [
      { q: "What's the difference between a crown and a veneer?", a: "A crown covers the entire tooth providing full protection, while a veneer only covers the front surface for cosmetic improvement." },
      { q: "How long does a dental crown last?", a: "With proper care, dental crowns can last 10-15 years or even longer. Zirconia crowns are especially durable." },
    ],
  },
  {
    title: "Orthodontic Braces",
    slug: "orthodontic-braces",
    icon: "😬",
    short_desc: "Affordable orthodontic corrections and braces for children and adults. Achieve a perfectly aligned smile with traditional braces.",
    description: `Achieve a perfectly aligned smile with our orthodontic treatments. Whether you prefer traditional braces or clear aligners, you'll benefit from our expertise in correcting misaligned teeth and jaw issues. Straightening your teeth not only enhances your appearance but also improves your oral health by making it easier to clean and maintain your teeth. Invest in a straighter smile that boosts your confidence and overall well-being.

Smilz offers advanced orthodontic solutions including metal braces, ceramic braces, self-ligating braces, and lingual braces for all ages. Our treatment plans are customized for each patient.`,
    featured_image: "https://smilz.net/wp-content/uploads/2025/03/122.jpg",
    keywords: "orthodontic braces Kolkata, dental braces Garia, teeth alignment South Kolkata, braces cost Kolkata, orthodontist near me Garia",
    seo_title: "Orthodontic Braces in Garia, Kolkata | Affordable Teeth Alignment | Smilz",
    seo_description: "Affordable orthodontic braces for children and adults at Smilz, Garia. Metal, ceramic & self-ligating braces for perfect teeth alignment in South Kolkata. Call 8961775554.",
    sort_order: 5,
    is_active: true,
    is_featured: true,
    faqs: [
      { q: "How long does orthodontic treatment take?", a: "Treatment duration varies from 6 months to 2 years depending on the complexity of the case." },
      { q: "Is it too late for me to get braces as an adult?", a: "It's never too late! We offer orthodontic solutions for all ages, including discreet options like clear aligners." },
    ],
  },
  {
    title: "Pediatric Dentistry",
    slug: "pediatric-dentistry",
    icon: "👶",
    short_desc: "Specialized dental care for children in a gentle, child-friendly environment. Start your child's dental journey when there is no pain.",
    description: `Give your child the gift of excellent oral health with our specialized pediatric dentistry services. You'll appreciate our gentle approach and child-friendly environment that helps kids feel comfortable and even excited about dental visits. Our preventive focus and early intervention strategies ensure your child develops healthy oral habits and a positive attitude towards dental care. Set the foundation for a lifetime of healthy smiles for your little ones.

We recommend starting dental visits early — when there is no pain — so children develop a positive association with the dentist. Our services include routine check-ups, fluoride treatments, sealants, cavity fillings, and space maintainers.`,
    featured_image: "https://smilz.net/wp-content/uploads/2025/03/close-up-of-child-during-dental-checkup-SBI-300905764-1-1024x683.jpg",
    keywords: "pediatric dentist Kolkata, children dentist Garia, child dental care South Kolkata, kids dentist near me, baby teeth treatment Kolkata",
    seo_title: "Pediatric Dentistry in Garia, Kolkata | Child Dental Care | Smilz",
    seo_description: "Specialized pediatric dentistry for children at Smilz, Garia. Gentle, child-friendly dental care including check-ups, fluoride treatments & fillings in South Kolkata. Call 8961775554.",
    sort_order: 6,
    is_active: true,
    is_featured: true,
    faqs: [
      { q: "At what age should I take my child to the dentist?", a: "We recommend the first dental visit by age 1 or within 6 months of the first tooth appearing." },
      { q: "Can you treat children at your facility?", a: "Absolutely! We offer specialized pediatric dentistry services to cater to the unique needs of children and ensure they have a positive dental experience." },
    ],
  },
  {
    title: "Clear Aligners",
    slug: "clear-aligners",
    icon: "🦷",
    short_desc: "Achieve the perfect smile with clear aligners. State-of-the-art invisible orthodontic technology for a seamless experience.",
    description: `Achieve the perfect smile with Clear Aligners at Smilz Dental Treatment Facility, Kolkata. Our state-of-the-art technology and personalized care ensure a seamless and effective orthodontic experience. Discover the advantages of clear aligners and transform your smile with confidence.

Clear aligners are virtually invisible, removable, and comfortable. They offer a discreet alternative to traditional braces for correcting misaligned teeth. Our customized treatment plans use 3D scanning technology for precise results.`,
    featured_image: "https://smilz.net/wp-content/uploads/2025/02/aligners-819x1024.jpg",
    keywords: "clear aligners Kolkata, invisible braces Garia, Invisalign South Kolkata, aligner treatment cost Kolkata, teeth straightening without braces",
    seo_title: "Clear Aligners in Garia, Kolkata | Invisible Teeth Straightening | Smilz",
    seo_description: "Get clear aligners for invisible teeth straightening at Smilz, Garia. State-of-the-art aligner technology, personalized care in South Kolkata. Call 8961775554.",
    sort_order: 7,
    is_active: true,
    is_featured: true,
    faqs: [
      { q: "How long do I need to wear aligners?", a: "Treatment typically takes 6-18 months. Aligners should be worn 20-22 hours per day for optimal results." },
      { q: "Are clear aligners as effective as braces?", a: "Yes, for most cases clear aligners are as effective as traditional braces. Your dentist will advise the best option for your specific needs." },
    ],
  },
  {
    title: "Dental Implants",
    slug: "dental-implants",
    icon: "🦷",
    short_desc: "Single tooth, multi-tooth, implant-supported bridges, full mouth rehabilitation and advanced stent-guided implants for maximum precision.",
    description: `Smilz provides all types of dental implants that suit you at all price ranges. Single tooth implants, multi-tooth implants, implant-supported bridges, implant-supported complete dentures, full mouth implants and the most advanced stent-guided implants for maximum success and precision.

Dental implants are the gold standard for replacing missing teeth. They look, feel, and function like natural teeth. Our experienced team uses the latest implant technology and techniques to ensure the highest success rates. Whether you're missing one tooth or need full-mouth rehabilitation, we have the right implant solution for you.`,
    featured_image: "https://smilz.net/wp-content/uploads/2025/03/odonto-31-1.png",
    keywords: "dental implants Kolkata, tooth implant Garia, implant cost South Kolkata, full mouth implants Kolkata, stent guided implants, implant supported dentures Garia",
    seo_title: "Dental Implants in Garia, Kolkata | Affordable Tooth Implant Cost | Smilz",
    seo_description: "Expert dental implants at Smilz, Garia - single tooth, multi-tooth, implant-supported bridges & stent-guided implants. Affordable implant cost in South Kolkata. Call 8961775554.",
    sort_order: 8,
    is_active: true,
    is_featured: true,
    faqs: [
      { q: "Are dental implants safe?", a: "Yes, dental implants are a safe and effective solution for missing teeth. They've been used successfully for decades and have a high success rate." },
      { q: "How long do dental implants last?", a: "With proper care and maintenance, dental implants can last a lifetime. Regular check-ups and good oral hygiene are essential for their longevity." },
    ],
  },
  {
    title: "Root Canal Treatment",
    slug: "root-canal",
    icon: "🔬",
    short_desc: "Don't let tooth pain control your life. Expert root canal treatment offers a safe and effective solution to save your natural tooth.",
    description: `Don't let tooth pain control your life. Smilz's expert Root Canal Treatment offers a safe and effective solution to save your natural tooth and alleviate discomfort.

Root canal treatment (endodontic therapy) removes infected or damaged tissue from inside the tooth, cleans and disinfects the canal, and seals it to prevent future infection. Modern root canal procedures are virtually painless and are completed in one or two visits. Saving your natural tooth through root canal treatment is always preferable to extraction.`,
    featured_image: "https://smilz.net/wp-content/uploads/2025/02/odonto-2-1024x683.png",
    keywords: "root canal treatment Kolkata, root canal Garia, RCT cost South Kolkata, painless root canal near me, endodontic treatment Kolkata",
    seo_title: "Root Canal Treatment in Garia, Kolkata | Painless RCT | Smilz",
    seo_description: "Painless root canal treatment (RCT) at Smilz, Garia. Save your natural tooth with expert endodontic care in South Kolkata. Affordable RCT cost. Call 8961775554.",
    sort_order: 9,
    is_active: true,
    is_featured: false,
    faqs: [
      { q: "Is root canal treatment painful?", a: "Modern root canal treatment is virtually painless. We use local anesthesia to ensure complete comfort during the procedure." },
      { q: "How many visits does a root canal take?", a: "Most root canal treatments can be completed in one or two visits, depending on the complexity of the case." },
    ],
  },
  {
    title: "Crown & Bridge",
    slug: "crown-bridge",
    icon: "👑",
    short_desc: "Ceramic or zirconia single dental crowns, multi-unit bridges, or full-mouth restoration with precision, aesthetics and lasting results.",
    description: `Whether you need a ceramic or zirconia, single dental crown, a multi-unit bridge, or full-mouth restoration, Smilz ensures precision, aesthetics, and long-lasting results.

Dental crowns protect and restore damaged teeth, while bridges replace one or more missing teeth by anchoring to adjacent teeth. We offer metal-free ceramic crowns, ultra-strong zirconia crowns, porcelain-fused-to-metal crowns, and full-arch bridges for comprehensive restoration.`,
    featured_image: "https://smilz.net/wp-content/uploads/2025/03/scaling-1024x1024.png",
    keywords: "dental crown Kolkata, dental bridge Garia, zirconia crown cost South Kolkata, ceramic crown near me, tooth cap Kolkata",
    seo_title: "Crown & Bridge in Garia, Kolkata | Zirconia & Ceramic Crowns | Smilz",
    seo_description: "Premium dental crowns and bridges at Smilz, Garia - zirconia, ceramic & PFM crowns, multi-unit bridges. Precision aesthetics in South Kolkata. Call 8961775554.",
    sort_order: 10,
    is_active: true,
    is_featured: false,
    faqs: [],
  },
  {
    title: "Scaling, Polishing & Tooth Whitening",
    slug: "scaling-polishing-whitening",
    icon: "🌟",
    short_desc: "Professional dental scaling, polishing, and tooth whitening treatments for a healthy, dazzling smile.",
    description: `Are you longing for a healthy, dazzling smile? Smilz Dental Treatment Facility provides professional dental scaling, polishing, and tooth whitening treatments.

Scaling removes tartar and plaque buildup from teeth surfaces and below the gum line. Polishing smoothens tooth surfaces to prevent future plaque accumulation. Professional tooth whitening brightens your smile by several shades in a single visit. We use safe, clinically proven whitening agents for lasting results.`,
    featured_image: "https://smilz.net/wp-content/uploads/2025/03/odonto-44-1024x683.png",
    keywords: "teeth whitening Kolkata, dental scaling Garia, teeth polishing South Kolkata, professional teeth cleaning near me, tooth whitening cost Kolkata",
    seo_title: "Scaling, Polishing & Teeth Whitening in Garia, Kolkata | Smilz",
    seo_description: "Professional teeth scaling, polishing & whitening at Smilz, Garia. Get a brighter, healthier smile in South Kolkata. Affordable dental cleaning. Call 8961775554.",
    sort_order: 11,
    is_active: true,
    is_featured: false,
    faqs: [
      { q: "How long does teeth whitening last?", a: "Professional teeth whitening can last anywhere from 6 months to 2 years, depending on your lifestyle habits and oral hygiene routine." },
      { q: "Is teeth whitening safe?", a: "Yes, professional teeth whitening is safe when performed by a qualified dentist. We use high-quality products and customize the treatment to ensure safety and effectiveness." },
    ],
  },
  {
    title: "Smile Designing",
    slug: "smile-designing",
    icon: "😁",
    short_desc: "Achieve the smile of your dreams with comprehensive smile designing services including veneers, whitening, and complete makeovers.",
    description: `Achieve the smile of your dreams with Smilz Dental Treatment Facility's comprehensive smile designing services. A smile makeover combines multiple cosmetic and restorative procedures to completely transform your smile.

Our smile designing process begins with a detailed analysis of your facial features, lip line, tooth proportions, and gum health. We then create a customized treatment plan that may include teeth whitening, veneers, crowns, gum contouring, and orthodontic corrections to achieve your ideal smile.`,
    featured_image: "https://smilz.net/wp-content/uploads/2025/02/Dental-Services-1024x1024.png",
    keywords: "smile designing Kolkata, smile makeover Garia, dental smile design South Kolkata, cosmetic smile correction near me",
    seo_title: "Smile Designing in Garia, Kolkata | Complete Smile Makeover | Smilz",
    seo_description: "Complete smile designing and makeover at Smilz, Garia. Transform your smile with veneers, whitening & cosmetic dentistry in South Kolkata. Call 8961775554.",
    sort_order: 12,
    is_active: true,
    is_featured: false,
    faqs: [],
  },
  {
    title: "Oral & Dental Surgery",
    slug: "oral-dental-surgery",
    icon: "⚕️",
    short_desc: "From normal extraction to surgical wisdom tooth removal, abscess drainage, fracture repair, gum surgery and emergency care.",
    description: `From normal dental extraction to surgical third molar removal, abscess drainage, fracture repair, gum surgery, and accident emergencies — Smilz takes care of all your oral surgery needs.

Our oral surgery services include simple and surgical extractions, wisdom tooth removal, abscess incision and drainage, jaw fracture management, gum surgery (gingivectomy, flap surgery), frenectomy, and emergency dental trauma care. All procedures are performed with modern techniques and proper anesthesia for maximum comfort.`,
    featured_image: "https://smilz.net/wp-content/uploads/2025/02/Imagem-Odontologia-alta-resolcao-501-1024x1024.jpg",
    keywords: "dental surgery Kolkata, wisdom tooth removal Garia, tooth extraction South Kolkata, oral surgery near me, dental emergency Kolkata",
    seo_title: "Oral & Dental Surgery in Garia, Kolkata | Wisdom Tooth Removal | Smilz",
    seo_description: "Expert oral & dental surgery at Smilz, Garia - extractions, wisdom tooth removal, gum surgery & emergency care in South Kolkata. Call 8961775554.",
    sort_order: 13,
    is_active: true,
    is_featured: false,
    faqs: [
      { q: "Is tooth extraction painful?", a: "With modern anesthesia, tooth extraction is virtually painless. You may experience mild discomfort after the procedure which can be managed with prescribed medication." },
      { q: "What should I do in case of a dental emergency?", a: "Contact our office immediately at 8961775554. We offer emergency dental services and will provide guidance on managing the situation until you can be seen." },
    ],
  },
  {
    title: "General Dentistry",
    slug: "general-dentistry",
    icon: "🏥",
    short_desc: "Comprehensive general dentistry for all your oral health needs — from routine check-ups to advanced treatments at Smilz.",
    description: `At Smilz Dental Treatment Facility, located in the heart of Garia, Kolkata, we pride ourselves on being a trusted destination for all your general dentistry needs. Our goal is to provide a full spectrum of dental care, ensuring your oral health is maintained with the highest standards of expertise and compassion. From routine check-ups to advanced treatments, we are committed to delivering personalized care tailored to each patient's needs.

General dentistry encompasses all aspects of dental care including preventive check-ups, fillings, extractions, gum care, and oral health education. Regular visits to a general dentist are the foundation of good oral health.`,
    featured_image: "https://smilz.net/wp-content/uploads/2025/01/image1-1024x574.png",
    keywords: "general dentistry Kolkata, dentist Garia, dental care South Kolkata, dental clinic near me, family dentist Kolkata",
    seo_title: "General Dentistry in Garia, Kolkata | Family Dental Care | Smilz",
    seo_description: "Comprehensive general dentistry at Smilz, Garia - routine check-ups, fillings, extractions & complete oral care for all ages in South Kolkata. Call 8961775554.",
    sort_order: 14,
    is_active: true,
    is_featured: false,
    faqs: [],
  },
  {
    title: "Dental Gaps Correction",
    slug: "dental-gaps",
    icon: "🔗",
    short_desc: "Close your gaps and spread your smile. Comprehensive correction of dental gaps using bridges, implants, and orthodontics.",
    description: `Close your gaps and spread your smile! Smilz provides comprehensive correction of dental gaps using modern dental techniques.

Gaps between teeth (diastema) can be corrected through multiple approaches depending on the cause and size of the gap. Options include dental bonding, porcelain veneers, dental bridges, orthodontic treatment, and dental implants. Our team will evaluate your specific case and recommend the most effective solution.`,
    featured_image: "https://smilz.net/wp-content/uploads/2025/02/Dental-Services-1.png",
    keywords: "dental gap correction Kolkata, diastema treatment Garia, teeth gap filling South Kolkata, gap teeth treatment near me",
    seo_title: "Dental Gaps Correction in Garia, Kolkata | Close Teeth Gaps | Smilz",
    seo_description: "Expert dental gap correction at Smilz, Garia - close teeth gaps with bonding, veneers, bridges & orthodontics in South Kolkata. Call 8961775554.",
    sort_order: 15,
    is_active: true,
    is_featured: false,
    faqs: [],
  },
];

export async function seedServices() {
  for (const svc of servicesData) {
    const { data: existing } = await supabase
      .from("services")
      .select("id")
      .eq("slug", svc.slug)
      .maybeSingle();

    if (existing) {
      await supabase.from("services").update(svc).eq("id", existing.id);
    } else {
      await supabase.from("services").insert(svc);
    }
  }
  return { success: true, count: servicesData.length };
}
