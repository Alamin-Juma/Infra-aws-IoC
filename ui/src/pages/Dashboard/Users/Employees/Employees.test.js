import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'; // For routing context
import Employees from './Employees';
import '@testing-library/jest-dom';

jest.mock('../../../../context/AuthContext', () => ({
  useAuth: () => ({
    hasPermissions: () => true,
  }),
}));
// Mock the withAuth and MainLayout components
jest.mock('../../../../utils/withAuth', () => (Component, _) => Component);
jest.mock('../../../../layouts/MainLayout', () => ({ children }) => <div>{children}</div>);

describe('Employees Component', () => {
  test('renders the main container and grid', () => {
    render(
      <MemoryRouter>
        <Employees />
      </MemoryRouter>
    );

    // Check if the main container is rendered
    const mainContainer = screen.getByTestId('main-container'); // Use data-testid
    expect(mainContainer).toBeInTheDocument();

  });
});
