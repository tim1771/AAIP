/**
 * AffiliateAI Pro - Configuration
 */

export const CONFIG = {
  // Supabase Configuration - Uses environment variables for security
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || 'https://itodkevoqcamcfyzwgqw.supabase.co',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0b2RrZXZvcWNhbWNmeXp3Z3F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNDYyNjIsImV4cCI6MjA3OTgyMjI2Mn0.hLmcLn299M4EPR07V7vh3uwsPfgzzBcmYn-SHkTCpXI'
  },

  // Multi-Provider AI Configuration
  ai: {
    providers: {
      groq: {
        id: 'groq',
        name: 'Groq',
        description: 'Ultra-fast inference with Llama models',
        icon: '⚡',
        baseUrl: 'https://api.groq.com/openai/v1',
        models: {
          fast: { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', speed: 'fastest' },
          balanced: { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', speed: 'fast' }
        },
        defaultModel: 'llama-3.3-70b-versatile',
        keyName: 'groq_api_key',
        keyPrefix: 'gsk_',
        free: true,
        capabilities: ['text-generation', 'chat']
      },
      anthropic: {
        id: 'anthropic',
        name: 'Claude (Anthropic)',
        description: 'Advanced reasoning with Opus 4.5',
        icon: '🧠',
        baseUrl: 'https://api.anthropic.com/v1',
        models: {
          powerful: { id: 'claude-opus-4-20250514', name: 'Claude Opus 4.5', speed: 'moderate' },
          balanced: { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', speed: 'fast' }
        },
        defaultModel: 'claude-opus-4-20250514',
        keyName: 'anthropic_api_key',
        keyPrefix: 'sk-ant-',
        free: false,
        capabilities: ['text-generation', 'chat', 'deep-reasoning', 'long-context']
      },
      google: {
        id: 'google',
        name: 'Google AI',
        description: 'Gemini & Nano Banana image generation',
        icon: '🍌',
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
        models: {
          text: { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', speed: 'fast' },
          imageGen: { id: 'imagen-3.0-generate-002', name: 'Nano Banana (Imagen 3)', speed: 'moderate' }
        },
        defaultModel: 'gemini-2.0-flash',
        keyName: 'google_api_key',
        keyPrefix: 'AIza',
        free: true,
        capabilities: ['text-generation', 'image-generation', 'multimodal']
      }
    },
    defaultTextProvider: 'groq',
    defaultImageProvider: 'google'
  },

  // Legacy Groq config (for backwards compatibility)
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

  // Affiliate Program Database
  affiliatePrograms: [
    // Digital Products & Courses
    { id: 1, name: 'ClickBank', category: 'Digital Products', commission: '50-75%', cookieDuration: '60 days', paymentThreshold: '$10', recurring: false, url: 'https://www.clickbank.com/affiliate/', rating: 4.5, niches: ['Health', 'Finance', 'Self-Improvement', 'Business'] },
    { id: 2, name: 'Teachable', category: 'Online Courses', commission: '30%', cookieDuration: '90 days', paymentThreshold: '$50', recurring: true, url: 'https://teachable.com/partners', rating: 4.3, niches: ['Education', 'Business', 'Technology'] },
    { id: 3, name: 'Udemy', category: 'Online Courses', commission: '15%', cookieDuration: '7 days', paymentThreshold: '$50', recurring: false, url: 'https://www.udemy.com/affiliate/', rating: 4.0, niches: ['Education', 'Technology', 'Business'] },
    { id: 4, name: 'Skillshare', category: 'Online Courses', commission: '$7/signup', cookieDuration: '30 days', paymentThreshold: '$10', recurring: false, url: 'https://www.skillshare.com/affiliates', rating: 4.2, niches: ['Education', 'Creative', 'Business'] },
    
    // E-commerce & Retail
    { id: 5, name: 'Amazon Associates', category: 'E-commerce', commission: '1-10%', cookieDuration: '24 hours', paymentThreshold: '$10', recurring: false, url: 'https://affiliate-program.amazon.com/', rating: 4.0, niches: ['All Niches'] },
    { id: 6, name: 'ShareASale', category: 'Marketplace', commission: 'Varies', cookieDuration: 'Varies', paymentThreshold: '$50', recurring: false, url: 'https://www.shareasale.com/', rating: 4.4, niches: ['All Niches'] },
    { id: 7, name: 'CJ Affiliate', category: 'Marketplace', commission: 'Varies', cookieDuration: 'Varies', paymentThreshold: '$50', recurring: false, url: 'https://www.cj.com/', rating: 4.3, niches: ['All Niches'] },
    { id: 8, name: 'Rakuten', category: 'E-commerce', commission: 'Varies', cookieDuration: 'Varies', paymentThreshold: '$50', recurring: false, url: 'https://rakutenadvertising.com/', rating: 4.1, niches: ['Retail', 'Fashion', 'Technology'] },
    
    // Software & SaaS
    { id: 9, name: 'GetResponse', category: 'Email Marketing', commission: '33%', cookieDuration: '120 days', paymentThreshold: '$50', recurring: true, url: 'https://www.getresponse.com/affiliate', rating: 4.6, niches: ['Business', 'Marketing'] },
    { id: 10, name: 'ConvertKit', category: 'Email Marketing', commission: '30%', cookieDuration: '90 days', paymentThreshold: '$50', recurring: true, url: 'https://convertkit.com/affiliate', rating: 4.7, niches: ['Business', 'Marketing', 'Creators'] },
    { id: 11, name: 'AWeber', category: 'Email Marketing', commission: '30%', cookieDuration: '365 days', paymentThreshold: '$50', recurring: true, url: 'https://www.aweber.com/affiliates.htm', rating: 4.4, niches: ['Business', 'Marketing'] },
    { id: 12, name: 'Mailchimp', category: 'Email Marketing', commission: '$30/referral', cookieDuration: '30 days', paymentThreshold: '$50', recurring: false, url: 'https://mailchimp.com/referral-program/', rating: 4.2, niches: ['Business', 'Marketing'] },
    { id: 13, name: 'Semrush', category: 'SEO Tools', commission: '$200/sale', cookieDuration: '120 days', paymentThreshold: '$50', recurring: false, url: 'https://www.semrush.com/affiliate-program/', rating: 4.8, niches: ['Marketing', 'SEO', 'Business'] },
    { id: 14, name: 'Ahrefs', category: 'SEO Tools', commission: '20%', cookieDuration: '60 days', paymentThreshold: '$50', recurring: true, url: 'https://ahrefs.com/affiliate', rating: 4.7, niches: ['Marketing', 'SEO', 'Business'] },
    { id: 15, name: 'Canva', category: 'Design Tools', commission: '$36/sale', cookieDuration: '30 days', paymentThreshold: '$50', recurring: false, url: 'https://www.canva.com/affiliates/', rating: 4.5, niches: ['Design', 'Marketing', 'Business'] },
    
    // Web Hosting
    { id: 16, name: 'Bluehost', category: 'Web Hosting', commission: '$65/sale', cookieDuration: '90 days', paymentThreshold: '$100', recurring: false, url: 'https://www.bluehost.com/affiliates', rating: 4.4, niches: ['Technology', 'Business', 'Blogging'] },
    { id: 17, name: 'SiteGround', category: 'Web Hosting', commission: '$50-100/sale', cookieDuration: '60 days', paymentThreshold: '$50', recurring: false, url: 'https://www.siteground.com/affiliates', rating: 4.6, niches: ['Technology', 'Business', 'Blogging'] },
    { id: 18, name: 'Hostinger', category: 'Web Hosting', commission: '60%', cookieDuration: '30 days', paymentThreshold: '$100', recurring: false, url: 'https://www.hostinger.com/affiliates', rating: 4.3, niches: ['Technology', 'Business', 'Blogging'] },
    { id: 19, name: 'Cloudways', category: 'Web Hosting', commission: '$50-125/sale', cookieDuration: '90 days', paymentThreshold: '$250', recurring: false, url: 'https://www.cloudways.com/en/affiliate.php', rating: 4.5, niches: ['Technology', 'Business'] },
    
    // VPN & Security
    { id: 20, name: 'NordVPN', category: 'VPN', commission: '40%', cookieDuration: '30 days', paymentThreshold: '$50', recurring: true, url: 'https://nordvpn.com/affiliate/', rating: 4.7, niches: ['Technology', 'Security', 'Privacy'] },
    { id: 21, name: 'ExpressVPN', category: 'VPN', commission: '$36/sale', cookieDuration: '90 days', paymentThreshold: '$100', recurring: false, url: 'https://www.expressvpn.com/affiliates', rating: 4.6, niches: ['Technology', 'Security', 'Privacy'] },
    { id: 22, name: 'Surfshark', category: 'VPN', commission: '40%', cookieDuration: '30 days', paymentThreshold: '$50', recurring: true, url: 'https://surfshark.com/affiliate', rating: 4.5, niches: ['Technology', 'Security', 'Privacy'] },
    
    // Finance & Trading
    { id: 23, name: 'Robinhood', category: 'Trading', commission: '$5-20/signup', cookieDuration: '30 days', paymentThreshold: '$50', recurring: false, url: 'https://robinhood.com/us/en/support/articles/invite-friends/', rating: 4.2, niches: ['Finance', 'Investing'] },
    { id: 24, name: 'Coinbase', category: 'Cryptocurrency', commission: '50% of fees', cookieDuration: '90 days', paymentThreshold: '$50', recurring: true, url: 'https://www.coinbase.com/affiliates', rating: 4.4, niches: ['Finance', 'Cryptocurrency'] },
    { id: 25, name: 'Wealthfront', category: 'Investing', commission: '$25/referral', cookieDuration: '30 days', paymentThreshold: '$50', recurring: false, url: 'https://www.wealthfront.com/invite', rating: 4.3, niches: ['Finance', 'Investing'] },
    
    // Health & Wellness
    { id: 26, name: 'iHerb', category: 'Health Supplements', commission: '5%', cookieDuration: '7 days', paymentThreshold: '$20', recurring: false, url: 'https://www.iherb.com/info/rewards', rating: 4.1, niches: ['Health', 'Wellness', 'Supplements'] },
    { id: 27, name: 'MyProtein', category: 'Fitness Supplements', commission: '6%', cookieDuration: '30 days', paymentThreshold: '$50', recurring: false, url: 'https://www.myprotein.com/affiliates.list', rating: 4.2, niches: ['Health', 'Fitness'] },
    { id: 28, name: 'Onnit', category: 'Health Supplements', commission: '15%', cookieDuration: '45 days', paymentThreshold: '$50', recurring: false, url: 'https://www.onnit.com/affiliate-program/', rating: 4.4, niches: ['Health', 'Fitness', 'Wellness'] },
    
    // Website Builders
    { id: 29, name: 'Wix', category: 'Website Builder', commission: '$100/sale', cookieDuration: '30 days', paymentThreshold: '$100', recurring: false, url: 'https://www.wix.com/about/affiliates', rating: 4.3, niches: ['Business', 'Technology'] },
    { id: 30, name: 'Squarespace', category: 'Website Builder', commission: '$100-200/sale', cookieDuration: '45 days', paymentThreshold: '$100', recurring: false, url: 'https://www.squarespace.com/affiliate', rating: 4.4, niches: ['Business', 'Technology', 'Creative'] },
    { id: 31, name: 'Shopify', category: 'E-commerce Platform', commission: '$58-2000/sale', cookieDuration: '30 days', paymentThreshold: '$10', recurring: false, url: 'https://www.shopify.com/affiliates', rating: 4.7, niches: ['Business', 'E-commerce'] },
    { id: 32, name: 'WordPress.com', category: 'Website Builder', commission: '20%', cookieDuration: '30 days', paymentThreshold: '$100', recurring: false, url: 'https://automattic.com/affiliates/', rating: 4.2, niches: ['Business', 'Technology', 'Blogging'] },
    
    // AI Tools
    { id: 33, name: 'Jasper AI', category: 'AI Writing', commission: '25%', cookieDuration: '30 days', paymentThreshold: '$25', recurring: true, url: 'https://www.jasper.ai/affiliates', rating: 4.5, niches: ['Marketing', 'Business', 'Technology'] },
    { id: 34, name: 'Copy.ai', category: 'AI Writing', commission: '45%', cookieDuration: '60 days', paymentThreshold: '$100', recurring: true, url: 'https://www.copy.ai/affiliate', rating: 4.4, niches: ['Marketing', 'Business'] },
    { id: 35, name: 'Surfer SEO', category: 'AI SEO', commission: '25%', cookieDuration: '60 days', paymentThreshold: '$50', recurring: true, url: 'https://surferseo.com/affiliate-program/', rating: 4.6, niches: ['Marketing', 'SEO'] },
    
    // Travel
    { id: 36, name: 'Booking.com', category: 'Travel', commission: '25-40%', cookieDuration: 'Session', paymentThreshold: '$100', recurring: false, url: 'https://www.booking.com/affiliate-program/', rating: 4.3, niches: ['Travel'] },
    { id: 37, name: 'TripAdvisor', category: 'Travel', commission: '50%', cookieDuration: '14 days', paymentThreshold: '$50', recurring: false, url: 'https://www.tripadvisor.com/Affiliates', rating: 4.1, niches: ['Travel'] },
    { id: 38, name: 'Viator', category: 'Travel Tours', commission: '8%', cookieDuration: '30 days', paymentThreshold: '$50', recurring: false, url: 'https://www.viator.com/partner/', rating: 4.2, niches: ['Travel'] },
    
    // Fashion & Beauty
    { id: 39, name: 'ASOS', category: 'Fashion', commission: '5%', cookieDuration: '30 days', paymentThreshold: '$50', recurring: false, url: 'https://www.asos.com/affiliate-programme/', rating: 4.0, niches: ['Fashion'] },
    { id: 40, name: 'Sephora', category: 'Beauty', commission: '5%', cookieDuration: '24 hours', paymentThreshold: '$50', recurring: false, url: 'https://www.sephora.com/beauty/affiliate-program', rating: 4.2, niches: ['Beauty', 'Fashion'] },
    
    // Education & Learning
    { id: 41, name: 'Coursera', category: 'Online Learning', commission: '20-45%', cookieDuration: '30 days', paymentThreshold: '$50', recurring: false, url: 'https://www.coursera.org/affiliates', rating: 4.4, niches: ['Education', 'Technology', 'Business'] },
    { id: 42, name: 'LinkedIn Learning', category: 'Professional Learning', commission: '$30/sale', cookieDuration: '30 days', paymentThreshold: '$50', recurring: false, url: 'https://learning.linkedin.com/affiliates', rating: 4.3, niches: ['Education', 'Business', 'Technology'] },
    { id: 43, name: 'MasterClass', category: 'Online Learning', commission: '25%', cookieDuration: '30 days', paymentThreshold: '$50', recurring: false, url: 'https://www.masterclass.com/affiliate', rating: 4.5, niches: ['Education', 'Creative', 'Business'] },
    
    // More SaaS
    { id: 44, name: 'HubSpot', category: 'CRM', commission: '$250-1000/sale', cookieDuration: '90 days', paymentThreshold: '$250', recurring: false, url: 'https://www.hubspot.com/partners/affiliates', rating: 4.8, niches: ['Business', 'Marketing'] },
    { id: 45, name: 'Freshworks', category: 'CRM', commission: '15%', cookieDuration: '90 days', paymentThreshold: '$100', recurring: true, url: 'https://www.freshworks.com/affiliate-program/', rating: 4.3, niches: ['Business'] },
    { id: 46, name: 'Monday.com', category: 'Project Management', commission: '$150/sale', cookieDuration: '90 days', paymentThreshold: '$150', recurring: false, url: 'https://monday.com/lp/affiliates', rating: 4.5, niches: ['Business', 'Productivity'] },
    { id: 47, name: 'Notion', category: 'Productivity', commission: '50%', cookieDuration: '90 days', paymentThreshold: '$10', recurring: false, url: 'https://www.notion.so/affiliates', rating: 4.6, niches: ['Productivity', 'Business'] },
    { id: 48, name: 'Grammarly', category: 'Writing Tools', commission: '$20/sale', cookieDuration: '90 days', paymentThreshold: '$50', recurring: false, url: 'https://www.grammarly.com/affiliates', rating: 4.5, niches: ['Writing', 'Education', 'Business'] },
    { id: 49, name: 'Elementor', category: 'WordPress', commission: '50%', cookieDuration: '45 days', paymentThreshold: '$200', recurring: false, url: 'https://elementor.com/affiliates/', rating: 4.6, niches: ['Technology', 'Business', 'Design'] },
    { id: 50, name: 'Fiverr', category: 'Freelance Marketplace', commission: '$15-150/sale', cookieDuration: '30 days', paymentThreshold: '$100', recurring: false, url: 'https://affiliates.fiverr.com/', rating: 4.4, niches: ['Business', 'Freelancing'] }
  ],

  // App Settings
  app: {
    name: 'AffiliateAI Pro',
    version: '2.0.0',
    toastDuration: 5000
  }
}
