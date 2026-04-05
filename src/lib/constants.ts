// SEO and clinic data constants
export const CLINIC_INFO = {
  name: "Smilz Dental Treatment Facility",
  tagline: "Bridging Gaps... Spreading Smiles!",
  address: "21, Garia Park, Kolkata 700084",
  addressFull: "21, Garia Park, Garia Park Buddha Temple, Garia, South Kolkata 700084",
  phone: "8961775554",
  phoneFormatted: "8961 77 5554",
  emergency: "9831070248",
  email: "dr.d.dutta@gmail.com",
  whatsapp: "918961775554",
  website: "https://smilz.net",
  googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Smilz+Dental+Treatment+Facility",
  googleRating: 4.8,
  reviewCount: 44,
  yearEstablished: 1999,
  doctorName: "Dr. Dibyendu Dutta",
  hours: {
    morning: "9:00 AM – 1:00 PM",
    evening: "5:00 PM – 9:00 PM",
    days: "Monday – Saturday",
    closed: "Sunday",
  },
  coordinates: {
    lat: 22.4625,
    lng: 88.3942,
  },
};

export const SERVICES = [
  {
    id: "dental-implants",
    title: "Dental Implants",
    shortDesc: "Affordable dental implant treatments with stent-guided placement for complex cases.",
    description: "Smilz provides Dental Implant treatments at a reasonable price. We also provide Stent Guided Implant placement for complicated Implant treatments. Dental implants are the gold standard for replacing missing teeth, providing a permanent solution that looks, feels, and functions like natural teeth.",
    icon: "implant",
    keywords: "dental implants Kolkata cost",
    faqs: [
      { q: "How much do dental implants cost in Kolkata?", a: "The cost of dental implants at Smilz varies depending on the type and complexity. We offer competitive pricing starting from affordable ranges. Contact us for a personalized quote." },
      { q: "How long do dental implants last?", a: "With proper care, dental implants can last a lifetime. They are designed to be a permanent solution for missing teeth." },
      { q: "Is the implant procedure painful?", a: "The procedure is performed under local anesthesia, making it virtually painless. Post-procedure discomfort is minimal and manageable." },
    ],
  },
  {
    id: "root-canal",
    title: "Root Canal Treatment",
    shortDesc: "Best conservative treatments to save your valuable teeth with advanced endodontic care.",
    description: "Smilz provides best conservative treatments to save your valuable teeth by providing best endodontic treatments at all ages. Our root canal treatments use the latest technology to ensure a painless and efficient procedure, preserving your natural tooth structure.",
    icon: "rootcanal",
    keywords: "root canal treatment Garia",
    faqs: [
      { q: "Is root canal treatment painful?", a: "Modern root canal treatments at Smilz are virtually painless thanks to advanced anesthesia and technology. Most patients report the experience similar to getting a filling." },
      { q: "How many visits does a root canal require?", a: "Most root canal treatments can be completed in 1-2 visits, depending on the complexity of the case." },
    ],
  },
  {
    id: "orthodontics",
    title: "Orthodontics & Braces",
    shortDesc: "Conventional braces, clear aligners, and Invisalign for all ages including adults.",
    description: "Smilz provides conventional braces along with clear aligners and Invisalign. We also offer skeletal corrections and adult orthodontics, because it's never too late to achieve your dream smile. Our orthodontic treatments are tailored to each patient's unique needs.",
    icon: "braces",
    keywords: "braces Kolkata, Invisalign Kolkata",
    faqs: [
      { q: "Do you offer Invisalign in Kolkata?", a: "Yes, Smilz provides Invisalign clear aligners as an alternative to traditional braces for suitable candidates." },
      { q: "Can adults get braces?", a: "Absolutely! Adult orthodontics is one of our specialties. It's never too late to achieve a perfect smile." },
    ],
  },
  {
    id: "smile-designing",
    title: "Smile Designing",
    shortDesc: "Comprehensive smile makeover with virtual preview before treatment approval.",
    description: "This is a comprehensive smile enhancement treatment plan consisting of multiple modules of inter-disciplinary treatments to get a perfect Smile. Pre-treatment virtual correction is shown to our patients and after approval the final procedure is performed. Transform your smile with our personalized approach.",
    icon: "smile",
    keywords: "smile makeover Kolkata",
    faqs: [
      { q: "What is smile designing?", a: "Smile designing is a comprehensive approach to improving your smile using various dental procedures like veneers, crowns, whitening, and orthodontics, customized to your facial features." },
      { q: "Can I preview the results before treatment?", a: "Yes! At Smilz, we show you a virtual preview of the expected results before beginning any procedure." },
    ],
  },
  {
    id: "tooth-whitening",
    title: "Tooth Whitening",
    shortDesc: "Professional teeth whitening to make you look your best for special occasions.",
    description: "We love to see your smile on your SPECIAL occasions of Life, making you look at your best. Our professional tooth whitening treatments deliver dramatic results safely and effectively, giving you a brighter, more confident smile.",
    icon: "whitening",
    keywords: "teeth whitening Kolkata",
    faqs: [
      { q: "How long does teeth whitening last?", a: "Professional teeth whitening results can last from 6 months to 2 years, depending on your lifestyle and oral care habits." },
      { q: "Is teeth whitening safe?", a: "Yes, professional teeth whitening at our clinic is completely safe and performed under expert supervision." },
    ],
  },
  {
    id: "scaling-polishing",
    title: "Scaling & Polishing",
    shortDesc: "Routine dental cleaning for optimal oral health and hygiene maintenance.",
    description: "Regular dental cleaning is essential for maintaining oral health. Our scaling and polishing treatments remove plaque, tartar, and stains, helping prevent gum disease and keeping your teeth healthy and bright. We recommend professional cleaning every 6 months.",
    icon: "cleaning",
    keywords: "dental cleaning Kolkata",
    faqs: [
      { q: "How often should I get dental cleaning?", a: "We recommend professional dental cleaning every 6 months to maintain optimal oral health." },
      { q: "Does scaling damage teeth?", a: "No, professional scaling does not damage your teeth. It removes harmful deposits that brushing alone cannot remove." },
    ],
  },
];

