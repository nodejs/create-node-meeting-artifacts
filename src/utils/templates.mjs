/**
 * Process template with variables
 * @param {string} template - The template content
 * @param {Object} variables - Object with template variables
 * @returns {string} Processed template
 */
export const parseVariables = (template, variables) => {
  let processed = template;

  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `$${key}$`;

    processed = processed.replace(
      new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      value || ''
    );
  }

  // Replace any remaining placeholders with empty strings
  processed = processed.replace(/\$[A-Z_]+\$/g, '');

  return processed;
};

/**
 * Simple parser for template properties (KEY="value" format)
 * @param {string} content - Template content
 * @returns {Record<string, string>} Parsed properties
 */
export const parseMeetingProperties = content => {
  const properties = {};

  // Handle multiline properties first with a generic regex
  // Matches: KEY="multiline content" where content can span multiple lines
  const multilineMatches = content.matchAll(
    /^([A-Z_][A-Z0-9_]*)="?([\s\S]*?)"?$/gm
  );

  for (const match of multilineMatches) {
    const [, key, value] = match;

    properties[key] = value;
  }

  return properties;
};
