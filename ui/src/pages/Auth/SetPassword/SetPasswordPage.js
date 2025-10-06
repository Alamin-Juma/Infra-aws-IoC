import React from 'react'
import AuthLayout from '../../../layouts/AuthLayout';
import withAuth from '../../../utils/withAuth';

const SetPasswordPage = () => {
  return (
    <div>
      
    </div>
  )
}

const WrappedLanding = withAuth(SetPasswordPage, true);
export default () => <AuthLayout><WrappedLanding /></AuthLayout>;

