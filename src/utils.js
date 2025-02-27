function splitByBrTag(arr, delimiter = '<br>') {
    let result = [];

    arr.forEach((item) => {
        if (item.includes(delimiter)) {
            result.push(...item.split(delimiter)); // Split and insert parts separately
        } else {
            result.push(item); // Keep unchanged items
        }
    });

    return result;
}

/**
 * Parses a block's content and extracts the main and body content.
 *
 * @param {Object} block - The block to parse.
 * @returns {Object} - An object containing the parsed content.
 * @returns {string} pretitle - The pretitle of the block.
 * @returns {string} title - The title of the block.
 * @returns {string} subtitle - The subtitle of the block.
 * @returns {string} description - The description of the block.
 * @returns {string[]} paragraphs - An array of paragraphs in the body.
 * @returns {string[]} images - An array of image URLs in the body.
 * @returns {string[]} links - An array of link URLs in the body.
 * @returns {string[]} lists - An array of lists in the body.
 * @returns {string[]} tables - An array of tables in the body.
 * @returns {Object[]} items - An array of items in the body.
 * @returns {Object} properties - Additional properties of the block.
 */
export const parseBlockContent = (block) => {
    const { pretitle = '', title = '', subtitle = '', description = '' } = block.main?.header || {};
    const body = block.main?.body || {};

    const items = block.getBlockItems();

    items.forEach((item) => {
        if (item.banner) {
            item.images.push(item.banner);
            delete item.banner;
        }
    });

    let paragraphs = [];
    let images = [];
    let links = [];
    let lists = [];
    let tables = [];
    let properties = {};

    paragraphs = body.paragraphs || [];
    images = body.imgs || [];
    links = body.links || [];
    lists = body.lists || [];

    if (block.main?.banner) images.push(block.main.banner);

    // remove empty entries in paragraphs
    paragraphs = paragraphs.filter((p) => p);
    // remove empty entries in item's paragraphs
    items.forEach((item) => {
        item.paragraphs = item.paragraphs.filter((p) => p);
    });
    // remove empty entries in list's paragraphs
    lists.forEach((list) => {
        list.forEach((item) => {
            item.paragraphs = item.paragraphs.filter((p) => p);
        });
    });
    // remove empty entries in item's list's paragraphs
    items.forEach((item) => {
        if (item.lists?.length) {
            item.lists.forEach((list) => {
                list.forEach((item) => {
                    item.paragraphs = item.paragraphs.filter((p) => p);
                });
            });
        }
    });

    // split text in paragraphs by <br> tag, this is the rich text content which may contain line breaks, we need to display them as separate paragraphs
    paragraphs = splitByBrTag(paragraphs);
    // split text in items's paragraphs by <br> tag
    items.forEach((item) => {
        item.paragraphs = splitByBrTag(item.paragraphs);
    });

    return { pretitle, title, subtitle, description, paragraphs, images, links, lists, tables, items, properties };
};

/**
 * Removes HTML tags from a given string and decodes HTML entities.
 *
 * @param {string} htmlString - The input string containing HTML tags.
 * @returns {string} The plain text string with HTML tags removed and entities decoded.
 */
function stripTags(htmlString) {
    if (!htmlString || typeof htmlString !== 'string') return '';

    // Remove HTML tags using regular expression
    const plainString = htmlString.replace(/<[^>]*>/g, '');

    // Decode HTML entities
    const decodedString = new DOMParser().parseFromString(plainString, 'text/html').body.textContent;

    return decodedString;
}

/**
 * Parses a styled string and converts it into an array of text parts with associated styles.
 *
 * @param {string} inputString - The styled string to parse.
 * @returns {Object[]} - An array of objects representing the styled text parts.
 */
