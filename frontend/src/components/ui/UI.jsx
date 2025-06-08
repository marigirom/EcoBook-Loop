import React, { useState } from 'react';
import classNames from 'classnames';
import clsx from 'clsx';

//
//  Avatar

export function Avatar({ children }) {
  return (
    <div className="avatar">
      {children}
    </div>
  );
}

//
//  Button

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'custom-btn';
  const variantClass = {
    primary: 'btn-primary-custom',
    outline: 'btn-outline-custom',
    dark: 'btn-dark-custom',
  }[variant] || 'btn-primary-custom';

  return (
    <button className={`${base} ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
}

//
// Card

export const Card = ({ children, className = '' }) => (
  <div className={`custom-card ${className}`}>
    <div className="custom-card-body">{children}</div>
  </div>
);

//
// CardContent

export function CardContent({ className = '', children }) {
  return (
    <div className={classNames('mt-2 text-sm text-gray-700', className)}>
      {children}
    </div>
  );
}

//
// Input
export function Input({ placeholder, className = '', ...props }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      className={clsx(
        'w-full px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition',
        className
      )}
      {...props}
    />
  );
}

//
// Tabs (for switching views)
export function Tabs({ defaultvalue, children }) {
  const [active, setActive] = useState(defaultvalue);

  const tabChildren = React.Children.map(children, (child) =>
    React.cloneElement(child, { active, setActive })
  );

  return <div className="w-full">{tabChildren}</div>;
}

export function TabsList({ children }) {
  return (
    <div className="flex space-x-2 bg-green-100 p-2 rounded-lg">
      {children}
    </div>
  );
}

export function TabsTrigger({ value, active, setActive, children }) {
  const isActive = active === value;

  return (
    <button
      onClick={() => setActive(value)}
      className={`px-4 py-2 rounded-lg font-medium transition ${
        isActive
          ? 'bg-green-600 text-white shadow'
          : 'bg-white text-green-700 hover:bg-green-200'
      }`}
    >
      {children}
    </button>
  );
}
