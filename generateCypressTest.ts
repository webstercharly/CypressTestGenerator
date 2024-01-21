// generateCypressTest.ts

import * as fs from 'fs';
import * as levenshtein from 'fast-levenshtein';
import * as prettier from 'prettier';

interface CodePattern {
  match: RegExp;
  code: (match: RegExpExecArray) => string;
  template: string;
}

interface PlaceholderDefinition {
  placeholder: RegExp;
  patterns: CodePattern[];
}

interface Scenario {
  name: string;
  given: string;
  when: string | string[];
  then: string | string[];
}

interface ScenarioTreeNode {
  name: string;
  given: string;
  when: TreeNode[];
  then: TreeNode[];
}

const endPlaceholder = {
  placeholder: /<end>/,
  patterns: [
    {
      match: /end/,
      code: () => '', // The code function should return an empty string as we just want to close the block
      template: '<end>',
    },
  ],
};

const placeholders: PlaceholderDefinition[] = [
  endPlaceholder,
  {
    placeholder: /<visit_(.+)>/,
    patterns: [
      {
        match: /url (.+)/,
        code: (match) => `cy.visit('${match[1]}')`,
        template: '<visit_url [url]>',
      },
    ],
  },
  {
    placeholder: /<input_(.+)>/,
    patterns: [
      {
        match: /(.+) value (.+)/,
        code: (match) => `cy.get('input.${match[1]}').type('${match[2]}')`,
        template: '<input_[selector] value [value]>',
      },
    ],
  },
  {
    placeholder: /<click_(.+)>/,
    patterns: [
      {
        match: /(.+)/,
        code: (match) => `cy.get('${match[1]}').click()`,
        template: '<click_[selector]>',
      },
    ],
  },
  {
    placeholder: /<button_(.+)>/,
    patterns: [
      {
        match: /submit (.+)/,
        code: (match) => `cy.get('button[type="submit"].${match[1]}').click()`,
        template: '<button_submit [selector]>',
      },
      {
        match: /cancel (.+)/,
        code: (match) => `cy.get('button[type="button"].${match[1]}').click()`,
        template: '<button_cancel [selector]>',
      },
    ],
  },
  {
    placeholder: /<if_(.+)>/,
    patterns: [
      {
        match: /(.+) exists/,
        code: (match) => `cy.get('${match[1]}').should('exist')`,
        template: '<if_[selector] exists>',
      },
      {
        match: /(.+) does not exist/,
        code: (match) => `cy.get('${match[1]}').should('not.exist')`,
        template: '<if_[selector] does not exist>',
      },
      {
        match: /(.+) is visible/,
        code: (match) => `cy.get('${match[1]}').should('be.visible')`,
        template: '<if_[selector] is visible>',
      },
      {
        match: /(.+) is hidden/,
        code: (match) => `cy.get('${match[1]}').should('not.be.visible')`,
        template: '<if_[selector] is hidden>',
      },
      {
        match: /(.+) is enabled/,
        code: (match) => `cy.get('${match[1]}').should('not.be.disabled')`,
        template: '<if_[selector] is enabled>',
      },
      {
        match: /(.+) is disabled/,
        code: (match) => `cy.get('${match[1]}').should('be.disabled')`,
        template: '<if_[selector] is disabled>',
      },
      {
        match: /(.+) has (.+) as (.+)/,
        code: (match) =>
          `cy.get('${match[1]}').should('have.css', '${match[2]}', '${match[3]}')`,
        template: '<if_[selector] has [css_property] as [css_value]>',
      },
      {
        match: /(.+) has (.+) attribute with value (.+)/,
        code: (match) =>
          `cy.get('${match[1]}').should('have.attr', '${match[2]}', '${match[3]}')`,
        template:
          '<if_[selector] has [attribute] attribute with value [value]>',
      },
      {
        match: /(.+) has class (.+)/,
        code: (match) =>
          `cy.get('${match[1]}').should('have.class', '${match[2]}')`,
        template: '<if_[selector] has class [selector]>',
      },
    ],
  },
  {
    placeholder: /<selector_(.+)>/,
    patterns: [
      {
        match: /button (.+)/,
        code: (match) => `cy.get('button').contains('${match[1]}')`,
        template: '<selector_button [text]>',
      },
      {
        match: /hyperlink (.+)/,
        code: (match) => `cy.get('a').contains('${match[1]}')`,
        template: '<selector_hyperlink [text]>',
      },
      {
        match: /input (.+)/,
        code: (match) => `cy.get('input[name="${match[1]}"]')`,
        template: '<selector_input [name]>',
      },
    ],
  },
  {
    placeholder: /<element_(.+)>/,
    patterns: [
      {
        match: /table (.+)/,
        code: (match) => `cy.get('table.${match[1]}')`,
        template: '<element_table [css_name]>',
      },
      {
        match: /list (.+)/,
        code: (match) => `cy.get('ul.${match[1]}')`,
        template: '<element_list [css_name]>',
      },
      {
        match: /list_item (.+)/,
        code: (match) => `cy.get('li.${match[1]}')`,
        template: '<element_list_item [css_name]>',
      },
    ],
  },
  {
    placeholder: /<action_(.+)>/,
    patterns: [
      {
        match: /type (.+) into (.+)/,
        code: (match) => `cy.get('${match[2]}').type('${match[1]}')`,
        template: '<action_type [css_name] into [text]>',
      },
      {
        match: /select (.+) from (.+)/,
        code: (match) => `cy.get('${match[2]}').select('${match[1]}')`,
        template: '<action_select [css_name] from [text]>',
      },
      {
        match: /check (.+)/,
        code: (match) => `cy.get('${match[1]}').check()`,
        template: '<action_check [css_name]>',
      },
      {
        match: /uncheck (.+)/,
        code: (match) => `cy.get('${match[1]}').uncheck()`,
        template: '<action_uncheck [css_name]>',
      },
    ],
  },
  {
    placeholder: /<assert_(.+)>/,
    patterns: [
      {
        match: /(.+) has text (.+)/,
        code: (match) =>
          `cy.get('${match[1]}').should('contain.text', '${match[2]}')`,
        template: '<assert_[css_name] has text [text]>',
      },
      {
        match: /(.+) is checked/,
        code: (match) => `cy.get('${match[1]}').should('be.checked')`,
        template: '<assert_[css_name] is checked>',
      },
      {
        match: /(.+) is unchecked/,
        code: (match) => `cy.get('${match[1]}').should('not.be.checked')`,
        template: '<assert_[css_name] is unchecked>',
      },
    ],
  },
  {
    placeholder: /<alert_(.+)>/,
    patterns: [
      {
        match: /contains text (.+)/,
        code: (match) =>
          `cy.on('window:alert', (alertText) => { expect(alertText).to.equal('${match[1]}'); });`,
        template: '<alert_contains text [text]>',
      },
    ],
  },
];

