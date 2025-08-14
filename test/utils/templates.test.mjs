import assert from 'node:assert';
import { describe, it } from 'node:test';

import {
  parseVariables,
  parseMeetingProperties,
} from '../../src/utils/templates.mjs';

describe('Utils - Templates', () => {
  describe('parseVariables', () => {
    it('should replace single variable in template', () => {
      const template = 'Hello $NAME$, welcome!';
      const variables = { NAME: 'John' };

      const result = parseVariables(template, variables);

      assert.strictEqual(result, 'Hello John, welcome!');
    });

    it('should replace multiple variables in template', () => {
      const template = 'Meeting: $TITLE$ on $DATE$ at $TIME$';
      const variables = {
        TITLE: 'TSC Meeting',
        DATE: '2023-10-15',
        TIME: '14:30',
      };

      const result = parseVariables(template, variables);

      assert.strictEqual(result, 'Meeting: TSC Meeting on 2023-10-15 at 14:30');
    });

    it('should replace same variable multiple times', () => {
      const template = "$NAME$ loves $NAME$'s work";
      const variables = { NAME: 'Alice' };

      const result = parseVariables(template, variables);

      assert.strictEqual(result, "Alice loves Alice's work");
    });

    it('should handle empty string values', () => {
      const template = 'Value: $EMPTY$';
      const variables = { EMPTY: '' };

      const result = parseVariables(template, variables);

      assert.strictEqual(result, 'Value: ');
    });

    it('should handle null/undefined values', () => {
      const template = 'Value: $NULL$ and $UNDEFINED$';
      const variables = { NULL: null, UNDEFINED: undefined };

      const result = parseVariables(template, variables);

      assert.strictEqual(result, 'Value:  and ');
    });

    it('should remove unmatched placeholders', () => {
      const template = 'Hello $NAME$, your $UNMATCHED$ is ready';
      const variables = { NAME: 'Bob' };

      const result = parseVariables(template, variables);

      assert.strictEqual(result, 'Hello Bob, your  is ready');
    });

    it('should handle template with no placeholders', () => {
      const template = 'No placeholders here';
      const variables = { NAME: 'Alice' };

      const result = parseVariables(template, variables);

      assert.strictEqual(result, 'No placeholders here');
    });

    it('should handle empty template', () => {
      const template = '';
      const variables = { NAME: 'Alice' };

      const result = parseVariables(template, variables);

      assert.strictEqual(result, '');
    });

    it('should handle special characters in values', () => {
      const template = 'Pattern: $PATTERN$';
      const variables = { PATTERN: '$.*+?^{}()|[]\\' };

      const result = parseVariables(template, variables);

      assert.strictEqual(result, 'Pattern: $.*+?^{}()|[]\\');
    });

    it('should handle variables with underscores and numbers', () => {
      const template = '$VAR_1$ and $VAR_2_TEST$';
      const variables = { VAR_1: 'first', VAR_2_TEST: 'second' };

      const result = parseVariables(template, variables);

      assert.strictEqual(result, 'first and second');
    });

    it('should handle multiline templates', () => {
      const template = `Line 1: $VAR1$
Line 2: $VAR2$
Line 3: $VAR1$ again`;
      const variables = { VAR1: 'Hello', VAR2: 'World' };

      const result = parseVariables(template, variables);

      assert.strictEqual(
        result,
        `Line 1: Hello
Line 2: World
Line 3: Hello again`
      );
    });
  });

  describe('parseMeetingProperties', () => {
    it('should parse simple property', () => {
      const content = 'NAME="John Doe"';

      const result = parseMeetingProperties(content);

      assert.deepStrictEqual(result, { NAME: 'John Doe' });
    });

    it('should parse multiple properties', () => {
      const content = `NAME="John Doe"
EMAIL="john@example.com"
ROLE="Developer"`;

      const result = parseMeetingProperties(content);

      assert.deepStrictEqual(result, {
        NAME: 'John Doe',
        EMAIL: 'john@example.com',
        ROLE: 'Developer',
      });
    });

    it('should parse multiline property values', () => {
      const content = `DESCRIPTION="This is a
multiline description
with several lines"`;

      const result = parseMeetingProperties(content);

      assert.deepStrictEqual(result, {
        DESCRIPTION: 'This is a\nmultiline description\nwith several lines',
      });
    });

    it('should parse properties with underscores and numbers', () => {
      const content = `VAR_1="value1"
VAR_2_TEST="value2"
VAR3="value3"`;

      const result = parseMeetingProperties(content);

      assert.deepStrictEqual(result, {
        VAR_1: 'value1',
        VAR_2_TEST: 'value2',
        VAR3: 'value3',
      });
    });

    it('should handle empty property values', () => {
      const content = 'EMPTY=""';

      const result = parseMeetingProperties(content);

      assert.deepStrictEqual(result, { EMPTY: '' });
    });

    it('should handle properties with special characters in values', () => {
      const content = 'SPECIAL="Value with $pecial ch@rs & symbols!"';

      const result = parseMeetingProperties(content);

      assert.deepStrictEqual(result, {
        SPECIAL: 'Value with $pecial ch@rs & symbols!',
      });
    });

    it('should handle properties with quotes in values', () => {
      const content = `QUOTED="He said \\"Hello\\" to me"`;

      const result = parseMeetingProperties(content);

      assert.deepStrictEqual(result, {
        QUOTED: 'He said \\"Hello\\" to me',
      });
    });

    it('should handle content with no properties', () => {
      const content = 'Just some text without properties';

      const result = parseMeetingProperties(content);

      assert.deepStrictEqual(result, {});
    });

    it('should handle empty content', () => {
      const content = '';

      const result = parseMeetingProperties(content);

      assert.deepStrictEqual(result, {});
    });

    it('should handle mixed content with properties and other text', () => {
      const content = `Some random text
NAME="John Doe"
More text here
EMAIL="john@example.com"
Final text`;

      const result = parseMeetingProperties(content);

      assert.deepStrictEqual(result, {
        NAME: 'John Doe',
        EMAIL: 'john@example.com',
      });
    });

    it('should handle properties with markdown-like content', () => {
      const content = `DESCRIPTION="# Meeting Notes

## Agenda
- Item 1
- Item 2

**Important**: Don't forget!"`;

      const result = parseMeetingProperties(content);

      assert.deepStrictEqual(result, {
        DESCRIPTION: `# Meeting Notes

## Agenda
- Item 1
- Item 2

**Important**: Don't forget!`,
      });
    });

    it('should handle properties with URLs and special formatting', () => {
      const content = `LINK="https://example.com/path?param=value&other=123"
INSTRUCTIONS="Join at: https://zoom.us/j/123456789
Passcode: 123456"`;

      const result = parseMeetingProperties(content);

      assert.deepStrictEqual(result, {
        LINK: 'https://example.com/path?param=value&other=123',
        INSTRUCTIONS: `Join at: https://zoom.us/j/123456789
Passcode: 123456`,
      });
    });
  });
});
