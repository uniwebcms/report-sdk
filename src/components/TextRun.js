import React from 'react';

/**
 * A React component that renders its children inside a span element with a `data-type` attribute set to 'text'.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {React.ReactNode} props.children - The content to be rendered inside the span.
 * @returns {JSX.Element} - A span element containing the children.
 */
export default function TextRun({ children, ...props }) {
    return (
        <span {...props} data-type='text'>
            {children}
        </span>
    );
}
