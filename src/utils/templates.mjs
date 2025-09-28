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