export function parseStyledString(inputString) {
    /**
     * Creates a text part object with content and styles.
     *
     * @param {string} content - The text content.
     * @param {Object} styles - The styles associated with the text.
     * @returns {Object} - The text part object.
     */
    const createTextPart = (content, styles) => {
        return {
            type: 'text',
            content: content,
            ...styles
        };
    };

    /**
     * Processes segments of the string, applying styles based on tags.
     *
     * @param {string} string - The string segment to process.
     * @param {Object} [styles={}] - The current styles to apply.
     * @returns {Object[]} - An array of text part objects with styles applied.
     */
    const processSegments = (string, styles = {}) => {
        const regexp = /<(\w+)>(.*?)<\/\1>/gs;
        let result = [];
        let lastIndex = 0;

        if (!string) return [createTextPart('', styles)];

        string.replace(regexp, (match, tag, innerText, offset) => {
            // Capture text before the tag, if any
            const plainText = string.slice(lastIndex, offset);
            if (plainText) {
                result.push(createTextPart(plainText, styles));
            }

            // Update the styles based on the current tag
            const newStyles = { ...styles };
            if (tag === 'strong' || tag === 'b') newStyles.bold = true;
            if (tag === 'em' || tag === 'i') newStyles.italics = true;
            if (tag === 'u') newStyles.underline = {};

            // Recursively process nested tags
            result = result.concat(processSegments(innerText, newStyles));

            // Update lastIndex to the end of the current match
            lastIndex = offset + match.length;
        });

        // Handle any text after the last matched tag
        const remainingText = string.slice(lastIndex);
        if (remainingText) {
            result.push(createTextPart(remainingText, styles));
        }

        return result;
    };

    if (typeof inputString !== 'string') {
        console.log('warning: inputString is not a string', inputString);
        inputString = inputString.toString();
    }

    // special case for string wrapped in <u-org>, we strip all the tags
    if (/<u-org>[\s\S]*?<\/u-org>/g.test(inputString)) {
        inputString = stripTags(inputString);
    }

    return processSegments(inputString);
}

/**
 * Merges paragraphs in a list into a single paragraph.
 *
 * @param {Array} list - The list of items, each containing paragraphs to merge.
 * @returns {string} - A single string with all paragraphs merged and wrapped in span tags.
 */
export function mergeListParagraphs(list) {
    let paragraph = '';

    if (list) {
        list.forEach((item) => {
            paragraph += `<span>${item.paragraphs.join('')}</span>`;
        });
    }

    return paragraph;
}

/**
 * Convert HTML string to object and let the UNIWEB engine generate doc file with the docx library.
 *
 * @param {string} htmlString - The HTML string to convert.
 * @returns {Object[]} - An array of objects representing the structured content of the HTML.
 */
