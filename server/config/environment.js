const environment = {
  development: {
    firebase: {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    email: {
      service: process.env.EMAIL_SERVICE || 'gmail',
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    server: {
      port: process.env.PORT || 5000,
      clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
      nodeEnv: process.env.NODE_ENV || 'development'
    }
  },
  production: {
    firebase: {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    email: {
      service: process.env.EMAIL_SERVICE || 'gmail',
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    server: {
      port: process.env.PORT || 5000,
      clientUrl: process.env.CLIENT_URL,
      nodeEnv: process.env.NODE_ENV || 'production'
    }
  }
};

const getConfig = () => {
  return environment[process.env.NODE_ENV] || environment.development;
};

module.exports = { getConfig };