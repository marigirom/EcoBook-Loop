import { useState } from 'react';
import React from 'react';
import classNames from 'classnames';
import clsx from 'clsx';

//Avatar
export function Avatar({ children }) {
    return (
        <div className='w-10 h-10 rounded-full overflow-hidden border-2 border-green-500 shadow-sm'>
            {children}
        </div>
    )
}

//button
export function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

//Card
export function Card({ className, children }) {
  return (
    <div
      className={classNames(
        "rounded-xl border bg-white p-4 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardContent({ className, children }) {
  return (
    <div className={classNames("mt-2 text-sm text-gray-700", className)}>
      {children}
    </div>
  );
}

//input

export function Input({ placeholder, className, ...props}) {
    return (
        <input
          type ="text"
          placeholder={placeholder}
          className={clsx("w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition",
        className)}
        {...props}
        />
    )
}

//Tabs
export function Tabs({ defaultvalue, children }) {
    const [active, setActive] = useState(defaultvalue);
    const tabChildren = React.children.map(children, (child) =>
    React.cloneElement(child, { active, setActive})
);
return (
    <div className='w-full'>{tabChildren}</div>
);
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
          ? "bg-green-600 text-white shadow"
          : "bg-white text-green-700 hover:bg-green-200"
      }`}
    >
      {children}
    </button>
  );
}