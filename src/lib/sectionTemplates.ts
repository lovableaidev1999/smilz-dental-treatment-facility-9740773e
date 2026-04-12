import type { LayoutNode } from '@/types/visual-builder';

const genId = () => `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export interface SectionTemplate {
  id: string;
  label: string;
  description: string;
  icon: string;
  layout: () => LayoutNode[];
}

export const SECTION_TEMPLATES: SectionTemplate[] = [
  {
    id: 'home',
    label: 'Home Page',
    description: 'Hero + Services carousel + Testimonials + CTA',
    icon: '🏠',
    layout: () => [
      {
        id: genId(), type: 'section',
        props: { background: 'hsl(var(--primary))', maxWidth: '1280px', fullWidth: true, gridColumns: '1fr', columnGap: '1.5rem', rowGap: '1.5rem', locked: true },
        responsive: { desktop: { padding: '4rem 2rem', textAlign: 'center' }, mobile: { padding: '2rem 1rem' } },
        children: [{
          id: genId(), type: 'column', props: { width: '100%' }, children: [
            { id: genId(), type: 'heading', props: { text: 'Welcome to Our Dental Clinic', level: 1, align: 'center', color: 'hsl(var(--primary-foreground))' } },
            { id: genId(), type: 'text', props: { text: 'Providing quality dental care for your entire family. Book your appointment today.', align: 'center', color: 'hsl(var(--primary-foreground))' } },
            { id: genId(), type: 'button', props: { text: 'Book Appointment', url: '/contact', style: 'gold', align: 'center' } },
          ],
        }],
      },
      {
        id: genId(), type: 'section',
        props: { background: '', maxWidth: '1280px', fullWidth: false, gridColumns: '1fr', columnGap: '1.5rem', rowGap: '1.5rem' },
        responsive: { desktop: { padding: '3rem 1.5rem' }, mobile: { padding: '2rem 1rem' } },
        children: [{
          id: genId(), type: 'column', props: { width: '100%' }, children: [
            { id: genId(), type: 'heading', props: { text: 'Our Services', level: 2, align: 'center' } },
            { id: genId(), type: 'service-loop', props: { count: 6, columns: 3, showImage: true, showDescription: true, displayType: 'carousel', autoplay: true, showNavigation: true } },
          ],
        }],
      },
      {
        id: genId(), type: 'section',
        props: { background: 'hsl(var(--muted))', maxWidth: '1280px', fullWidth: true, gridColumns: '1fr', columnGap: '1.5rem', rowGap: '1.5rem' },
        responsive: { desktop: { padding: '3rem 1.5rem' }, mobile: { padding: '2rem 1rem' } },
        children: [{
          id: genId(), type: 'column', props: { width: '100%' }, children: [
            { id: genId(), type: 'heading', props: { text: 'What Our Patients Say', level: 2, align: 'center' } },
            { id: genId(), type: 'testimonial', props: { quote: 'Excellent dental care! The doctor was very professional and gentle.', author: 'Happy Patient', role: '' } },
          ],
        }],
      },
      {
        id: genId(), type: 'section',
        props: { background: 'hsl(var(--primary))', maxWidth: '1280px', fullWidth: true, gridColumns: '1fr', columnGap: '1.5rem', rowGap: '1.5rem' },
        responsive: { desktop: { padding: '3rem 1.5rem', textAlign: 'center' }, mobile: { padding: '2rem 1rem' } },
        children: [{
          id: genId(), type: 'column', props: { width: '100%' }, children: [
            { id: genId(), type: 'heading', props: { text: 'Ready to Transform Your Smile?', level: 2, align: 'center', color: 'hsl(var(--primary-foreground))' } },
            { id: genId(), type: 'button', props: { text: 'Contact Us Today', url: '/contact', style: 'gold', align: 'center' } },
          ],
        }],
      },
    ],
  },
  {
    id: 'about',
    label: 'About Page',
    description: 'Hero + Two-column bio + CTA',
    icon: 'ℹ️',
    layout: () => [
      {
        id: genId(), type: 'section',
        props: { background: 'hsl(var(--primary))', maxWidth: '1280px', fullWidth: true, gridColumns: '1fr', columnGap: '1.5rem', rowGap: '1.5rem' },
        responsive: { desktop: { padding: '3rem 2rem', textAlign: 'center' }, mobile: { padding: '2rem 1rem' } },
        children: [{
          id: genId(), type: 'column', props: { width: '100%' }, children: [
            { id: genId(), type: 'heading', props: { text: 'About Our Clinic', level: 1, align: 'center', color: 'hsl(var(--primary-foreground))' } },
            { id: genId(), type: 'text', props: { text: 'Learn about our journey, our team, and our commitment to dental excellence.', align: 'center', color: 'hsl(var(--primary-foreground))' } },
          ],
        }],
      },
      {
        id: genId(), type: 'section',
        props: { background: '', maxWidth: '1280px', fullWidth: false, gridColumns: '1fr 1fr', columnGap: '2rem', rowGap: '1.5rem' },
        responsive: { desktop: { padding: '3rem 1.5rem' }, mobile: { padding: '2rem 1rem' } },
        children: [
          {
            id: genId(), type: 'column', props: { width: '100%', verticalAlign: 'center' }, children: [
              { id: genId(), type: 'image', props: { src: '', alt: 'Doctor photo', caption: '', objectFit: 'cover', borderRadius: '0.75rem' } },
            ],
          },
          {
            id: genId(), type: 'column', props: { width: '100%' }, children: [
              { id: genId(), type: 'heading', props: { text: 'Meet Our Doctor', level: 2, align: 'left' } },
              { id: genId(), type: 'text', props: { text: 'With over 25 years of experience in dental care, our doctor brings expertise and compassion to every patient interaction.', align: 'left' } },
              { id: genId(), type: 'icon-list', props: { items: [{ icon: 'Check', text: 'BDS, MDS qualified' }, { icon: 'Check', text: '25+ years experience' }, { icon: 'Check', text: 'Specialized in modern dentistry' }] } },
            ],
          },
        ],
      },
      {
        id: genId(), type: 'section',
        props: { background: 'hsl(var(--primary))', maxWidth: '1280px', fullWidth: true, gridColumns: '1fr', columnGap: '1.5rem', rowGap: '1.5rem' },
        responsive: { desktop: { padding: '3rem 1.5rem', textAlign: 'center' }, mobile: { padding: '2rem 1rem' } },
        children: [{
          id: genId(), type: 'column', props: { width: '100%' }, children: [
            { id: genId(), type: 'heading', props: { text: 'Schedule Your Visit', level: 2, align: 'center', color: 'hsl(var(--primary-foreground))' } },
            { id: genId(), type: 'button', props: { text: 'Book Appointment', url: '/contact', style: 'gold', align: 'center' } },
          ],
        }],
      },
    ],
  },
  {
    id: 'services',
    label: 'Services Page',
    description: 'Hero + Services grid + FAQ + CTA',
    icon: '🦷',
    layout: () => [
      {
        id: genId(), type: 'section',
        props: { background: 'hsl(var(--primary))', maxWidth: '1280px', fullWidth: true, gridColumns: '1fr', columnGap: '1.5rem', rowGap: '1.5rem' },
        responsive: { desktop: { padding: '3rem 2rem', textAlign: 'center' }, mobile: { padding: '2rem 1rem' } },
        children: [{
          id: genId(), type: 'column', props: { width: '100%' }, children: [
            { id: genId(), type: 'heading', props: { text: 'Our Dental Services', level: 1, align: 'center', color: 'hsl(var(--primary-foreground))' } },
            { id: genId(), type: 'text', props: { text: 'Comprehensive dental care tailored to your needs.', align: 'center', color: 'hsl(var(--primary-foreground))' } },
          ],
        }],
      },
      {
        id: genId(), type: 'section',
        props: { background: '', maxWidth: '1280px', fullWidth: false, gridColumns: '1fr', columnGap: '1.5rem', rowGap: '1.5rem' },
        responsive: { desktop: { padding: '3rem 1.5rem' }, mobile: { padding: '2rem 1rem' } },
        children: [{
          id: genId(), type: 'column', props: { width: '100%' }, children: [
            { id: genId(), type: 'service-loop', props: { count: 12, columns: 3, showImage: true, showDescription: true, displayType: 'grid', autoplay: false, showNavigation: false } },
          ],
        }],
      },
      {
        id: genId(), type: 'section',
        props: { background: 'hsl(var(--muted))', maxWidth: '1280px', fullWidth: true, gridColumns: '1fr', columnGap: '1.5rem', rowGap: '1.5rem' },
        responsive: { desktop: { padding: '3rem 1.5rem' }, mobile: { padding: '2rem 1rem' } },
        children: [{
          id: genId(), type: 'column', props: { width: '100%' }, children: [
            { id: genId(), type: 'heading', props: { text: 'Frequently Asked Questions', level: 2, align: 'center' } },
            { id: genId(), type: 'faq', props: { items: [{ question: 'Do you accept insurance?', answer: 'Yes, we accept most major dental insurance plans.' }, { question: 'What are your working hours?', answer: 'We are open Monday to Saturday, 9 AM–1 PM and 5 PM–9 PM.' }] } },
          ],
        }],
      },
      {
        id: genId(), type: 'section',
        props: { background: 'hsl(var(--primary))', maxWidth: '1280px', fullWidth: true, gridColumns: '1fr', columnGap: '1.5rem', rowGap: '1.5rem' },
        responsive: { desktop: { padding: '3rem 1.5rem', textAlign: 'center' }, mobile: { padding: '2rem 1rem' } },
        children: [{
          id: genId(), type: 'column', props: { width: '100%' }, children: [
            { id: genId(), type: 'heading', props: { text: 'Need a Consultation?', level: 2, align: 'center', color: 'hsl(var(--primary-foreground))' } },
            { id: genId(), type: 'button', props: { text: 'Contact Us', url: '/contact', style: 'gold', align: 'center' } },
          ],
        }],
      },
    ],
  },
  {
    id: 'contact',
    label: 'Contact Page',
    description: 'Two-column with form + map + info',
    icon: '📧',
    layout: () => [
      {
        id: genId(), type: 'section',
        props: { background: 'hsl(var(--primary))', maxWidth: '1280px', fullWidth: true, gridColumns: '1fr', columnGap: '1.5rem', rowGap: '1.5rem' },
        responsive: { desktop: { padding: '3rem 2rem', textAlign: 'center' }, mobile: { padding: '2rem 1rem' } },
        children: [{
          id: genId(), type: 'column', props: { width: '100%' }, children: [
            { id: genId(), type: 'heading', props: { text: 'Contact Us', level: 1, align: 'center', color: 'hsl(var(--primary-foreground))' } },
            { id: genId(), type: 'text', props: { text: 'We\'d love to hear from you. Reach out to book an appointment or ask a question.', align: 'center', color: 'hsl(var(--primary-foreground))' } },
          ],
        }],
      },
      {
        id: genId(), type: 'section',
        props: { background: '', maxWidth: '1280px', fullWidth: false, gridColumns: '1fr 1fr', columnGap: '2rem', rowGap: '1.5rem' },
        responsive: { desktop: { padding: '3rem 1.5rem' }, mobile: { padding: '2rem 1rem' } },
        children: [
          {
            id: genId(), type: 'column', props: { width: '100%' }, children: [
              { id: genId(), type: 'heading', props: { text: 'Send Us a Message', level: 2, align: 'left' } },
              {
                id: genId(), type: 'contact-form', props: {
                  fields: [
                    { type: 'text', label: 'Name', required: true },
                    { type: 'email', label: 'Email', required: true },
                    { type: 'tel', label: 'Phone', required: false },
                    { type: 'textarea', label: 'Message', required: true },
                  ],
                  submitText: 'Send Message',
                },
              },
            ],
          },
          {
            id: genId(), type: 'column', props: { width: '100%' }, children: [
              { id: genId(), type: 'heading', props: { text: 'Find Us', level: 2, align: 'left' } },
              { id: genId(), type: 'google-map', props: { address: '21 Garia Park, Kolkata 700084', zoom: 15, height: '250px' } },
              { id: genId(), type: 'icon-list', props: { items: [{ icon: 'Phone', text: 'Call: +91 89617 75554' }, { icon: 'Mail', text: 'Email: dr.d.dutta@gmail.com' }, { icon: 'Clock', text: 'Mon-Sat: 9AM-1PM, 5PM-9PM' }] } },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'service-detail',
    label: 'Service Details Page',
    description: 'Locked-layout service page with hero, content, sidebar, FAQs & CTA — matches smilz.net design exactly',
    icon: '🦷',
    layout: () => {
      // Hero Section
      const heroSection: LayoutNode = {
        id: genId(), type: 'section',
        props: {
          background: 'hsl(var(--primary))', maxWidth: '1280px', fullWidth: true,
          gridColumns: '1fr', columnGap: '1.5rem', rowGap: '0.5rem', locked: true, spacing: 'medium',
        },
        responsive: { desktop: { padding: '3rem 2rem' }, mobile: { padding: '2rem 1rem' } },
        children: [{
          id: genId(), type: 'column', props: { width: '100%' }, children: [
            { id: genId(), type: 'text', props: { text: 'Home  ›  Services  ›  Sample Dental Service', align: 'left', color: 'hsla(var(--primary-foreground) / 0.7)' } },
            { id: genId(), type: 'heading', props: { text: 'Sample Dental Service', level: 1, align: 'left', color: 'hsl(var(--primary-foreground))' } },
            { id: genId(), type: 'text', props: { text: 'This is a short introduction about the dental service explaining its benefits and purpose. Our experienced dental team provides comprehensive care using the latest techniques.', align: 'left', color: 'hsla(var(--primary-foreground) / 0.85)' } },
            { id: genId(), type: 'button', props: { text: '💬 Book Appointment', url: 'https://wa.me/918961775554?text=Hi, I\'m interested in this treatment.', style: 'gold', align: 'left', openInNewTab: true } },
            { id: genId(), type: 'button', props: { text: '📞 Call 8961 77 5554', url: 'tel:8961775554', style: 'outline', align: 'left' } },
          ],
        }],
      };

      // Main Content + Sidebar (2fr 1fr)
      const mainSection: LayoutNode = {
        id: genId(), type: 'section',
        props: {
          background: '', maxWidth: '1280px', fullWidth: false,
          gridColumns: '2fr 1fr', columnGap: '3rem', rowGap: '1.5rem', locked: true, spacing: 'medium',
        },
        responsive: { desktop: { padding: '3rem 1.5rem' }, mobile: { padding: '1.5rem 1rem' } },
        children: [
          // Left content column
          {
            id: genId(), type: 'column', props: { width: '100%' }, children: [
              { id: genId(), type: 'image', props: { src: '', alt: 'Sample dental service treatment at Smilz Dental', caption: '', objectFit: 'cover', borderRadius: '1rem' } },
              { id: genId(), type: 'spacer', props: { height: '24px' } },

              // Overview
              { id: genId(), type: 'heading', props: { text: 'About Sample Dental Service', level: 2, align: 'left' } },
              { id: genId(), type: 'text', props: { text: 'At Smilz Dental Treatment Facility, we provide comprehensive dental services designed to improve your oral health and restore your confidence. Our experienced team uses the latest technology and techniques to deliver outstanding results with minimal discomfort.\n\nWhether you are looking for preventive care, restorative treatments, or cosmetic enhancements, our clinic in Garia, South Kolkata, offers personalized solutions tailored to your unique needs. We believe in transparent communication and will guide you through every step of your treatment journey.\n\nBook your consultation today at Smilz or call us at 8961775554 to learn more about how this service can benefit you.', align: 'left' } },
              { id: genId(), type: 'spacer', props: { height: '24px' } },

              // Benefits
              { id: genId(), type: 'heading', props: { text: 'Benefits of This Treatment', level: 2, align: 'left' } },
              { id: genId(), type: 'icon-list', props: { items: [
                { icon: 'Check', text: 'Improves overall oral health and hygiene' },
                { icon: 'Check', text: 'Reduces pain and discomfort effectively' },
                { icon: 'Check', text: 'Long-lasting and durable results' },
                { icon: 'Check', text: 'Enhances your smile and self-confidence' },
                { icon: 'Check', text: 'Uses modern, minimally invasive techniques' },
              ] } },
              { id: genId(), type: 'spacer', props: { height: '24px' } },

              // Treatment Options
              { id: genId(), type: 'heading', props: { text: 'Treatment Options Available', level: 2, align: 'left' } },
              { id: genId(), type: 'text', props: { text: 'Option 1: Conservative Treatment\nIdeal for early-stage conditions, this approach focuses on preserving natural tooth structure while addressing the underlying issue with minimal intervention.\n\nOption 2: Advanced Restorative Treatment\nFor moderate to severe cases, we use advanced materials and techniques to restore full function and aesthetics to your teeth.\n\nOption 3: Comprehensive Full-Arch Treatment\nA complete solution for patients requiring extensive work, combining multiple procedures for optimal long-term results.', align: 'left' } },
              { id: genId(), type: 'spacer', props: { height: '24px' } },

              // Procedure
              { id: genId(), type: 'heading', props: { text: 'What to Expect: The Procedure', level: 2, align: 'left' } },
              { id: genId(), type: 'icon-list', props: { items: [
                { icon: 'CircleDot', text: 'Step 1: Consultation — A thorough examination and discussion of your treatment goals' },
                { icon: 'CircleDot', text: 'Step 2: Treatment Planning — Custom treatment plan designed for your specific needs' },
                { icon: 'CircleDot', text: 'Step 3: Treatment — The procedure is performed with care using modern techniques' },
                { icon: 'CircleDot', text: 'Step 4: Follow-up — Post-treatment care instructions and scheduled check-ups' },
              ] } },
              { id: genId(), type: 'spacer', props: { height: '32px' } },

              // FAQs
              { id: genId(), type: 'heading', props: { text: 'Frequently Asked Questions', level: 2, align: 'left' } },
              { id: genId(), type: 'faq', props: { items: [
                { question: 'Is this treatment painful?', answer: 'Most patients experience little to no discomfort during the procedure. We use modern anesthesia and gentle techniques to ensure your comfort throughout the treatment.' },
                { question: 'How long does the treatment take?', answer: 'The duration depends on the complexity of your case. A single session typically takes 30 to 90 minutes. Your dentist will provide a detailed timeline during the consultation.' },
                { question: 'Is it expensive?', answer: 'We offer competitive pricing and flexible payment options to make quality dental care accessible. The exact cost depends on your specific treatment plan, which we will discuss transparently before starting.' },
                { question: 'How long do the results last?', answer: 'With proper oral hygiene and regular dental check-ups, the results of this treatment can last many years. We will provide you with detailed aftercare instructions to maximize longevity.' },
              ] } },
            ],
          },
          // Right sidebar column
          {
            id: genId(), type: 'column', props: { width: '100%' }, children: [
              // Appointment CTA card
              {
                id: genId(), type: 'container',
                props: { background: 'hsl(var(--primary))', padding: '1.5rem', borderRadius: '1rem', borderColor: '', shadow: false, sticky: true, stickyTop: '96px' },
                children: [
                  { id: genId(), type: 'heading', props: { text: 'Book Your Appointment', level: 3, align: 'left', color: 'hsl(var(--primary-foreground))' } },
                  { id: genId(), type: 'text', props: { text: 'Get expert dental treatment at Smilz Dental Treatment Facility.', align: 'left', color: 'hsla(var(--primary-foreground) / 0.8)' } },
                  { id: genId(), type: 'button', props: { text: '💬 WhatsApp Us', url: 'https://wa.me/918961775554', style: 'gold', align: 'left', openInNewTab: true } },
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
                  { id: genId(), type: 'service-loop', props: { count: 15, columns: 1, showImage: false, showDescription: false, displayType: 'list', autoplay: false, showNavigation: false } },
                ],
              },
            ],
          },
        ],
      };

      // Bottom CTA Section
      const ctaSection: LayoutNode = {
        id: genId(), type: 'section',
        props: {
          background: 'hsl(var(--primary))', maxWidth: '1280px', fullWidth: true,
          gridColumns: '1fr', columnGap: '1.5rem', rowGap: '1.5rem', locked: true, spacing: 'medium',
        },
        responsive: { desktop: { padding: '3rem 1.5rem', textAlign: 'center' }, mobile: { padding: '1.5rem 1rem' } },
        children: [{
          id: genId(), type: 'column', props: { width: '100%' }, children: [
            { id: genId(), type: 'heading', props: { text: 'Take the First Step Towards a Healthier Smile', level: 2, align: 'center', color: 'hsl(var(--primary-foreground))' } },
            { id: genId(), type: 'text', props: { text: 'Book your appointment today at Smilz Dental, Garia.', align: 'center', color: 'hsl(var(--primary-foreground))' } },
            { id: genId(), type: 'button', props: { text: 'Book Appointment', url: 'https://wa.me/918961775554', style: 'gold', align: 'center', openInNewTab: true } },
          ],
        }],
      };

      return [heroSection, mainSection, ctaSection];
    },
  },
  {
    id: 'blank',
    label: 'Blank Page',
    description: 'Start from scratch with an empty canvas',
    icon: '📄',
    layout: () => [],
  },
];

export const getTemplateById = (id: string) => SECTION_TEMPLATES.find(t => t.id === id);
