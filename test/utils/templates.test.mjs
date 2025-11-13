import assert from 'node:assert';
import { describe, it } from 'node:test';

import * as templates from '../../src/utils/templates.mjs';

describe('templates utility', () => {
  describe('parseVariables', () => {
    it('should replace a single variable placeholder', () => {
      const template = 'Hello $NAME$!';
      const variables = { NAME: 'World' };
      const result = templates.parseVariables(template, variables);

      assert.strictEqual(result, 'Hello World!');
    });

    it('should replace multiple variable placeholders', () => {
      const template = 'Hello $FIRST_NAME$ $LAST_NAME$!';
      const variables = { FIRST_NAME: 'John', LAST_NAME: 'Doe' };
      const result = templates.parseVariables(template, variables);

      assert.strictEqual(result, 'Hello John Doe!');
    });

    it('should replace the same variable multiple times', () => {
      const template = '$NAME$ says hello to $NAME$';
      const variables = { NAME: 'Alice' };
      const result = templates.parseVariables(template, variables);

      assert.strictEqual(result, 'Alice says hello to Alice');
    });

    it('should handle variables with underscores in the name', () => {
      const template = 'Value: $MEETING_DATE$';
      const variables = { MEETING_DATE: '2025-01-15' };
      const result = templates.parseVariables(template, variables);

      assert.strictEqual(result, 'Value: 2025-01-15');
    });

    it('should replace remaining unmatched placeholders with empty strings', () => {
      const template = 'Hello $NAME$! Welcome $UNKNOWN_VAR$!';
      const variables = { NAME: 'Alice' };
      const result = templates.parseVariables(template, variables);

      assert.strictEqual(result, 'Hello Alice! Welcome !');
    });

    it('should handle empty template', () => {
      const template = '';
      const variables = { NAME: 'World' };
      const result = templates.parseVariables(template, variables);

      assert.strictEqual(result, '');
    });

    it('should handle template with no variables', () => {
      const template = 'Hello World!';
      const variables = { NAME: 'Alice' };
      const result = templates.parseVariables(template, variables);

      assert.strictEqual(result, 'Hello World!');
    });

    it('should handle empty variables object', () => {
      const template = 'Hello $NAME$!';
      const variables = {};
      const result = templates.parseVariables(template, variables);

      assert.strictEqual(result, 'Hello !');
    });

    it('should handle special characters in variable values', () => {
      const template = 'Command: $CMD$';
      const variables = { CMD: 'grep "test" file.txt' };
      const result = templates.parseVariables(template, variables);

      assert.strictEqual(result, 'Command: grep "test" file.txt');
    });

    it('should handle newlines in variable values', () => {
      const template = 'Content:\n$CONTENT$\nEnd';
      const variables = { CONTENT: 'Line 1\nLine 2' };
      const result = templates.parseVariables(template, variables);

      assert.strictEqual(result, 'Content:\nLine 1\nLine 2\nEnd');
    });

    it('should handle multiple placeholders on the same line', () => {
      const template = '$USER$ at $TIME$ on $DATE$';
      const variables = { USER: 'John', TIME: '10:30 AM', DATE: '2025-01-15' };
      const result = templates.parseVariables(template, variables);

      assert.strictEqual(result, 'John at 10:30 AM on 2025-01-15');
    });

    it('should not match partial placeholders', () => {
      const template = '$NAM is not $NAME$';
      const variables = { NAM: 'test', NAME: 'Alice' };
      const result = templates.parseVariables(template, variables);

      assert.strictEqual(result, '$NAM is not Alice');
    });

    it('should handle variables with numeric and alphabetic characters', () => {
      const template = '$VAR1$ and $VAR_2$';
      const variables = { VAR1: 'value1', VAR_2: 'value2' };
      const result = templates.parseVariables(template, variables);

      assert.strictEqual(result, 'value1 and value2');
    });

    it('should handle empty string as variable value', () => {
      const template = 'Start$EMPTY$End';
      const variables = { EMPTY: '' };
      const result = templates.parseVariables(template, variables);

      assert.strictEqual(result, 'StartEnd');
    });

    it('should handle null-like string values', () => {
      const template = 'Value: $VAL$';
      const variables = { VAL: 'null' };
      const result = templates.parseVariables(template, variables);

      assert.strictEqual(result, 'Value: null');
    });

    it('should handle complex template with markdown', () => {
      const template = `# Meeting: $TITLE$

Date: $DATE$
Time: $TIME$

## Agenda
$AGENDA$`;

      const variables = {
        TITLE: 'Node.js TSC',
        DATE: '2025-01-15',
        TIME: '10:30 UTC',
        AGENDA: '* Item 1\n* Item 2',
      };

      const result = templates.parseVariables(template, variables);

      assert(result.includes('# Meeting: Node.js TSC'));
      assert(result.includes('Date: 2025-01-15'));
      assert(result.includes('Time: 10:30 UTC'));
      assert(result.includes('* Item 1\n* Item 2'));
    });

    it('should handle very long variable values', () => {
      const longContent = 'x'.repeat(10000);
      const template = 'Content: $CONTENT$';
      const variables = { CONTENT: longContent };
      const result = templates.parseVariables(template, variables);

      assert(result.includes(longContent));
    });

    it('should be case-sensitive for variable names', () => {
      const template = '$name$ and $NAME$';
      const variables = { name: 'lowercase', NAME: 'UPPERCASE' };
      const result = templates.parseVariables(template, variables);

      assert.strictEqual(result, 'lowercase and UPPERCASE');
    });

    it('should handle variables with similar names', () => {
      const template = '$VAR$ $VAR_NAME$ $VAR_NAME_LONG$';
      const variables = {
        VAR: 'a',
        VAR_NAME: 'b',
        VAR_NAME_LONG: 'c',
      };
      const result = templates.parseVariables(template, variables);

      assert.strictEqual(result, 'a b c');
    });

    it('should process regex special characters in placeholder correctly', () => {
      const template = 'Value: $SPECIAL_CHARS$';
      const variables = { SPECIAL_CHARS: '.*+?^${}()|[\\]' };
      const result = templates.parseVariables(template, variables);

      assert.strictEqual(result, 'Value: .*+?^${}()|[\\]');
    });

    it('should replace all instances of a variable', () => {
      const template = '$X$ $X$ $X$';
      const variables = { X: 'Y' };
      const result = templates.parseVariables(template, variables);

      assert.strictEqual(result, 'Y Y Y');
    });

    it('should handle undefined variables as empty string', () => {
      const template = 'Value: $UNDEFINED$';
      const variables = {};
      const result = templates.parseVariables(template, variables);

      assert.strictEqual(result, 'Value: ');
    });

    it('should handle template with only a variable', () => {
      const template = '$CONTENT$';
      const variables = { CONTENT: 'Full content' };
      const result = templates.parseVariables(template, variables);

      assert.strictEqual(result, 'Full content');
    });

    it('should replace variables at line boundaries', () => {
      const template = `Line1: $VAR1$
Line2: $VAR2$
Line3: $VAR3$`;

      const variables = { VAR1: 'A', VAR2: 'B', VAR3: 'C' };
      const result = templates.parseVariables(template, variables);

      const lines = result.split('\n');
      assert.strictEqual(lines[0], 'Line1: A');
      assert.strictEqual(lines[1], 'Line2: B');
      assert.strictEqual(lines[2], 'Line3: C');
    });
  });
});