export function htmlToDocx(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    /**
     * Parses the attributes of an element to convert specific properties.
     *
     * @param {NamedNodeMap} attributes - The attributes of the element.
     * @returns {Object} - An object containing the parsed properties.
     */
    function parseProperties(attributes) {
        const properties = {};

        for (const attr of attributes) {
            if (attr.name.startsWith('data-') && attr.name !== 'data-type') {
                switch (attr.name) {
                    case 'data-underline':
                        properties.underline = {};
                        break;
                    case 'data-positionaltab-alignment':
                        properties.positionalTab = properties.positionalTab || {};
                        properties.positionalTab.alignment = attr.value;
                        break;
                    case 'data-positionaltab-leader':
                        properties.positionalTab = properties.positionalTab || {};
                        properties.positionalTab.leader = attr.value;
                        break;
                    case 'data-positionaltab-relativeto':
                        properties.positionalTab = properties.positionalTab || {};
                        properties.positionalTab.relativeTo = attr.value;
                        break;
                    case 'data-spacing-before':
                        properties.spacing = properties.spacing || {};
                        properties.spacing.before = attr.value;
                        break;
                    case 'data-spacing-after':
                        properties.spacing = properties.spacing || {};
                        properties.spacing.after = attr.value;
                        break;
                    case 'data-transformation-width':
                        properties.transformation = properties.transformation || {};
                        properties.transformation.width = attr.value;
                        break;
                    case 'data-transformation-height':
                        properties.transformation = properties.transformation || {};
                        properties.transformation.height = attr.value;
                        break;
                    case 'data-bullet-level':
                        properties.bullet = properties.bullet || {};
                        properties.bullet.level = attr.value;
                        break;
                    case 'data-numbering-reference':
                        properties.numbering = properties.numbering || {};
                        properties.numbering.reference = attr.value;
                        break;
                    case 'data-numbering-level':
                        properties.numbering = properties.numbering || {};
                        properties.numbering.level = attr.value;
                        break;
                    case 'data-numbering-instance':
                        properties.numbering = properties.numbering || {};
                        properties.numbering.instance = attr.value;
                        break;
                    case 'data-alttext-title':
                        properties.altText = properties.altText || {};
                        properties.altText.title = attr.value;
                        break;
                    case 'data-alttext-description':
                        properties.altText = properties.altText || {};
                        properties.altText.description = attr.value;
                        break;
                    case 'data-alttext-name':
                        properties.altText = properties.altText || {};
                        properties.altText.name = attr.value;
                        break;
                    case 'data-width-size':
                        properties.width = properties.width || {};
                        properties.width.size = attr.value;
                        break;
                    case 'data-width-type':
                        properties.width = properties.width || {};
                        properties.width.type = attr.value;
                        break;
                    case 'data-margins-top':
                        properties.margins = properties.margins || {};
                        properties.margins.top = attr.value;
                        break;
                    case 'data-margins-bottom':
                        properties.margins = properties.margins || {};
                        properties.margins.bottom = attr.value;
                        break;
                    case 'data-margins-left':
                        properties.margins = properties.margins || {};
                        properties.margins.left = attr.value;
                        break;
                    case 'data-margins-right':
                        properties.margins = properties.margins || {};
                        properties.margins.right = attr.value;
                        break;
                    case 'data-borders-top-style':
                        properties.borders = properties.borders || {};
                        properties.borders.top = properties.borders.top || {};
                        properties.borders.top.style = attr.value;
                        break;
                    case 'data-borders-top-size':
                        properties.borders = properties.borders || {};
                        properties.borders.top = properties.borders.top || {};
                        properties.borders.top.size = attr.value;
                        break;
                    case 'data-borders-top-color':
                        properties.borders = properties.borders || {};
                        properties.borders.top = properties.borders.top || {};
                        properties.borders.top.color = attr.value;
                        break;
                    case 'data-borders-bottom-style':
                        properties.borders = properties.borders || {};
                        properties.borders.bottom = properties.borders.bottom || {};
                        properties.borders.bottom.style = attr.value;
                        break;
                    case 'data-borders-bottom-size':
                        properties.borders = properties.borders || {};
                        properties.borders.bottom = properties.borders.bottom || {};
                        properties.borders.bottom.size = attr.value;
                        break;
                    case 'data-borders-bottom-color':
                        properties.borders = properties.borders || {};
                        properties.borders.bottom = properties.borders.bottom || {};
                        properties.borders.bottom.color = attr.value;
                        break;
                    case 'data-borders-left-style':
                        properties.borders = properties.borders || {};
                        properties.borders.left = properties.borders.left || {};
                        properties.borders.left.style = attr.value;
                        break;
                    case 'data-borders-left-size':
                        properties.borders = properties.borders || {};
                        properties.borders.left = properties.borders.left || {};
                        properties.borders.left.size = attr.value;
                        break;
                    case 'data-borders-left-color':
                        properties.borders = properties.borders || {};
                        properties.borders.left = properties.borders.left || {};
                        properties.borders.left.color = attr.value;
                        break;
                    case 'data-borders-right-style':
                        properties.borders = properties.borders || {};
                        properties.borders.right = properties.borders.right || {};
                        properties.borders.right.style = attr.value;
                        break;
                    case 'data-borders-right-size':
                        properties.borders = properties.borders || {};
                        properties.borders.right = properties.borders.right || {};
                        properties.borders.right.size = attr.value;
                        break;
                    case 'data-borders-right-color':
                        properties.borders = properties.borders || {};
                        properties.borders.right = properties.borders.right || {};
                        properties.borders.right.color = attr.value;
                        break;
                    case 'data-image-type':
                        properties.imageType = attr.value;
                        break;
                    case 'data-floating-horizontalposition-align':
                        properties.floating = properties.floating || {};
                        properties.floating.horizontalPosition = properties.floating.horizontalPosition || {};
                        properties.floating.horizontalPosition.align = attr.value;
                        break;
                    case 'data-floating-verticalposition-align':
                        properties.floating = properties.floating || {};
                        properties.floating.verticalPosition = properties.floating.verticalPosition || {};
                        properties.floating.verticalPosition.align = attr.value;
                        break;
                    case 'data-floating-verticalposition-relative':
                        properties.floating = properties.floating || {};
                        properties.floating.verticalPosition = properties.floating.verticalPosition || {};
                        properties.floating.verticalPosition.relative = attr.value;
                        break;

                    default:
                        properties[attr.name.replace('data-', '')] = attr.value;
                }
            }
        }

        return properties;
    }

    /**
     * Recursively converts a DOM node to an object notation.
     *
     * @param {Node} node - The DOM node to convert.
     * @returns {Object|null|Array} - The converted object or array of objects, or null if the node should be ignored.
     */
    function nodeToObject(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            return node.nodeValue.trim() ? { type: 'text', content: node.nodeValue } : null;
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
            const type = node.getAttribute('data-type') || node.tagName.toLowerCase();

            // If the element is an emptyLine, we ignore it and its children
            if (type === 'emptyLine') {
                return null;
            }

            // If the element is a contentWrapper, we treat its children as direct children of the parent
            if (type === 'contentWrapper') {
                const children = [];
                for (const child of node.childNodes) {
                    const childObject = nodeToObject(child);
                    if (childObject) {
                        children.push(childObject);
                    }
                }
                return children; // return array of children to be spread into parent
            }

            const properties = parseProperties(node.attributes);

            const children = [];
            for (const child of node.childNodes) {
                const childObject = nodeToObject(child);
                if (childObject) {
                    // If the childObject is an array, we spread it into children array
                    if (Array.isArray(childObject)) {
                        children.push(...childObject);
                    } else {
                        children.push(childObject);
                    }
                }
            }

            const obj = { type, ...properties };

            if (type === 'text') {
                obj.content = children.map((child) => child.content).join('');
            } else if (children.length > 0) {
                obj.children = children;
            }

            return obj;
        }

        return null;
    }

    // Get the body element's children and convert them to object notation
    const result = [];
    for (const child of doc.body.childNodes) {
        const childObject = nodeToObject(child);
        if (childObject) {
            if (Array.isArray(childObject)) {
                result.push(...childObject); // spread array of children if it's an array
            } else {
                result.push(childObject);
            }
        }
    }

    return result;
}

