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
    id: 'blank',
    label: 'Blank Page',
    description: 'Start from scratch with an empty canvas',
    icon: '📄',
    layout: () => [],
  },
];

export const getTemplateById = (id: string) => SECTION_TEMPLATES.find(t => t.id === id);