export const REVIEWS = [
  {
    name: "Nazmul Islam",
    date: "Dec 2025",
    text: "Amazing feeling, everything was good, especially sir's sincerity impressed me, I am most happy that my tooth gap is completely gone now, it looks completely natural, thank you sir",
    rating: 5,
  },
  {
    name: "Suraj Sharma",
    date: "Jun 2025",
    text: "I was experiencing pain in my incisor tooth and was quite worried about it. He handled the procedure very gently, and to my surprise, it was almost painless. His clinic is well-equipped with the latest technology.",
    rating: 5,
  },
  {
    name: "Sujoy Chakraborty",
    date: "May 2025",
    text: "Very good treatment done by the doctor. The doctor and the other staff member is very attentive, caring and professional. Great clinic. Highly recommend.",
    rating: 5,
  },
  {
    name: "Partha Pratim Chanda",
    date: "Mar 2025",
    text: "One gem of a person... With experience of more than 25 years, he has been a saviour for me. I am beyond impressed with Dr. Dibyendu Dutta. The extraction was quick and painless!",
    rating: 5,
  },
  {
    name: "Jayeeta Sarkar",
    date: "Apr 2025",
    text: "My whole family has been taking service from here for more than a decade now. Excellent service. Doctor's behaviour is so friendly. All the equipments are of new age technology.",
    rating: 5,
  },
  {
    name: "Mousumi Bhaumick",
    date: "Mar 2025",
    text: "An amazing experience all the time we visit him for an appointment. He takes very good care of my 85 year old mother. I can not think of visiting anyone else for any dental issue.",
    rating: 5,
  },
];

export const BLOG_CATEGORIES = [
  { id: "oral-hygiene", name: "Oral Hygiene", slug: "oral-hygiene" },
  { id: "procedures", name: "Procedures", slug: "procedures" },
  { id: "general-health", name: "General Health", slug: "general-health" },
  { id: "guides", name: "Guides", slug: "guides" },
  { id: "awareness", name: "Awareness", slug: "awareness" },
];
