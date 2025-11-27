/**
 * AffiliateAI Pro - Configuration
 */

export const CONFIG = {
  // Supabase Configuration
  supabase: {
    url: 'https://itodkevoqcamcfyzwgqw.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0b2RrZXZvcWNhbWNmeXp3Z3F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNDYyNjIsImV4cCI6MjA3OTgyMjI2Mn0.hLmcLn299M4EPR07V7vh3uwsPfgzzBcmYn-SHkTCpXI'
  },

  // Groq API Configuration
  groq: {
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    models: {
      fast: 'llama-3.1-8b-instant',
      balanced: 'llama-3.3-70b-versatile',
      powerful: 'llama-3.3-70b-versatile'
    }
  },

  // Content Types
  contentTypes: {
    blog_article: { name: 'Blog Article', icon: '📝', platforms: ['blog'], wordCountRange: [800, 2500] },
    social_post: { name: 'Social Post', icon: '📱', platforms: ['facebook', 'instagram', 'twitter', 'linkedin'], wordCountRange: [50, 300] },
    email: { name: 'Email', icon: '📧', platforms: ['email'], wordCountRange: [200, 800] },
    youtube_script: { name: 'YouTube Script', icon: '🎬', platforms: ['youtube'], wordCountRange: [500, 2000] },
    pinterest_pin: { name: 'Pinterest Pin', icon: '📌', platforms: ['pinterest'], wordCountRange: [50, 200] },
    ad_copy: { name: 'Ad Copy', icon: '📢', platforms: ['facebook', 'instagram'], wordCountRange: [20, 150] }
  },

  // Journey Steps
  journeySteps: [
    { number: 1, name: 'Welcome & Setup', module: 'onboarding', description: 'Set up your account and API keys' },
    { number: 2, name: 'Discover Your Niche', module: 'niche_discovery', description: 'Find profitable niches that match your interests' },
    { number: 3, name: 'Research Products', module: 'product_research', description: 'Find the best affiliate products to promote' },
    { number: 4, name: 'Plan Your Strategy', module: 'strategy', description: 'Create your marketing strategy' },
    { number: 5, name: 'Create Content', module: 'content_creation', description: 'Generate AI-powered content' },
    { number: 6, name: 'SEO Optimization', module: 'seo', description: 'Optimize for search engines' },
    { number: 7, name: 'Launch Campaign', module: 'campaigns', description: 'Launch your marketing campaigns' },
    { number: 8, name: 'Track & Optimize', module: 'analytics', description: 'Monitor performance and optimize' },
    { number: 9, name: 'Scale & Automate', module: 'automation', description: 'Scale and automate your business' }
  ],

  // Niche Categories
  nicheCategories: [
    { name: 'Health & Fitness', subNiches: ['Weight Loss', 'Muscle Building', 'Yoga', 'Nutrition', 'Mental Health', 'Supplements', 'Home Workouts', 'Running', 'Keto Diet', 'Intermittent Fasting'] },
    { name: 'Money & Finance', subNiches: ['Investing', 'Cryptocurrency', 'Real Estate', 'Side Hustles', 'Budgeting', 'Credit Repair', 'Passive Income', 'Stock Trading', 'Retirement Planning'] },
    { name: 'Relationships', subNiches: ['Dating', 'Marriage', 'Parenting', 'Divorce Recovery', 'Communication Skills', 'Social Skills'] },
    { name: 'Self-Improvement', subNiches: ['Productivity', 'Motivation', 'Confidence', 'Public Speaking', 'Leadership', 'Time Management', 'Goal Setting', 'Habit Building'] },
    { name: 'Technology', subNiches: ['Software Tools', 'AI Tools', 'Gaming', 'Smart Home', 'Cybersecurity', 'VPN Services', 'Web Hosting', 'Online Privacy'] },
    { name: 'Education & Skills', subNiches: ['Online Courses', 'Language Learning', 'Coding', 'Photography', 'Music', 'Art', 'Writing', 'Marketing Skills'] },
    { name: 'Lifestyle', subNiches: ['Travel', 'Home Decor', 'Fashion', 'Beauty', 'Cooking', 'Gardening', 'Pet Care', 'Sustainable Living'] },
    { name: 'Business', subNiches: ['Entrepreneurship', 'E-commerce', 'Dropshipping', 'Freelancing', 'Consulting', 'SaaS Tools', 'Marketing Tools', 'Email Marketing'] }
  ],

  // App Settings
  app: {
    name: 'AffiliateAI Pro',
    version: '1.0.0',
    toastDuration: 5000
  }
}