/**
 * Formats a given text as a currency string.
 *
 * @param {string} text - The text to convert and format as currency.
 * @param {boolean} [withSymbol=true] - Whether to include the currency symbol in the formatted string.
 * @returns {string} - The formatted currency string.
 */
export function makeCurrency(text, withSymbol = true) {
    try {
        // Convert the text to a number
        const number = parseFloat(text.replace(/,/g, '')); // Remove existing commas to ensure correct parsing

        // Check if the conversion is successful and it's a valid number
        if (!isNaN(number)) {
            // Format the number to US currency style without the currency symbol
            const formatter = new Intl.NumberFormat('en-US', {
                style: 'decimal',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

            return withSymbol ? `$${formatter.format(number)}` : formatter.format(number);
        } else {
            // Return the original text with a dollar sign if conversion fails
            return withSymbol ? `$${text}` : text;
        }
    } catch (e) {
        // Handle any unexpected errors
        console.error('Error formatting currency:', e);
        return withSymbol ? `$${text}` : text;
    }
}

/**
 * Wraps a given text in parentheses.
 *
 * @param {string} text - The text to wrap in parentheses.
 * @returns {string} - The text wrapped in parentheses or an empty string if the input is falsy.
 */
export function makeParentheses(text) {
    return text ? `(${text})` : '';
}

/**
 * Creates a range string from a start and end value.
 *
 * @param {string|number} start - The starting value of the range.
 * @param {string|number} end - The ending value of the range.
 * @returns {string} - The formatted range string, or the start or end value if only one is provided, or an empty string if neither is provided.
 */
export function makeRange(start, end) {
    if (start && end) {
        return `${start} - ${end}`;
    }
    return start || end || '';
}

/**
 * Joins the elements of an array into a string with a given separator.
 *
 * @param {Array} array - The array of elements to join.
 * @param {string} [separator=' '] - The separator to use between elements.
 * @returns {string} - The joined string.
 */
export function join(array, separator = ' ') {
    return array.join(separator);
}
