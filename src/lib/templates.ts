import type { QuestionType, ValidationRules } from './supabase';

export interface FormTemplate {
  id: string;
  title: string;
  description: string;
  category: 'feedback' | 'registration' | 'hr' | 'sales' | 'support';
  welcome_text: string;
  completion_text: string;
  theme_color: string;
  bot_name: string;
  bot_avatar: 'sparkles' | 'bot' | 'message-circle' | 'headset' | 'user';
  questions: {
    text: string;
    type: QuestionType;
    options?: string[];
    required: boolean;
    placeholder?: string;
    validation?: ValidationRules;
  }[];
}

export const TEMPLATES: FormTemplate[] = [
  {
    id: 'csat-survey',
    title: 'Customer Satisfaction (CSAT)',
    description: 'Measure client sentiment with star ratings, department dropdowns, and qualitative feedback.',
    category: 'feedback',
    welcome_text: 'Hello! We value your feedback. Could you answer 4 quick questions about your recent experience?',
    completion_text: 'Thank you for your valuable feedback! We use your input to continuously improve.',
    theme_color: '#4f46e5', // Indigo
    bot_name: 'Customer Success Bot',
    bot_avatar: 'sparkles',
    questions: [
      {
        text: 'Overall, how satisfied are you with our service?',
        type: 'rating',
        required: true,
        validation: {
          ratingScale: 5,
          ratingStyle: 'stars',
          lowRatingLabel: 'Poor',
          highRatingLabel: 'Exceptional',
        },
      },
      {
        text: 'Which department did you interact with most?',
        type: 'dropdown',
        required: true,
        options: ['Customer Support', 'Sales & Onboarding', 'Technical & Product', 'Billing & Accounts'],
        placeholder: 'Select a department...',
      },
      {
        text: 'What did we do well or where could we improve?',
        type: 'text',
        required: false,
        placeholder: 'Share your thoughts or suggestions...',
      },
      {
        text: 'May we have your email in case our team would like to follow up?',
        type: 'email',
        required: false,
        placeholder: 'alex@example.com',
      },
    ],
  },
  {
    id: 'event-rsvp',
    title: 'Event Registration & RSVP',
    description: 'Collect attendee registrations with date selections, ticket tiers, and dietary preferences.',
    category: 'registration',
    welcome_text: 'Welcome! Register in under a minute for our upcoming developer conference.',
    completion_text: "You're registered! We've saved your spot and will send conference details soon.",
    theme_color: '#0284c7', // Sky
    bot_name: 'Events Desk',
    bot_avatar: 'bot',
    questions: [
      {
        text: 'What is your full name?',
        type: 'text',
        required: true,
        placeholder: 'Taylor Swift',
      },
      {
        text: 'What is the best email to send your ticket confirmation?',
        type: 'email',
        required: true,
        placeholder: 'name@company.com',
      },
      {
        text: 'Select your preferred attendance date:',
        type: 'date',
        required: true,
        validation: {
          minDate: '2026-10-25',
          maxDate: '2026-12-31',
        },
      },
      {
        text: 'Which pass tier would you like?',
        type: 'dropdown',
        required: true,
        options: ['General Admission (Free)', 'VIP All-Access Pass', 'Student / Non-profit Pass'],
        placeholder: 'Select ticket tier...',
      },
      {
        text: 'Do you have any dietary restrictions for catered meals?',
        type: 'yes_no',
        required: true,
      },
    ],
  },
  {
    id: 'bug-feature-request',
    title: 'Product Feedback & Bug Triage',
    description: 'Capture bug reports, severity ratings, and feature requests with categorized dropdowns.',
    category: 'support',
    welcome_text: 'Found an issue or have an idea? Let our product team know right here.',
    completion_text: 'Report submitted! Our engineering team will review it shortly.',
    theme_color: '#ea580c', // Orange
    bot_name: 'Issue Triage Bot',
    bot_avatar: 'headset',
    questions: [
      {
        text: 'What type of issue or feedback are you submitting?',
        type: 'dropdown',
        required: true,
        options: ['Bug / Defect', 'Feature Request', 'Performance Issue', 'Design / UI Improvement', 'Other'],
        placeholder: 'Choose feedback type...',
      },
      {
        text: 'How severe is this issue for your workflow?',
        type: 'rating',
        required: true,
        validation: {
          ratingScale: 5,
          ratingStyle: 'numbers',
          lowRatingLabel: 'Minor inconvenience',
          highRatingLabel: 'Blocker / Critical',
        },
      },
      {
        text: 'Please describe the issue or desired feature:',
        type: 'text',
        required: true,
        placeholder: 'Describe what happened or what you would love to see...',
      },
      {
        text: 'Your email address so we can notify you of updates:',
        type: 'email',
        required: true,
        placeholder: 'developer@example.com',
      },
    ],
  },
  {
    id: 'candidate-screening',
    title: 'Candidate Screening Form',
    description: 'Streamline applicant intake with years of experience dropdowns and earliest start dates.',
    category: 'hr',
    welcome_text: 'Thank you for your interest in joining our team! Tell us a bit about yourself.',
    completion_text: 'Application received! Our recruiting team will be in touch if your profile matches.',
    theme_color: '#059669', // Emerald
    bot_name: 'Recruiting Lead',
    bot_avatar: 'user',
    questions: [
      {
        text: 'What is your full legal name?',
        type: 'text',
        required: true,
        placeholder: 'Jordan Lee',
      },
      {
        text: 'What is your contact email?',
        type: 'email',
        required: true,
        placeholder: 'jordan@example.com',
      },
      {
        text: 'How many years of relevant professional experience do you have?',
        type: 'dropdown',
        required: true,
        options: ['0 - 1 years (Junior)', '2 - 4 years (Mid-level)', '5 - 8 years (Senior)', '8+ years (Staff / Lead)'],
        placeholder: 'Select years of experience...',
      },
      {
        text: 'What is your primary tech stack or specialization?',
        type: 'dropdown',
        required: true,
        options: ['Frontend (React, TypeScript)', 'Full Stack (React + Node/Go)', 'Backend & Cloud (PostgreSQL, APIs)', 'Mobile (iOS/Android)', 'DevOps & Infra'],
        placeholder: 'Select specialization...',
      },
      {
        text: 'What is your earliest available start date?',
        type: 'date',
        required: true,
      },
      {
        text: 'Are you legally authorized to work in the role location?',
        type: 'yes_no',
        required: true,
      },
    ],
  },
  {
    id: 'lead-qualification',
    title: 'Sales Lead Qualification',
    description: 'Capture inbound sales leads with budget tier dropdowns, company size, and meeting interest.',
    category: 'sales',
    welcome_text: 'Interested in partnering or scaling with us? Answer a few questions to get tailored pricing.',
    completion_text: 'Thanks! A product specialist will reach out within one business day.',
    theme_color: '#7c3aed', // Purple
    bot_name: 'Sales Concierge',
    bot_avatar: 'message-circle',
    questions: [
      {
        text: 'What is your company or organization name?',
        type: 'text',
        required: true,
        placeholder: 'Acme Corp',
      },
      {
        text: 'What is your work email?',
        type: 'email',
        required: true,
        placeholder: 'you@acme.com',
      },
      {
        text: 'What is your anticipated annual software budget?',
        type: 'dropdown',
        required: true,
        options: ['Under $5,000', '$5,000 - $25,000', '$25,000 - $100,000', '$100,000+'],
        placeholder: 'Select budget range...',
      },
      {
        text: 'Would you like to schedule a 15-minute live walkthrough?',
        type: 'yes_no',
        required: true,
      },
    ],
  },
];