function replacePlaceholders(statement) {
  let updatedStatement = statement;
  placeholders.forEach(({ placeholder, patterns }) => {
    let match;
    while ((match = placeholder.exec(updatedStatement))) {
      const matchedPattern = patterns.find((pattern) => pattern.match.test(match[1]));
      if (matchedPattern) {
        const matchedPatternResults = matchedPattern.match.exec(match[1]);
        if(!matchedPatternResults) continue;
        const codeSnippet = matchedPattern.code(matchedPatternResults);
        updatedStatement = updatedStatement.replace(match[0], codeSnippet);
      }
    }
  });
  return updatedStatement;
}

function mapGivenToCypressCode(given: string): string {
  return replacePlaceholders(given);
}

function replacePlaceholdersWrapper(treeNodes: TreeNode[]): string {
  let output = '';

  for (const node of treeNodes) {
    const replacedParent = replacePlaceholders(node.statement);
    if (node.children.length > 0) {
      output += `if(${replacedParent}) {\n`;
      output += replacePlaceholdersWrapper(node.children);
      output += '}\n';
    } else {
      output += `${replacedParent}\n`;
    }
  }
  return output;
}

function mapWhenThenToCypressCode(when: TreeNode[], then: TreeNode[]): string {
  const whenCode = replacePlaceholdersWrapper(when)
  const thenCode =replacePlaceholdersWrapper(then)
  return `
    ${whenCode}
    ${thenCode}
  `;
}

