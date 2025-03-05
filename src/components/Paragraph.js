import React, { Fragment } from 'react';
import TextRun from './TextRun';
import { parseStyledString } from '../utils';
import { twJoin } from 'tailwind-merge';

/**
 * Finds the first significant text content in the second item of a list.
 *
 * @param {Array} list - The list of items, each with a `paragraphs` array containing HTML strings.
 * @returns {string} - The first significant text part of the second item's first paragraph, or an empty string if not found.
 */
function findSecondLeadingText(list) {
    const htmlString = list[1]?.paragraphs?.[0] || '';
    // Regular expression to split the HTML string by tags
    const regex = /(<\/?[a-z][^>]*>)|([^<>]+)/gi;

    // Split the HTML string by tags and keep the tags as well
    const parts = htmlString.match(regex) || [];

    // Strip the tags from the parts
    const strippedParts = parts.map((part) => {
        // If the part starts with '<' and ends with '>', it's a tag, so remove it
        if (part.startsWith('<') && part.endsWith('>')) {
            return '';
        }
        // Otherwise, it's text content, so return it as is
        return part;
    });

    // Filter out any empty strings
    const filteredParts = strippedParts.filter((part) => part !== '');

    return filteredParts[0] || '';
}

/**
 * Creates a styled text run component.
 *
 * @param {Object} text - The text object containing content and style flags.
 * @param {Object} [extraDataAttributes={}] - Additional data attributes to add to the component.
 * @param {string} [className=''] - Additional tailwindCSS class names to apply.
 * @returns {JSX.Element} - A TextRun component with applied styles and content.
 */
function createTextRun(text, extraDataAttributes = {}, className = '') {
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
        <TextRun className={twJoin(italics && 'italic', bold && 'font-bold', underline && 'underline', className)} {...dataAttributes} {...extraDataAttributes}>
            {content}
        </TextRun>
    );
}

/**
 * A dynamic paragraph component that can render content in different styles based on its format.
 *
 * @param {Object} props - The component props.
 * @param {React.ComponentType} [props.as='p'] - The tag or component to use as the paragraph wrapper.
 * @param {string} [props.data] - The styled string data to parse and display.
 * @param {Object} [props.format] - Format options that modify the layout of the paragraph.
 * @param {React.ReactNode} [props.children] - Default children to render if no data is provided.
 * @returns {JSX.Element} - A paragraph element styled according to the provided format and data.
 */
