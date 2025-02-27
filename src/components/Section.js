import React from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * A React component that renders its children inside a section element with a maximum width of 4xl.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {React.ReactNode} props.children - The content to be rendered inside the section.
 * @param {string} [props.className] - Additional classes to apply to the section.
 * @returns {JSX.Element} - A section element containing the children.
 */
export default function Section({ children, className = '', tooltip, ...props }) {
    return (
        <section className={twMerge('mx-auto w-full max-w-4xl', className, tooltip && 'flex items-start space-x-2')} {...props}>
            <div className='flex-grow'>{children}</div>
            {tooltip}
        </section>
    );
}
