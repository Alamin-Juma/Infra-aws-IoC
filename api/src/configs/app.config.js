const config = {
  email: process.env.EMAIL,
  email_password: process.env.EMAIL_PASSWORD,
  app_password: process.env.APP_PASSWORD,
  jwt_secret: process.env.JWT_SECRET,
  FRONTEND_URL: process.env.FRONTEND_URL,
  FRONTEND_URL_PROD: process.env.FRONTEND_URL_PROD,
  API_BASE_URL: process.env.API_BASE_URL,
  API_BASE_URL_PROD: process.env.API_BASE_URL_PROD,
  ADMIN_EMAIL:  process.env.ADMIN_EMAIL,
  PROCUREMENT_EMAIL:  process.env.PROCUREMENT_EMAIL,
  FINANCE_EMAIL:  process.env.FINANCE_EMAIL,
  
  PAGE_LIMIT: 10,
  PAGE: 1,

  EMAIL: {
    LOGO_URL: 'https://res.cloudinary.com/dr8syainc/image/upload/v1742228014/logowhite_hfci38.png',
    STYLES: {
      BACKGROUND_COLOR: '#f4f4f4',
      PRIMARY_COLOR: '#77B634',
      TEXT_COLOR: '#333',
      SECONDARY_TEXT_COLOR: '#777',
      BOX_SHADOW: '0 4px 8px rgba(0, 0, 0, 0.1)'
    },
    TEMPLATES: {
      BASE: {
        MAX_WIDTH: '600px',
        BORDER_RADIUS: '8px',
        PADDING: '20px',
        FONT_FAMILY: 'Arial, sans-serif',
        FONT_SIZE: '16px',
        FOOTER_FONT_SIZE: '12px'
      }
    }
  },
  roles: {
    loginEnabled: ['Admin', 'Editor', 'Viewer', 'moderator', 'user', 'finance', 'it_staff', 'procurement']
  }
};
 
export default config;
