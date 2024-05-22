import React from 'react';
import Paragraph from './Paragraph';
import TextRun from './TextRun';

/**
 * A component that renders a hyperlink inside a Paragraph component.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.data - The data for the link.
 * @param {string} props.data.label - The text label for the link.
 * @param {string} props.data.href - The URL or anchor for the link.
 * @returns {JSX.Element} - A Paragraph component containing the hyperlink.
 */
export default function Link({ data, ...props }) {
    const { label, href } = data;

    const isExternal = href.startsWith('http');

    const linkDataAttrs = {
        'data-type': isExternal ? 'externalHyperlink' : 'internalHyperlink'
    };

    if (isExternal) {
        linkDataAttrs['data-link'] = href;
    } else {
        linkDataAttrs['data-anchor'] = href;
    }

    return (
        <Paragraph {...props}>
            <a href={href} className='underline text-blue-700' {...linkDataAttrs}>
                <TextRun data-style='Hyperlink'>{label}</TextRun>
            </a>
        </Paragraph>
    );
}

/**
 * A component that renders multiple Link components from a data array.
 *
 * @param {Array} data - Array of link data objects to render.
 * @param {Object} dataProps - Props to pass to each Link component.
 * @returns {JSX.Element|null} - A fragment containing all links or null if no data.
 */
export function Links({ data, dataProps = {} }) {
    if (!data || !data.length) return null;

    return data.map((link, index) => {
        return <Link key={index} data={link} {...dataProps}></Link>;
    });
}
