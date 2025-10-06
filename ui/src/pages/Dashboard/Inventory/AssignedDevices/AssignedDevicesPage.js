import React from 'react';
import MainLayout from '../../../../layouts/MainLayout';
import withAuth from '../../../../utils/withAuth';

const AssignedDevicesPage = () => {
  return (
    <div>
      Assigned Devices
    </div>
  )
}

const WrappedLanding = withAuth(AssignedDevicesPage, false);
export default () => <MainLayout><WrappedLanding /></MainLayout>;