export default function Paragraph({ as = 'p', data, children, format, ...props }) {
    const Tag = as;

    if (data) {
        const parsed = parseStyledString(data);

        if (format) {
            const { mode, list, numberingNumber } = format;

            if (mode === 'twoColumnLayoutWide' || mode === 'twoColumnLayout' || mode === 'twoColumnLayoutJustified' || mode === 'twoLevelIndentation') {
                const target = findSecondLeadingText(list);

                const firstColumn = [],
                    secondColumn = [],
                    targetIndex = parsed.findIndex((text) => text.content === target);

                parsed.forEach((text) => {
                    if (parsed.indexOf(text) < targetIndex) {
                        firstColumn.push(text);
                    } else {
                        secondColumn.push(text);
                    }
                });

                if (mode === 'twoColumnLayoutWide' || mode === 'twoColumnLayout') {
                    return (
                        <Tag {...props} className='flex' data-type='paragraph' data-style={mode}>
                            <span className={mode === 'twoColumnLayoutWide' ? 'w-2/3' : 'w-1/2'} data-type='contentWrapper'>
                                {firstColumn.map((text, index) => (
                                    <Fragment key={index}>{createTextRun(text)}</Fragment>
                                ))}
                            </span>
                            <span className={mode === 'twoColumnLayoutWide' ? 'w-1/3' : 'w-1/2'} data-type='contentWrapper'>
                                {secondColumn.map((text, index) => (
                                    <Fragment key={index}>
                                        {createTextRun(
                                            text,
                                            index === 0
                                                ? {
                                                      'data-positionaltab-alignment': 'left',
                                                      'data-positionaltab-relativeto': 'indent',
                                                      'data-positionaltab-leader': 'none'
                                                  }
                                                : {}
                                        )}
                                    </Fragment>
                                ))}
                            </span>
                        </Tag>
                    );
                } else if (mode === 'twoColumnLayoutJustified') {
                    return (
                        <Tag {...props} className='flex justify-between' data-type='paragraph' data-style={mode}>
                            <span data-type='contentWrapper'>
                                {firstColumn.map((text, index) => (
                                    <Fragment key={index}>{createTextRun(text)}</Fragment>
                                ))}
                            </span>
                            <span data-type='contentWrapper'>
                                {secondColumn.map((text, index) => (
                                    <Fragment key={index}>
                                        {createTextRun(
                                            text,
                                            index === 0
                                                ? {
                                                      'data-positionaltab-alignment': 'right',
                                                      'data-positionaltab-relativeto': 'margin',
                                                      'data-positionaltab-leader': 'none'
                                                  }
                                                : {}
                                        )}
                                    </Fragment>
                                ))}
                            </span>
                        </Tag>
                    );
                } else if (mode === 'twoLevelIndentation') {
                    return (
                        <Tag {...props} className='flex' data-type='paragraph' data-style={mode}>
                            <span className='w-1/3 pl-8' data-type='contentWrapper'>
                                {firstColumn.map((text, index) => (
                                    <Fragment key={index}>{createTextRun(text)}</Fragment>
                                ))}
                            </span>
                            <span className='w-2/3 pl-4' data-type='contentWrapper'>
                                {secondColumn.map((text, index) => (
                                    <Fragment key={index}>
                                        {createTextRun(
                                            text,
                                            index === 0
                                                ? {
                                                      'data-positionaltab-alignment': 'left',
                                                      'data-positionaltab-relativeto': 'indent',
                                                      'data-positionaltab-leader': 'none'
                                                  }
                                                : {}
                                        )}
                                    </Fragment>
                                ))}
                            </span>
                        </Tag>
                    );
                }
            } else if (mode === 'ordered-list-reversed' && numberingNumber) {
                return (
                    <Tag {...props} className='flex ml-3' data-type='paragraph' data-style={'reversedList'}>
                        <span className='w-8 text-right' data-type='contentWrapper'>
                            {createTextRun({
                                content: `${numberingNumber}.`
                            })}
                        </span>
                        <span className='flex-1 pl-8' data-type='contentWrapper'>
                            {parsed.map((text, index) => {
                                return (
                                    <Fragment key={index}>
                                        {createTextRun(
                                            text,
                                            index === 0
                                                ? {
                                                      'data-positionaltab-alignment': 'left',
                                                      'data-positionaltab-relativeto': 'indent',
                                                      'data-positionaltab-leader': 'none'
                                                  }
                                                : {}
                                        )}
                                    </Fragment>
                                );
                            })}
                        </span>
                    </Tag>
                );
            }
        }

        return (
            <Tag {...props} data-type='paragraph'>
                {parsed.map((text, index) => {
                    return <Fragment key={index}>{createTextRun(text)}</Fragment>;
                })}
            </Tag>
        );
    }

    return (
        <p {...props} data-type='paragraph'>
            {children}
        </p>
    );
}

/**
 * Component that renders multiple paragraphs from a data array.
 *
 * @param {Array} data - Array of paragraph data to render.
 * @param {Object} dataProps - Props to pass to each Paragraph component.
 * @returns {JSX.Element|null} - A fragment containing all paragraphs or null if no data.
 */
export function Paragraphs({ data, dataProps = {} }) {
    if (!data || !data.length) return null;

    return data.map((paragraph, index) => {
        return <Paragraph key={index} data={paragraph} {...dataProps}></Paragraph>;
    });
}
