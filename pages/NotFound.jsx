import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center mount">
      <h1 className="text-6xl font-bold text-gradient">404</h1>
      <h2 className="text-2xl font-semibold text-text-primary mt-4">Page Not Found</h2>
      <p className="text-text-secondary mt-2 max-w-md">Sorry, the page you are looking for does not exist or has been moved.</p>
      <Link 
        to="/dashboard" 
        className="mt-6 btn-pill"
      >
        Go to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
