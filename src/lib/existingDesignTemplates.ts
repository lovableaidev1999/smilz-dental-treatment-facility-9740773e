import type { LayoutNode } from '@/types/visual-builder';

const genId = () => `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * These templates approximate the hardcoded page designs as builder-compatible JSON.
 * They allow users to "Edit existing design" in the visual builder.
 */

export const getExistingDesign = (slug: string): LayoutNode[] | null => {
  switch (slug) {
    case 'home': return homeDesign();
    case 'about': return aboutDesign();
    case 'services': return servicesDesign();
    case 'contact': return contactDesign();
    case 'gallery': return galleryDesign();
    case 'blog': return blogDesign();
    default:
      // Match service-* slugs to the service detail template
      if (slug.startsWith('service-')) return serviceDetailDesign();
      return null;
  }
};

function homeDesign(): LayoutNode[] {
  return [
    // Hero
    {
      id: genId(), type: 'section',
      props: { background: 'hsl(var(--primary))', maxWidth: '1280px', fullWidth: true, gridColumns: '1fr', columnGap: '1.5rem', rowGap: '1.5rem', locked: true },
      responsive: { desktop: { padding: '5rem 2rem', textAlign: 'center' }, mobile: { padding: '3rem 1rem' } },
      children: [{
        id: genId(), type: 'column', props: { width: '100%' }, children: [
          { id: genId(), type: 'text', props: { text: 'Bridging Gaps... Spreading Smiles!', align: 'center', color: 'hsl(var(--accent))' } },
          { id: genId(), type: 'heading', props: { text: 'Your Trusted Dental Partner in South Kolkata', level: 1, align: 'center', color: 'hsl(var(--primary-foreground))' } },
          { id: genId(), type: 'text', props: { text: 'Comprehensive, affordable dental care since 1999. From routine check-ups to advanced treatments, we deliver exceptional results with a gentle touch.', align: 'center', color: 'hsl(var(--primary-foreground))' } },
          { id: genId(), type: 'button', props: { text: 'Book Appointment', url: '/contact', style: 'gold', align: 'center' } },
        ],
      }],
    },
    // Services Section
    {
      id: genId(), type: 'section',
      props: { background: 'hsl(var(--muted))', maxWidth: '1280px', fullWidth: true, gridColumns: '1fr', columnGap: '1.5rem', rowGap: '1.5rem' },
      responsive: { desktop: { padding: '3rem 1.5rem' }, mobile: { padding: '2rem 1rem' } },
      children: [{
        id: genId(), type: 'column', props: { width: '100%' }, children: [
          { id: genId(), type: 'text', props: { text: 'What We Offer', align: 'center', color: 'hsl(var(--accent))' } },
          { id: genId(), type: 'heading', props: { text: 'Comprehensive Dental Services', level: 2, align: 'center' } },
          { id: genId(), type: 'text', props: { text: 'From preventive care to advanced procedures, we provide complete dental solutions for your entire family.', align: 'center' } },
          { id: genId(), type: 'service-loop', props: { count: 6, columns: 3, showImage: true, showDescription: true, displayType: 'carousel', autoplay: true, showNavigation: true } },
        ],
      }],
    },
    // About / Doctor Section
    {
      id: genId(), type: 'section',
      props: { background: '', maxWidth: '1280px', fullWidth: false, gridColumns: '1fr 1fr', columnGap: '3rem', rowGap: '1.5rem' },
      responsive: { desktop: { padding: '3rem 1.5rem' }, mobile: { padding: '2rem 1rem' } },
      children: [
        {
          id: genId(), type: 'column', props: { width: '100%', verticalAlign: 'center' }, children: [
            { id: genId(), type: 'image', props: { src: '', alt: 'Doctor photo', caption: '', objectFit: 'cover', borderRadius: '1rem' } },
          ],
        },
        {
          id: genId(), type: 'column', props: { width: '100%' }, children: [
            { id: genId(), type: 'text', props: { text: 'About Us', align: 'left', color: 'hsl(var(--accent))' } },
            { id: genId(), type: 'heading', props: { text: 'Your Trusted Dental Partner Since 1999', level: 2, align: 'left' } },
            { id: genId(), type: 'text', props: { text: 'Located at 21, Garia Park, South Kolkata, Smilz Dental Treatment Facility has been a trusted name in dental care for over 25 years.', align: 'left' } },
            { id: genId(), type: 'icon-list', props: { items: [{ icon: 'Check', text: 'Comprehensive dental solutions for all ages' }, { icon: 'Check', text: 'Affordable pricing with transparent plans' }, { icon: 'Check', text: 'Latest dental technology and equipment' }, { icon: 'Check', text: 'Personalized, appointment-based care' }] } },
            { id: genId(), type: 'button', props: { text: 'Learn More About Us', url: '/about', style: 'primary', align: 'left' } },
          ],
        },
      ],
    },
    // Reviews Section
    {
      id: genId(), type: 'section',
      props: { background: 'hsl(var(--muted))', maxWidth: '1280px', fullWidth: true, gridColumns: '1fr', columnGap: '1.5rem', rowGap: '1.5rem' },
      responsive: { desktop: { padding: '3rem 1.5rem' }, mobile: { padding: '2rem 1rem' } },
      children: [{
        id: genId(), type: 'column', props: { width: '100%' }, children: [
          { id: genId(), type: 'text', props: { text: 'Patient Testimonials', align: 'center', color: 'hsl(var(--accent))' } },
          { id: genId(), type: 'heading', props: { text: 'What Our Patients Say', level: 2, align: 'center' } },
          { id: genId(), type: 'testimonial', props: { quote: 'Excellent dental care! The doctor was very professional and gentle.', author: 'Happy Patient', role: '' } },
        ],
      }],
    },
    // FAQ Section
    {
      id: genId(), type: 'section',
      props: { background: 'hsl(var(--muted))', maxWidth: '1280px', fullWidth: true, gridColumns: '1fr', columnGap: '1.5rem', rowGap: '1.5rem' },
      responsive: { desktop: { padding: '3rem 1.5rem' }, mobile: { padding: '2rem 1rem' } },
      children: [{
        id: genId(), type: 'column', props: { width: '100%' }, children: [
          { id: genId(), type: 'text', props: { text: 'Common Questions', align: 'center', color: 'hsl(var(--accent))' } },
          { id: genId(), type: 'heading', props: { text: 'Frequently Asked Questions', level: 2, align: 'center' } },
          { id: genId(), type: 'faq', props: { items: [
            { question: 'What dental treatments are available at Smilz?', answer: 'We offer dental implants, root canal treatment, smile designing, clear aligners, pediatric dentistry, and preventive care.' },
            { question: 'Is dental treatment at Smilz painless?', answer: 'Yes, we specialize in painless dentistry using modern techniques and advanced equipment.' },
            { question: 'How do I book an appointment?', answer: 'You can book via our website, by calling the clinic, or via WhatsApp.' },
          ] } },
        ],
      }],
    },
    // CTA Section
    {
      id: genId(), type: 'section',
      props: { background: 'hsl(var(--primary))', maxWidth: '1280px', fullWidth: true, gridColumns: '1fr', columnGap: '1.5rem', rowGap: '1.5rem' },
      responsive: { desktop: { padding: '3rem 1.5rem', textAlign: 'center' }, mobile: { padding: '2rem 1rem' } },
      children: [{
        id: genId(), type: 'column', props: { width: '100%' }, children: [
          { id: genId(), type: 'heading', props: { text: 'Ready for a Healthier Smile?', level: 2, align: 'center', color: 'hsl(var(--primary-foreground))' } },
          { id: genId(), type: 'text', props: { text: 'Book your appointment today and experience the Smilz difference.', align: 'center', color: 'hsl(var(--primary-foreground))' } },
          { id: genId(), type: 'button', props: { text: 'Book on WhatsApp', url: '/contact', style: 'gold', align: 'center' } },
        ],
      }],
    },
  ];
}

function aboutDesign(): LayoutNode[] {
  return [
    // Hero
    {
      id: genId(), type: 'section',
      props: { background: 'hsl(var(--primary))', maxWidth: '1280px', fullWidth: true, gridColumns: '1fr', columnGap: '1.5rem', rowGap: '1.5rem', locked: true },
      responsive: { desktop: { padding: '3rem 2rem', textAlign: 'center' }, mobile: { padding: '2rem 1rem' } },
      children: [{
        id: genId(), type: 'column', props: { width: '100%' }, children: [
          { id: genId(), type: 'heading', props: { text: 'About Us', level: 1, align: 'center', color: 'hsl(var(--primary-foreground))' } },
          { id: genId(), type: 'text', props: { text: 'Over 25 years of dedicated dental care in the heart of Garia, South Kolkata.', align: 'center', color: 'hsl(var(--primary-foreground))' } },
        ],
      }],
    },
    // Doctor + Bio
    {
      id: genId(), type: 'section',
      props: { background: '', maxWidth: '1280px', fullWidth: false, gridColumns: '1fr 1fr', columnGap: '3rem', rowGap: '1.5rem' },
      responsive: { desktop: { padding: '3rem 1.5rem' }, mobile: { padding: '2rem 1rem' } },
      children: [
        {
          id: genId(), type: 'column', props: { width: '100%', verticalAlign: 'center' }, children: [
            { id: genId(), type: 'image', props: { src: '', alt: 'Dr. Dibyendu Dutta', caption: '', objectFit: 'cover', borderRadius: '1rem' } },
          ],
        },
        {
          id: genId(), type: 'column', props: { width: '100%' }, children: [
            { id: genId(), type: 'heading', props: { text: 'Meet Dr. Dibyendu Dutta', level: 2, align: 'left' } },
            { id: genId(), type: 'text', props: { text: 'With over 25 years of experience in dentistry, Dr. Dibyendu Dutta founded Smilz Dental Treatment Facility in 1999 with a vision to provide accessible, honest, and high-quality dental care to the community of South Kolkata.', align: 'left' } },
            { id: genId(), type: 'text', props: { text: 'Conveniently situated in the heart of Garia at 21, Garia Park, Kolkata 700084, our clinic is equipped with the latest dental technologies.', align: 'left' } },
          ],
        },
      ],
    },
    // Values Grid
    {
      id: genId(), type: 'section',
      props: { background: '', maxWidth: '1280px', fullWidth: false, gridColumns: '1fr 1fr 1fr 1fr', columnGap: '1.5rem', rowGap: '1.5rem' },
      responsive: { desktop: { padding: '0 1.5rem 3rem' }, mobile: { padding: '0 1rem 2rem' } },
      children: [
        { id: genId(), type: 'column', props: { width: '100%' }, children: [
          { id: genId(), type: 'heading', props: { text: '❤️ Patient-Centric', level: 3, align: 'center' } },
          { id: genId(), type: 'text', props: { text: 'Every patient receives undivided attention and personalized care.', align: 'center' } },
        ]},
        { id: genId(), type: 'column', props: { width: '100%' }, children: [
          { id: genId(), type: 'heading', props: { text: '🛡️ Honest Care', level: 3, align: 'center' } },
          { id: genId(), type: 'text', props: { text: 'Transparent treatment plans with no unnecessary procedures.', align: 'center' } },
        ]},
        { id: genId(), type: 'column', props: { width: '100%' }, children: [
          { id: genId(), type: 'heading', props: { text: '🏆 25+ Years', level: 3, align: 'center' } },
          { id: genId(), type: 'text', props: { text: 'Trusted expertise serving Garia and South Kolkata since 1999.', align: 'center' } },
        ]},
        { id: genId(), type: 'column', props: { width: '100%' }, children: [
          { id: genId(), type: 'heading', props: { text: '👨‍👩‍👧‍👦 Family Friendly', level: 3, align: 'center' } },
          { id: genId(), type: 'text', props: { text: 'Comprehensive dental solutions for patients of all ages.', align: 'center' } },
        ]},
      ],
    },
    // Clinic Info
    {
      id: genId(), type: 'section',
      props: { background: 'hsl(var(--secondary) / 0.3)', maxWidth: '1280px', fullWidth: true, gridColumns: '1fr 1fr 1fr', columnGap: '2rem', rowGap: '1.5rem' },
      responsive: { desktop: { padding: '3rem 1.5rem' }, mobile: { padding: '2rem 1rem' } },
      children: [
        { id: genId(), type: 'column', props: { width: '100%' }, children: [
          { id: genId(), type: 'heading', props: { text: '📍 Our Address', level: 3, align: 'center' } },
          { id: genId(), type: 'text', props: { text: '21, Garia Park, Kolkata 700084', align: 'center' } },
        ]},
        { id: genId(), type: 'column', props: { width: '100%' }, children: [
          { id: genId(), type: 'heading', props: { text: '🕐 Clinic Timings', level: 3, align: 'center' } },
          { id: genId(), type: 'text', props: { text: 'Morning: 9:00 AM – 1:00 PM\nEvening: 5:00 PM – 9:00 PM\nMonday – Saturday', align: 'center' } },
        ]},
        { id: genId(), type: 'column', props: { width: '100%' }, children: [
          { id: genId(), type: 'heading', props: { text: '📞 Contact', level: 3, align: 'center' } },
          { id: genId(), type: 'text', props: { text: 'Appointment: 8961 77 5554\nEmergency: 9831070248\nEmail: dr.d.dutta@gmail.com', align: 'center' } },
        ]},
      ],
    },
    // Map
    {
      id: genId(), type: 'section',
      props: { background: '', maxWidth: '1280px', fullWidth: false, gridColumns: '1fr', columnGap: '1.5rem', rowGap: '1.5rem' },
      responsive: { desktop: { padding: '3rem 1.5rem' }, mobile: { padding: '2rem 1rem' } },
      children: [{
        id: genId(), type: 'column', props: { width: '100%' }, children: [
          { id: genId(), type: 'heading', props: { text: 'Find Us on the Map', level: 2, align: 'center' } },
          { id: genId(), type: 'google-map', props: { address: '21 Garia Park, Kolkata 700084', zoom: 16, height: '400px' } },
        ],
      }],
    },
    // CTA
    {
      id: genId(), type: 'section',
      props: { background: 'hsl(var(--primary))', maxWidth: '1280px', fullWidth: true, gridColumns: '1fr', columnGap: '1.5rem', rowGap: '1.5rem' },
      responsive: { desktop: { padding: '3rem 1.5rem', textAlign: 'center' }, mobile: { padding: '2rem 1rem' } },
      children: [{
        id: genId(), type: 'column', props: { width: '100%' }, children: [
          { id: genId(), type: 'heading', props: { text: 'Ready for a Healthier Smile?', level: 2, align: 'center', color: 'hsl(var(--primary-foreground))' } },
          { id: genId(), type: 'text', props: { text: 'Book your appointment today and experience the Smilz difference.', align: 'center', color: 'hsl(var(--primary-foreground))' } },
          { id: genId(), type: 'button', props: { text: 'Book Appointment', url: '/contact', style: 'gold', align: 'center' } },
        ],
      }],
    },
  ];
}

function servicesDesign(): LayoutNode[] {
  return [
    // Hero
    {
      id: genId(), type: 'section',
      props: { background: 'hsl(var(--primary))', maxWidth: '1280px', fullWidth: true, gridColumns: '1fr', columnGap: '1.5rem', rowGap: '1.5rem', locked: true },
      responsive: { desktop: { padding: '3rem 2rem', textAlign: 'center' }, mobile: { padding: '2rem 1rem' } },
      children: [{
        id: genId(), type: 'column', props: { width: '100%' }, children: [
          { id: genId(), type: 'text', props: { text: 'Smilz Dental Treatment Facility', align: 'center', color: 'hsl(var(--accent))' } },
          { id: genId(), type: 'heading', props: { text: 'Smilz Dental Treatment Services', level: 1, align: 'center', color: 'hsl(var(--primary-foreground))' } },
          { id: genId(), type: 'text', props: { text: 'Comprehensive dental care services designed to address all your oral health needs. Call us at 8961 77 5554 or book an appointment.', align: 'center', color: 'hsl(var(--primary-foreground))' } },
          { id: genId(), type: 'button', props: { text: 'Book Appointment', url: '/contact', style: 'gold', align: 'center' } },
        ],
      }],
    },
    // Services Grid
    {
      id: genId(), type: 'section',
      props: { background: '', maxWidth: '1280px', fullWidth: false, gridColumns: '1fr', columnGap: '1.5rem', rowGap: '1.5rem' },
      responsive: { desktop: { padding: '3rem 1.5rem' }, mobile: { padding: '2rem 1rem' } },
      children: [{
        id: genId(), type: 'column', props: { width: '100%' }, children: [
          { id: genId(), type: 'text', props: { text: 'What We Offer', align: 'center', color: 'hsl(var(--accent))' } },
          { id: genId(), type: 'heading', props: { text: 'Our Dental Treatment Services', level: 2, align: 'center' } },
          { id: genId(), type: 'text', props: { text: 'From preventive care to advanced procedures, we provide complete dental solutions for your entire family.', align: 'center' } },
          { id: genId(), type: 'service-loop', props: { count: 12, columns: 3, showImage: true, showDescription: true, displayType: 'grid', autoplay: false, showNavigation: false } },
        ],
      }],
    },
    // FAQ
    {
      id: genId(), type: 'section',
      props: { background: 'hsl(var(--muted))', maxWidth: '1280px', fullWidth: true, gridColumns: '1fr', columnGap: '1.5rem', rowGap: '1.5rem' },
      responsive: { desktop: { padding: '3rem 1.5rem' }, mobile: { padding: '2rem 1rem' } },
      children: [{
        id: genId(), type: 'column', props: { width: '100%' }, children: [
          { id: genId(), type: 'heading', props: { text: 'Frequently Asked Questions', level: 2, align: 'center' } },
          { id: genId(), type: 'faq', props: { items: [
            { question: 'How often should I have a dental check-up?', answer: 'Generally every six months, though your dentist may suggest more frequent visits.' },
            { question: 'Are your dental treatments painful?', answer: 'We prioritize comfort and use modern techniques to minimize discomfort.' },
            { question: 'Are dental implants safe?', answer: 'Yes, dental implants are safe and effective with a high success rate.' },
          ] } },
        ],
      }],
    },
    // CTA
    {
      id: genId(), type: 'section',
      props: { background: 'hsl(var(--primary))', maxWidth: '1280px', fullWidth: true, gridColumns: '1fr', columnGap: '1.5rem', rowGap: '1.5rem' },
      responsive: { desktop: { padding: '3rem 1.5rem', textAlign: 'center' }, mobile: { padding: '2rem 1rem' } },
      children: [{
        id: genId(), type: 'column', props: { width: '100%' }, children: [
          { id: genId(), type: 'heading', props: { text: 'Start Your Dental Journey Now', level: 2, align: 'center', color: 'hsl(var(--primary-foreground))' } },
          { id: genId(), type: 'button', props: { text: 'Book on WhatsApp', url: '/contact', style: 'gold', align: 'center' } },
        ],
      }],
    },
  ];
}

function contactDesign(): LayoutNode[] {
  return [
    // Hero
    {
      id: genId(), type: 'section',
      props: { background: 'hsl(var(--primary))', maxWidth: '1280px', fullWidth: true, gridColumns: '1fr', columnGap: '1.5rem', rowGap: '1.5rem', locked: true },
      responsive: { desktop: { padding: '3rem 2rem', textAlign: 'center' }, mobile: { padding: '2rem 1rem' } },
      children: [{
        id: genId(), type: 'column', props: { width: '100%' }, children: [
          { id: genId(), type: 'heading', props: { text: 'Contact Us', level: 1, align: 'center', color: 'hsl(var(--primary-foreground))' } },
          { id: genId(), type: 'text', props: { text: "We'd love to hear from you. Book an appointment or reach out with any questions.", align: 'center', color: 'hsl(var(--primary-foreground))' } },
        ],
      }],
    },
    // Two column: Info + Form
    {
      id: genId(), type: 'section',
      props: { background: '', maxWidth: '1280px', fullWidth: false, gridColumns: '1fr 1fr', columnGap: '3rem', rowGap: '1.5rem' },
      responsive: { desktop: { padding: '3rem 1.5rem' }, mobile: { padding: '2rem 1rem' } },
      children: [
        {
          id: genId(), type: 'column', props: { width: '100%' }, children: [
            { id: genId(), type: 'heading', props: { text: 'Get In Touch', level: 2, align: 'left' } },
            { id: genId(), type: 'icon-list', props: { items: [
              { icon: 'MapPin', text: '21, Garia Park, South Kolkata 700084' },
              { icon: 'Phone', text: 'Phone: 8961 77 5554' },
              { icon: 'Phone', text: 'Emergency: 9831070248' },
              { icon: 'Mail', text: 'Email: dr.d.dutta@gmail.com' },
              { icon: 'Clock', text: 'Mon-Sat: 9AM-1PM, 5PM-9PM' },
            ] } },
            { id: genId(), type: 'google-map', props: { address: '21 Garia Park, Kolkata 700084', zoom: 16, height: '250px' } },
          ],
        },
        {
          id: genId(), type: 'column', props: { width: '100%' }, children: [
            { id: genId(), type: 'heading', props: { text: 'Send a Message', level: 2, align: 'left' } },
            { id: genId(), type: 'text', props: { text: "Fill the form below and we'll get back to you via WhatsApp.", align: 'left' } },
            {
              id: genId(), type: 'contact-form', props: {
                fields: [
                  { type: 'text', label: 'Name', required: true },
                  { type: 'email', label: 'Email', required: true },
                  { type: 'tel', label: 'Mobile', required: true },
                  { type: 'textarea', label: 'Message', required: true },
                ],
                submitText: 'Send via WhatsApp',
              },
            },
          ],
        },
      ],
    },
  ];
}

function galleryDesign(): LayoutNode[] {
  return [
    {
      id: genId(), type: 'section',
      props: { background: 'hsl(var(--primary))', maxWidth: '1280px', fullWidth: true, gridColumns: '1fr', columnGap: '1.5rem', rowGap: '1.5rem', locked: true },
      responsive: { desktop: { padding: '3rem 2rem', textAlign: 'center' }, mobile: { padding: '2rem 1rem' } },
      children: [{
        id: genId(), type: 'column', props: { width: '100%' }, children: [
          { id: genId(), type: 'heading', props: { text: 'Treatment Gallery', level: 1, align: 'center', color: 'hsl(var(--primary-foreground))' } },
          { id: genId(), type: 'text', props: { text: 'Real results from real patients. See the transformations we deliver every day.', align: 'center', color: 'hsl(var(--primary-foreground))' } },
        ],
      }],
    },
    {
      id: genId(), type: 'section',
      props: { background: '', maxWidth: '1280px', fullWidth: false, gridColumns: '1fr', columnGap: '1.5rem', rowGap: '1.5rem' },
      responsive: { desktop: { padding: '3rem 1.5rem' }, mobile: { padding: '2rem 1rem' } },
      children: [{
        id: genId(), type: 'column', props: { width: '100%' }, children: [
          { id: genId(), type: 'gallery', props: { columns: 2, gap: '2rem' } },
        ],
      }],
    },
  ];
}

function blogDesign(): LayoutNode[] {
  return [
    {
      id: genId(), type: 'section',
      props: { background: 'hsl(var(--primary))', maxWidth: '1280px', fullWidth: true, gridColumns: '1fr', columnGap: '1.5rem', rowGap: '1.5rem', locked: true },
      responsive: { desktop: { padding: '3rem 2rem', textAlign: 'center' }, mobile: { padding: '2rem 1rem' } },
      children: [{
        id: genId(), type: 'column', props: { width: '100%' }, children: [
          { id: genId(), type: 'heading', props: { text: 'Dental Insights', level: 1, align: 'center', color: 'hsl(var(--primary-foreground))' } },
          { id: genId(), type: 'text', props: { text: 'Expert articles on oral health, dental procedures, and wellness tips from our team.', align: 'center', color: 'hsl(var(--primary-foreground))' } },
        ],
      }],
    },
    {
      id: genId(), type: 'section',
      props: { background: '', maxWidth: '1280px', fullWidth: false, gridColumns: '1fr', columnGap: '1.5rem', rowGap: '1.5rem' },
      responsive: { desktop: { padding: '3rem 1.5rem' }, mobile: { padding: '2rem 1rem' } },
      children: [{
        id: genId(), type: 'column', props: { width: '100%' }, children: [
          { id: genId(), type: 'blog-loop', props: { count: 9, columns: 3, showImage: true, showExcerpt: true, displayType: 'grid', autoplay: false, showNavigation: false } },
        ],
      }],
    },
  ];
}

function serviceDetailDesign(): LayoutNode[] {
  return [
    // Hero / Breadcrumb Section
    {
      id: genId(), type: 'section',
      props: { background: 'hsl(var(--primary))', maxWidth: '1280px', fullWidth: true, gridColumns: '1fr', columnGap: '1.5rem', rowGap: '0.5rem', locked: true, spacing: 'medium' },
      responsive: { desktop: { padding: '3rem 2rem' }, mobile: { padding: '2rem 1rem' } },
      children: [{
        id: genId(), type: 'column', props: { width: '100%' }, children: [
          { id: genId(), type: 'text', props: { text: 'Home  ›  Services  ›  {Service_Title}', align: 'left', color: 'hsla(var(--primary-foreground) / 0.7)' } },
          { id: genId(), type: 'heading', props: { text: '{Service_Title}', level: 1, align: 'left', color: 'hsl(var(--primary-foreground))' } },
          { id: genId(), type: 'text', props: { text: '{Service_Short_Desc}', align: 'left', color: 'hsla(var(--primary-foreground) / 0.85)' } },
          { id: genId(), type: 'button', props: { text: '💬 Book Appointment', url: '/contact', style: 'gold', align: 'left' } },
        ],
      }],
    },
    // Main Content + Sidebar (2fr 1fr)
    {
      id: genId(), type: 'section',
      props: { background: '', maxWidth: '1280px', fullWidth: false, gridColumns: '2fr 1fr', columnGap: '3rem', rowGap: '1.5rem', spacing: 'medium' },
      responsive: { desktop: { padding: '3rem 1.5rem' }, mobile: { padding: '1.5rem 1rem' } },
      children: [
        // Content column
        {
          id: genId(), type: 'column', props: { width: '100%' }, children: [
            { id: genId(), type: 'image', props: { src: '{Service_Image}', alt: '{Service_Title} treatment at Smilz Dental', caption: '', objectFit: 'cover', borderRadius: '1rem' } },
            { id: genId(), type: 'spacer', props: { height: '24px' } },
            { id: genId(), type: 'heading', props: { text: 'About {Service_Title}', level: 2, align: 'left' } },
            { id: genId(), type: 'text', props: { text: '{Service_Content}', align: 'left' } },
          ],
        },
        // Sidebar column
        {
          id: genId(), type: 'column', props: { width: '100%' }, children: [
            // Appointment CTA card (primary bg)
            {
              id: genId(), type: 'container',
              props: { background: 'hsl(var(--primary))', padding: '1.5rem', borderRadius: '1rem', borderColor: '', shadow: false },
              children: [
                { id: genId(), type: 'heading', props: { text: 'Book Your Appointment', level: 3, align: 'left', color: 'hsl(var(--primary-foreground))' } },
                { id: genId(), type: 'text', props: { text: 'Get expert {Service_Title} treatment at Smilz Dental Treatment Facility.', align: 'left', color: 'hsla(var(--primary-foreground) / 0.8)' } },
                { id: genId(), type: 'button', props: { text: '💬 WhatsApp Us', url: 'https://wa.me/918961775554', style: 'gold', align: 'left' } },
                { id: genId(), type: 'button', props: { text: '📞 Call 8961 77 5554', url: 'tel:8961775554', style: 'outline', align: 'left' } },
                { id: genId(), type: 'divider', props: { color: 'hsla(var(--primary-foreground) / 0.2)' } },
                { id: genId(), type: 'icon-list', props: { items: [
                  { icon: 'MapPin', text: '21, Garia Park, South Kolkata - 700084' },
                  { icon: 'Clock', text: 'Mon-Sat: 9AM-1PM & 5PM-9PM' },
                ] } },
              ],
            },
            { id: genId(), type: 'spacer', props: { height: '16px' } },
            // Other Services card
            {
              id: genId(), type: 'container',
              props: { background: 'hsl(var(--card))', padding: '1.5rem', borderRadius: '1rem', borderColor: 'hsl(var(--border))', shadow: true },
              children: [
                { id: genId(), type: 'heading', props: { text: 'Other Services', level: 3, align: 'left' } },
                { id: genId(), type: 'service-loop', props: { count: 6, columns: 1, showImage: false, showDescription: false, displayType: 'list', autoplay: false, showNavigation: false } },
              ],
            },
          ],
        },
      ],
    },
    // FAQ Section
    {
      id: genId(), type: 'section',
      props: { background: 'hsl(var(--muted))', maxWidth: '1280px', fullWidth: true, gridColumns: '1fr', columnGap: '1.5rem', rowGap: '1.5rem', spacing: 'medium' },
      responsive: { desktop: { padding: '3rem 1.5rem' }, mobile: { padding: '1.5rem 1rem' } },
      children: [{
        id: genId(), type: 'column', props: { width: '100%' }, children: [
          { id: genId(), type: 'heading', props: { text: 'Frequently Asked Questions about {Service_Title}', level: 2, align: 'center' } },
          { id: genId(), type: 'faq', props: { items: [
            { question: 'What is {Service_Title}?', answer: 'Please update this answer with details about {Service_Title} treatment at Smilz Dental.' },
            { question: 'How much does {Service_Title} cost?', answer: 'The cost varies based on individual needs. Contact us for a personalized consultation.' },
            { question: 'Is {Service_Title} treatment painful?', answer: 'We prioritize patient comfort and use modern painless techniques.' },
          ] } },
        ],
      }],
    },
    // CTA Section
    {
      id: genId(), type: 'section',
      props: { background: 'hsl(var(--primary))', maxWidth: '1280px', fullWidth: true, gridColumns: '1fr', columnGap: '1.5rem', rowGap: '1.5rem', spacing: 'medium' },
      responsive: { desktop: { padding: '3rem 1.5rem', textAlign: 'center' }, mobile: { padding: '1.5rem 1rem' } },
      children: [{
        id: genId(), type: 'column', props: { width: '100%' }, children: [
          { id: genId(), type: 'heading', props: { text: 'Ready for Expert {Service_Title} Treatment?', level: 2, align: 'center', color: 'hsl(var(--primary-foreground))' } },
          { id: genId(), type: 'text', props: { text: 'Book your appointment today at Smilz Dental, Garia.', align: 'center', color: 'hsl(var(--primary-foreground))' } },
          { id: genId(), type: 'button', props: { text: 'Book on WhatsApp', url: 'https://wa.me/918961775554', style: 'gold', align: 'center' } },
        ],
      }],
    },
  ];
}