function findClosestPattern(statement: string): string | null {
  const threshold: number = 10;
  let minDistance: number = Infinity;
  let closestPattern: string | null = null;

  placeholders.forEach((placeholderDef) => {
    placeholderDef.patterns.forEach((pattern) => {
      const template = pattern.template;
      const distance = levenshtein.get(statement, template);
      if (distance < minDistance && distance <= threshold) {
        minDistance = distance;
        closestPattern = template;
      }
    });
  });

  return closestPattern;
}

function validatePlaceholders(statement: string): boolean {
  const regex = /<(.+?)>/g;
  let match;

  while ((match = regex.exec(statement)) !== null) {
    const placeholder = match[1];
    const valid = placeholders.some((placeholderDef) => {
      return placeholderDef.placeholder.test(`<${placeholder}>`);
    });

    if (!valid) {
      const closestPattern = findClosestPattern(statement);
      console.log('closestPattern: ' + closestPattern);
      if (closestPattern) {
        throw new Error(
          `Invalid syntax found in statement: "${statement}". Did you mean: "${closestPattern}"?`,
        );
      } else {
        throw new Error(
          `Invalid placeholder found in statement: "${statement}"`,
        );
      }
    }
  }
  return true;
}

function generateCypressTest(scenario: ScenarioTreeNode): string {
  const givenCode = mapGivenToCypressCode(scenario.given);
  const whenThenCode = mapWhenThenToCypressCode(scenario.when, scenario.then);
  return `
  /// <reference types="cypress" />
    describe('${scenario.name}', () => {
      it('${scenario.given}', () => {
        ${givenCode}
        ${whenThenCode}
      });
    });
  `;
}

function writeSpecFile(scenario: ScenarioTreeNode, outputPath: string): void {
  try {
    const cypressTestCode = generateCypressTest(scenario);
    const formattedCode = prettier.format(cypressTestCode, { parser: 'babel' });
    fs.writeFileSync(outputPath, formattedCode);
    console.log(`Spec file successfully written to ${outputPath}`);
  } catch (error) {
    console.log(`Error generating spec file: ${error.message}`);
  }
}

interface TreeNode {
  statement: string;
  children: TreeNode[];
}

function preprocessScenario(scenario: Scenario): ScenarioTreeNode {
  const when = Array.isArray(scenario.when) ? scenario.when : [scenario.when];
  const then = Array.isArray(scenario.then) ? scenario.then : [scenario.then];

  if (!scenario || !scenario.given || !scenario.when || !scenario.then) {
    throw new Error(
      'A scenario must have "given", "when", and "then" properties',
    );
  }

  if (when.length === 0 || then.length === 0) {
    throw new Error('"when" and "then" properties must have at least one item');
  }
  [scenario.given, ...when, ...then].forEach((statement) => {
    if (!validatePlaceholders(statement)) {
      throw new Error(`Invalid placeholder found in statement: "${statement}"`);
    }
  });

  const preprocessedWhen = preprocessStatements(when);
  const preprocessedThen = preprocessStatements(then);
  return {
    ...scenario,
    when: preprocessedWhen,
    then: preprocessedThen,
  };
}

function preprocessStatements(statements: string[]): TreeNode[] {
  let currentNode: TreeNode | null = null;
  const treeNodes: TreeNode[] = [];

  statements.forEach((statement) => {
    if (statement === '<if_end>') {
      currentNode = null;
    }
    else if (statement.startsWith('<if_')) {
      currentNode = { statement, children: [] };
      treeNodes.push(currentNode);
    } else if (currentNode) {
      currentNode.children.push({ statement, children: [] });
    } else {
      treeNodes.push({ statement, children: []});
    }
  });

  return treeNodes;
}

const scenario = {
  name: `visit example website`,
  given: '<visit_url http://example.com>',
  when: [
    '<input_username value testuser>',
    '<if_welcome_message exists>',
    '<click_#submit>',
    '<if_end>'
  ],
  then: [
    "<assert_page_title has text Welcome to Example>",
  ],
};


const scenarioTree = preprocessScenario(scenario);
const outputPath: string = `./cypress/integration/generated.spec.ts`;
writeSpecFile(scenarioTree, outputPath);
