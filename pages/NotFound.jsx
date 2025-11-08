
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <h2 className="text-2xl font-semibold text-text-primary mt-4">Page Not Found</h2>
      <p className="text-text-secondary mt-2">
        Sorry, the page you are looking for does not exist.
      </p>
      <Link 
        to="/dashboard" 
        className="mt-6 px-6 py-2 text-white bg-primary rounded-lg hover:bg-opacity-90 transition-colors"
      >
        Go to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
