import React from 'react';
import { Tooltip } from 'react-tooltip';
import { MdInfoOutline } from 'react-icons/md';

const getDataSourceInfo = (input) => {
    if (!input) return null;

    const { format, profile } = input;

    if (!format || !profile || !format.report) return null;

    const { select: path, filter } = format.report;

    const info = profile.getSectionInfo(path);

    if (!info) return null;

    const { label, fields } = info;

    return {
        section: label,
        condition: filter ? parseFilter(filter, fields) : null
    };
};

const parseFilter = (filter, fields) => {
    const [symbol, fieldName, ...value] = filter.split(' ');

    const field = Object.values(fields).find((f) => f.name === fieldName);

    if (!field) {
        return null;
    }

    switch (symbol) {
        case '=':
            return { field: field.label, value: value.join(' ').replaceAll('|', ' - '), rule: 'equals to' };
        default: {
            console.warn(`Unknown filter symbol: ${symbol}`);
            return null;
        }
    }
};

const generateTooltipContent = (source) => {
    const { section, condition } = source;

    return (
        <div>
            <div className='font-bold text-sm'>Data comes from</div>
            <div>{section}</div>
            {condition && (
                <div className='mt-2'>
                    <div className='font-bold text-sm'>Condition</div>
                    <div>
                        {condition.field} {condition.rule} {condition.value}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function SourceTooltip({ sourceInfo, input, id }) {
    // const sourceInfo = getDataSourceInfo(input);

    if (!sourceInfo) return null;

    return (
        <>
            <div id={`tooltip-anchor-${id}`}>
                <MdInfoOutline className='w-6 h-6 text-gray-500 hover:text-gray-700' />
            </div>
            <Tooltip anchorSelect={`#tooltip-anchor-${id}`} place='left' offset={20} delayHide={100} opacity={1.0} clickable={true} className='max-w-96'>
                {generateTooltipContent(sourceInfo)}
            </Tooltip>
        </>
    );
}
