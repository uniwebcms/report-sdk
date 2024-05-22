import React from 'react';
import Paragraph from './Paragraph';
import TextRun from './TextRun';

const website = uniweb.activeWebsite;

/**
 * Retrieves the page profile of the active page from the website.
 *
 * @returns {Object|null} - The profile of the active page, or null if no active page is found.
 */
const getPageProfile = () => {
    return website?.activePage ? website.activePage.getPageProfile() : null;
};

/**
 * A component that renders an image inside a Paragraph component.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.data - The data for the image.
 * @param {string} props.data.value - The value used to fetch the image URL.
 * @param {string} props.data.url - The direct URL of the image.
 * @param {string} props.data.alt - The alternative text for the image.
 * @returns {JSX.Element} - A Paragraph component containing the image or a alt text.
 */
export default function Image({ data, ...props }) {
    const { value, url, alt } = data;

    let src = '',
        format = ''; // docx supports jpeg, jpg, bmp, gif and png

    const profile = getPageProfile();

    if (!profile) {
        console.warn('No active page profile found.');

        return (
            <Paragraph>
                <TextRun>{alt}</TextRun>
            </Paragraph>
        );
    }

    if (url) {
        src = url;
    } else {
        src = profile.getAssetInfo(value, true, alt).src;
    }

    format = ['jpeg', 'jpg', 'bmp', 'gif', 'png'].includes(src.split('.').pop().toLowerCase()) ? src.split('.').pop().toLowerCase() : null;

    if (!format) {
        console.warn('Unsupported image format:', src);

        return (
            <Paragraph>
                <TextRun>{alt}</TextRun>
            </Paragraph>
        );
    }

    return (
        <Paragraph data-spacing-after='50' {...props}>
            <img src={src} alt={alt} data-type='image' data-src={src} data-transformation-width='400' data-transformation-height='300' />
        </Paragraph>
    );
}

/**
 * A component that renders multiple Image components from a data array.
 *
 * @param {Array} data - Array of image data objects to render.
 * @param {Object} dataProps - Props to pass to each Image component.
 * @returns {JSX.Element|null} - A fragment containing all images or null if no data.
 */
export function Images({ data, dataProps = {} }) {
    if (!data || !data.length) return null;

    return data.map((image, index) => {
        return <Image key={index} data={image} {...dataProps}></Image>;
    });
}
