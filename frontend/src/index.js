import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { Amplify } from 'aws-amplify';

// Configure Amplify for Cognito authentication
// Make sure to set the environment variables in your .env file
// REACT_APP_AWS_REGION, REACT_APP_USER_POOL_ID, REACT_APP_USER_POOL_CLIENT_ID,
// REACT_APP_COGNITO_DOMAIN, REACT_APP_REDIRECT_SIGN_IN, REACT_APP_REDIRECT_SIGN_OUT,
// REACT_APP_API_URL
Amplify.configure({
  Auth: {
    region: process.env.REACT_APP_AWS_REGION || 'us-east-1',
    userPoolId: process.env.REACT_APP_USER_POOL_ID,
    userPoolWebClientId: process.env.REACT_APP_USER_POOL_CLIENT_ID,
    mandatorySignIn: true,
    oauth: {
      domain: `${process.env.REACT_APP_COGNITO_DOMAIN}.auth.${process.env.REACT_APP_AWS_REGION}.amazoncognito.com`,
      scope: ['email', 'profile', 'openid'],
      redirectSignIn: process.env.REACT_APP_REDIRECT_SIGN_IN,
      redirectSignOut: process.env.REACT_APP_REDIRECT_SIGN_OUT,
      responseType: 'code'
    }
  },
  API: {
    endpoints: [
      {
        name: 'api',
        endpoint: process.env.REACT_APP_API_URL,
        region: process.env.REACT_APP_AWS_REGION || 'us-east-1'
      }
    ]
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);