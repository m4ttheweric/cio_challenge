# Intro
The following is an extract of our Design System which should give you some guidance on how to get started with this exercise.

Most of the CSS values you'll need and some starter code have been provided in the styles.css file.

# Typography

Customer.io product typography is a blend of functional and universal, ensuring fonts load quickly and are legible. The brand typography used in marketing is a cross of the logotype and typography, mimicking the serif style of the logo and the shapes used in the logos edges.

## Font Stack

### System Fonts (functional)

We use system fonts for most things, including brand body text and UI. System fonts load quickly, are legible, and are universal. System fonts should be used for:

*   Product
*   Brand body text
*   Functional documents (anything not used for presentation or marketing purposes)
*   Anything that might be in paragraph form

#### Sans-serif (default)

`font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";`

#### Monospace

`font-family: "Monaco", "Menlo", "Consolas", "Liberation Mono", "Courier", "Monospace";`

- - -

## Font size tokens
| Name | Value |
| --- | --- |
| font-size-xxs | 12px |
| font-size-xs | 13px |
| font-size-s | 14px |
| font-size-m | 16px |
| font-size-l | 20px |
| font-size-xl | 24px |
| font-size-xxl | 32px |
| font-size-xxxl | 48px |


## Weights

Here's an additional size scale based on the hierarchy to help guide you designing content where a straightforward heading or html element doesn't apply. Reminder to use these in combination with the available weights: 400 (Regular), 500 (Medium), 700 (Bold).


## Spacing scale

| Name | Value |
| --- | --- |
| space-0 | 0px |
| space-025 | 2px |
| space-050 | 4px |
| space-075 | 6px |
| space-100 | 8px |
| space-125 | 10px |
| space-150 | 12px |
| space-175 | 14px |
| space-200 | 16px |
| space-250 | 20px |
| space-300 | 24px |
| space-400 | 32px |
| space-500 | 40px |
| space-600 | 48px |
| space-800 | 64px |
| space-900 | 72px |
| space-1000 | 80px |
| space-1200 | 96px |
| space-1600 | 128px |
| space-2000 | 160px |
| space-2400 | 192px |
| space-2800 | 224px |
| space-3200 | 256px |

## Colors
Colors and color usage are available on the supporting CSS file.

## Accessibility

To meet accessibility standards, the following are considered in our typography:

*   Plain language and avoiding figures of speech, idioms, and complicated metaphors.
*   Line spacing (leading) of at least space-and-a-half within paragraphs.
*   Header elements follow a standard hierarchy and only one H1 per page.
*   Links are communicated with an underline or chevron, unless text is explicit about clickability ('read more', 'edit')
*   Content is still readable when zoomed 200%

### Use of color

*   A contrast ratio of at least 4.5:1 for visual representations of text (usable for people with 20/40 vision and better)
*   Color is not the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element.

## Best practices

**Consider line length**
*   A paragraph’s line length has a direct impact on readability, making the content more or less digestible. There’s no exact answer, but the goal is to aim for 65-95 characters per line.

*   **Consider the type of content and use alignment accordingly**
By default, longer-form content should be left-aligned to improve readability. While, certain types of data should be aligned differently to improve consumption and comparability. For example, monetary values or numbers with consistent decimal places should be right-aligned. Lastly, alignment of content (text) should be prioritized, with non-text characters getting pushed outside the alignment.