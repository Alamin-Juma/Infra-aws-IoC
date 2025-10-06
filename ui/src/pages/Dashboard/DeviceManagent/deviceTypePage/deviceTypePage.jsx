import React from 'react';
import withAuth from '../../../../utils/withAuth';
import MainLayout from '../../../../layouts/MainLayout';
import DeviceForm from '../../../../components/DeviceForm';

const DeviceTypePage = () => {
  return (
    <div>
      <DeviceForm />
    </div>
  )
}


const WrappedLanding = withAuth(DeviceTypePage, false);
export default () => <MainLayout><WrappedLanding /></MainLayout>;
