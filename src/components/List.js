import React, { Fragment } from 'react';
import { Paragraphs } from './Paragraph';
import { Links } from './Link';
import { Images } from './Image';

/**
 * A component that renders a list of items, each potentially containing paragraphs, links, images, and nested lists.
 *
 * @param {Object} props - The component props.
 * @param {Array} props.data - The array of list items to render.
 * @param {number} [props.level=0] - The current nesting level of the list.
 * @returns {JSX.Element[]} - An array of fragments containing the rendered list items.
 */
export default function List({ data, level = 0 }) {
    return data.map((entry, index) => {
        const { paragraphs, links, imgs, lists } = entry;

        const className = `relative pl-8 before:absolute before:top-[50%] before:left-0 before:translate-y-[-50%] before:w-2 before:h-2 before:rounded-full before:bg-black`;
        const style = { marginLeft: `${(level + 1) * 1.5}rem` };

        const dataProps = {
            className: className,
            style: style,
            'data-bullet-level': level
        };

        return (
            <Fragment key={index}>
                <Paragraphs data={paragraphs} dataProps={dataProps}></Paragraphs>
                <Images data={imgs} dataProps={dataProps}></Images>
                <Links data={links} dataProps={dataProps}></Links>
                <Lists data={lists} dataProps={{ level: level + 1 }}></Lists>
            </Fragment>
        );
    });
}

/**
 * A component that renders multiple List components from a data array.
 *
 * @param {Object} props - The component props.
 * @param {Array} props.data - The array of lists to render.
 * @param {Object} [props.dataProps={}] - Additional props to pass to each List component.
 * @returns {JSX.Element|null} - A fragment containing all lists or null if no data.
 */
export function Lists({ data, dataProps = {} }) {
    if (!data || !data.length) return null;

    return data.map((list, index) => {
        return <List key={index} data={list} {...dataProps}></List>;
    });
}
