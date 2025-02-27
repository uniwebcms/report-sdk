import React, { Fragment } from 'react';
import { parseStyledString } from '../utils';
import { twJoin, twMerge } from 'tailwind-merge';
import TextRun from './TextRun';

/**
 * Creates a TextRun component with applied styles and content.
 *
 * @param {Object} text - The text object containing content and style flags.
 * @param {string} text.content - The text content.
 * @param {boolean} text.italics - Flag indicating if the text should be italicized.
 * @param {boolean} text.bold - Flag indicating if the text should be bold.
 * @param {boolean} text.underline - Flag indicating if the text should be underlined.
 * @returns {JSX.Element} - A TextRun component with applied styles and content.
 */
const createTextRun = (text) => {
    const { content, italics, bold, underline } = text;

    const dataAttributes = {};

    if (italics) {
        dataAttributes['data-italics'] = true;
    }

    if (bold) {
        dataAttributes['data-bold'] = true;
    }

    if (underline) {
        dataAttributes['data-underline'] = true;
    }

    return (
        <TextRun className={twJoin(italics && 'italic', bold && 'font-bold', underline && 'underline')} {...dataAttributes}>
            {content}
        </TextRun>
    );
};

/**
 * A component that renders a level 1 heading (H1) inside a styled paragraph.
 *
 * @param {Object} props - The component props.
 * @param {string} [props.data] - The styled string data to parse and display.
 * @param {React.ReactNode} [props.children] - Default children to render if no data is provided.
 * @param {string} [props.className] - Additional CSS class names to apply.
 * @returns {JSX.Element|null} - A paragraph element styled as a heading or null if no data or children.
 */
export function H1({ data, children, className, ...props }) {
    if (!children && !data) return null;

    const properties = {
        // className: twMerge('text-[18px] py-[15px] text-center', className),
        ...props,
        'data-type': 'paragraph',
        'data-heading': 'HEADING_1'
    };

    if (data) {
        const parsed = parseStyledString(data);

        return (
            <h1 {...properties}>
                {parsed.map((text, index) => {
                    return <Fragment key={index}>{createTextRun(text)}</Fragment>;
                })}
            </h1>
        );
    }

    return <p {...properties}>{children}</p>;
}

/**
 * A component that renders a level 2 heading (H2) inside a styled paragraph.
 *
 * @param {Object} props - The component props.
 * @param {string} [props.data] - The styled string data to parse and display.
 * @param {React.ReactNode} [props.children] - Default children to render if no data is provided.
 * @param {string} [props.className] - Additional CSS class names to apply.
 * @returns {JSX.Element|null} - A paragraph element styled as a heading or null if no data or children.
 */
export function H2({ data, children, className, ...props }) {
    if (!children && !data) return null;

    const properties = {
        // className: twMerge('text-[20px] pt-1 pb-3 text-center', className),
        ...props,
        'data-type': 'paragraph',
        'data-heading': 'HEADING_2'
    };

    if (data) {
        const parsed = parseStyledString(data);

        return (
            <h2 {...properties}>
                {parsed.map((text, index) => {
                    return <Fragment key={index}>{createTextRun(text)}</Fragment>;
                })}
            </h2>
        );
    }

    return <h2 {...properties}>{children}</h2>;
}

/**
 * A component that renders a level 3 heading (H3) inside a styled paragraph.
 *
 * @param {Object} props - The component props.
 * @param {string} [props.data] - The styled string data to parse and display.
 * @param {React.ReactNode} [props.children] - Default children to render if no data is provided.
 * @param {string} [props.className] - Additional CSS class names to apply.
 * @returns {JSX.Element|null} - A paragraph element styled as a heading or null if no data or children.
 */
export function H3({ data, children, className, ...props }) {
    if (!children && !data) return null;

    const properties = {
        // className: twMerge('text-[20px] font-bold underline pt-6 pb-3 text-center', className),
        ...props,
        'data-type': 'paragraph',
        'data-heading': 'HEADING_3'
    };

    if (data) {
        const parsed = parseStyledString(data);

        return (
            <h3 {...properties}>
                {parsed.map((text, index) => {
                    return <Fragment key={index}>{createTextRun(text)}</Fragment>;
                })}
            </h3>
        );
    }

    return <h3 {...properties}>{children}</h3>;
}

/**
 * A component that renders a level 4 heading (H4) inside a styled paragraph.
 *
 * @param {Object} props - The component props.
 * @param {string} [props.data] - The styled string data to parse and display.
 * @param {React.ReactNode} [props.children] - Default children to render if no data is provided.
 * @param {string} [props.className] - Additional CSS class names to apply.
 * @returns {JSX.Element|null} - A paragraph element styled as a heading or null if no data or children.
 */
export function H4({ data, children, className, ...props }) {
    if (!children && !data) return null;

    const properties = {
        // className: twMerge('text-[18px] py-[8px]', className),
        ...props,
        'data-type': 'paragraph',
        'data-heading': 'HEADING_4'
    };

    if (data) {
        const parsed = parseStyledString(data);

        return (
            <h4 {...properties}>
                {parsed.map((text, index) => {
                    return <Fragment key={index}>{createTextRun(text)}</Fragment>;
                })}
            </h4>
        );
    }

    return <h4 {...properties}>{children}</h4>;
}
