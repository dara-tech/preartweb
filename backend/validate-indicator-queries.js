/**
 * Validation script for Mortality & Retention Indicator queries
 * Checks that each query only returns relevant fields for its indicator type
 */

const fs = require('fs');
const path = require('path');

// Define expected fields for each indicator
const expectedFields = {
  '1_percentage_died': [
    'Indicator', 'Deaths', 'TOTAL', 'Total_ART', 'Percentage',
    'Male_0_14', 'Male_0_14_Deaths', 'Female_0_14', 'Female_0_14_Deaths',
    'Male_over_14', 'Male_over_14_Deaths', 'Female_over_14', 'Female_over_14_Deaths',
    'Male_0_14_Total', 'Female_0_14_Total', 'Male_over_14_Total', 'Female_over_14_Total',
    'Children_Total', 'Adults_Total'
  ],
  '2_percentage_lost_to_followup': [
    'Indicator', 'Lost_to_Followup', 'TOTAL', 'Total_ART', 'Percentage',
    'Male_0_14', 'Male_0_14_Lost', 'Female_0_14', 'Female_0_14_Lost',
    'Male_over_14', 'Male_over_14_Lost', 'Female_over_14', 'Female_over_14_Lost',
    'Male_0_14_Total', 'Female_0_14_Total', 'Male_over_14_Total', 'Female_over_14_Total',
    'Children_Total', 'Adults_Total'
  ],
  '3_reengaged_within_28_days': [
    'Indicator', 'Reengaged_Within_28', 'TOTAL', 'Total_Lost', 'Percentage',
    'Male_0_14', 'Male_0_14_Reengaged', 'Female_0_14', 'Female_0_14_Reengaged',
    'Male_over_14', 'Male_over_14_Reengaged', 'Female_over_14', 'Female_over_14_Reengaged',
    'Children_Total', 'Adults_Total'
  ],
  '4_reengaged_over_28_days': [
    'Indicator', 'Reengaged_Over_28', 'TOTAL', 'Total_Lost', 'Percentage',
    'Male_0_14', 'Male_0_14_Reengaged', 'Female_0_14', 'Female_0_14_Reengaged',
    'Male_over_14', 'Male_over_14_Reengaged', 'Female_over_14', 'Female_over_14_Reengaged',
    'Male_0_14_Eligible', 'Female_0_14_Eligible', 'Male_over_14_Eligible', 'Female_over_14_Eligible',
    'Children_Total', 'Adults_Total'
  ]
};

// Fields that should NEVER appear in certain indicators
const forbiddenFields = {
  '1_percentage_died': ['Lost_to_Followup', 'Reengaged_Within_28', 'Reengaged_Over_28', 'Late_Visits', 'Early_Visits'],
  '2_percentage_lost_to_followup': ['Deaths', 'Reengaged_Within_28', 'Reengaged_Over_28', 'Late_Visits', 'Early_Visits'],
  '3_reengaged_within_28_days': ['Deaths', 'Lost_to_Followup', 'Reengaged_Over_28', 'Total_ART', 'Late_Visits', 'Early_Visits'],
  '4_reengaged_over_28_days': ['Deaths', 'Lost_to_Followup', 'Reengaged_Within_28', 'Total_ART', 'Late_Visits', 'Early_Visits', 'Male_0_14_Deaths', 'Female_0_14_Deaths', 'Male_over_14_Deaths', 'Female_over_14_Deaths']
};

function extractSelectFields(sqlContent) {
  // Remove comments
  let cleanContent = sqlContent.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Find the final SELECT statement (the one that's not in a WITH clause)
  // Look for SELECT that comes after all WITH clauses
  const withMatches = cleanContent.match(/WITH\s+[\s\S]*?SELECT/gi);
  
  // Find the last SELECT statement
  const selectMatches = [...cleanContent.matchAll(/SELECT\s+([\s\S]*?)\s+FROM\s+[^W]/gi)];
  
  if (selectMatches.length === 0) {
    // Try simpler pattern
    const simpleMatch = cleanContent.match(/SELECT\s+([\s\S]*?)\s+FROM\s+\w+[^,;]*$/i);
    if (!simpleMatch) {
      return [];
    }
    var selectClause = simpleMatch[1];
  } else {
    // Get the last SELECT (final one)
    var selectClause = selectMatches[selectMatches.length - 1][1];
  }
  const fields = [];
  
  // Split by comma, but be careful with nested functions
  let currentField = '';
  let parenDepth = 0;
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < selectClause.length; i++) {
    const char = selectClause[i];
    const nextChar = selectClause[i + 1];

    if ((char === '"' || char === "'") && selectClause[i - 1] !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
      currentField += char;
    } else if (!inString) {
      if (char === '(') {
        parenDepth++;
        currentField += char;
      } else if (char === ')') {
        parenDepth--;
        currentField += char;
      } else if (char === ',' && parenDepth === 0) {
        // Extract field name (before AS or after last space)
        const fieldName = extractFieldName(currentField.trim());
        if (fieldName) {
          fields.push(fieldName);
        }
        currentField = '';
      } else {
        currentField += char;
      }
    } else {
      currentField += char;
    }
  }

  // Handle last field
  if (currentField.trim()) {
    const fieldName = extractFieldName(currentField.trim());
    if (fieldName) {
      fields.push(fieldName);
    }
  }

  return fields;
}

function extractFieldName(fieldExpression) {
  // Remove leading/trailing whitespace
  fieldExpression = fieldExpression.trim();
  
  // If it has AS alias, use the alias
  const asMatch = fieldExpression.match(/\s+AS\s+(\w+)$/i);
  if (asMatch) {
    return asMatch[1];
  }

  // If it's just a column name
  if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(fieldExpression)) {
    return fieldExpression;
  }

  // Try to extract from expressions like "CAST(... AS UNSIGNED) AS FieldName"
  const castMatch = fieldExpression.match(/AS\s+(\w+)$/i);
  if (castMatch) {
    return castMatch[1];
  }

  // Try to extract from function calls like "IFNULL(..., 0) AS FieldName"
  const ifnullMatch = fieldExpression.match(/AS\s+(\w+)$/i);
  if (ifnullMatch) {
    return ifnullMatch[1];
  }

  return null;
}

function validateQuery(indicatorId, sqlContent) {
  const issues = [];
  const fields = extractSelectFields(sqlContent);
  
  // Check for forbidden fields
  if (forbiddenFields[indicatorId]) {
    for (const forbidden of forbiddenFields[indicatorId]) {
      if (fields.includes(forbidden)) {
        issues.push({
          type: 'forbidden_field',
          field: forbidden,
          message: `Field '${forbidden}' should not appear in indicator ${indicatorId}`
        });
      }
    }
  }

  // Check for expected fields (warn if missing, but don't fail)
  if (expectedFields[indicatorId]) {
    const missingFields = expectedFields[indicatorId].filter(f => !fields.includes(f));
    if (missingFields.length > 0) {
      issues.push({
        type: 'missing_field',
        fields: missingFields,
        message: `Expected fields missing: ${missingFields.join(', ')}`
      });
    }
  }

  // Check for unexpected fields (fields not in expected list)
  if (expectedFields[indicatorId]) {
    const unexpectedFields = fields.filter(f => !expectedFields[indicatorId].includes(f));
    if (unexpectedFields.length > 0) {
      issues.push({
        type: 'unexpected_field',
        fields: unexpectedFields,
        message: `Unexpected fields found: ${unexpectedFields.join(', ')}`
      });
    }
  }

  return {
    indicatorId,
    fields,
    issues,
    isValid: issues.filter(i => i.type === 'forbidden_field' || i.type === 'unexpected_field').length === 0
  };
}

function main() {
  const queriesDir = path.join(__dirname, 'src/queries/mortality_retention_indicators');
  const files = fs.readdirSync(queriesDir).filter(f => 
    f.endsWith('.sql') && !f.endsWith('_details.sql')
  );

  console.log('🔍 Validating Mortality & Retention Indicator Queries\n');
  console.log('='.repeat(80));

  const results = [];
  let totalIssues = 0;

  for (const file of files.sort()) {
    const indicatorId = file.replace('.sql', '');
    const filePath = path.join(queriesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    const validation = validateQuery(indicatorId, content);
    results.push(validation);
    
    const criticalIssues = validation.issues.filter(i => 
      i.type === 'forbidden_field' || i.type === 'unexpected_field'
    );
    
    if (criticalIssues.length > 0) {
      totalIssues += criticalIssues.length;
      console.log(`\n❌ ${indicatorId}`);
      console.log(`   Fields found: ${validation.fields.length}`);
      criticalIssues.forEach(issue => {
        console.log(`   ⚠️  ${issue.message}`);
      });
    } else if (validation.issues.length > 0) {
      console.log(`\n⚠️  ${indicatorId} (warnings only)`);
      validation.issues.forEach(issue => {
        console.log(`   ℹ️  ${issue.message}`);
      });
    } else {
      console.log(`\n✅ ${indicatorId} - OK`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`\n📊 Summary:`);
  console.log(`   Total queries checked: ${results.length}`);
  console.log(`   Valid queries: ${results.filter(r => r.isValid).length}`);
  console.log(`   Queries with issues: ${results.filter(r => !r.isValid).length}`);
  console.log(`   Total critical issues: ${totalIssues}`);

  if (totalIssues > 0) {
    console.log('\n❌ Validation failed. Please fix the issues above.');
    process.exit(1);
  } else {
    console.log('\n✅ All queries validated successfully!');
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateQuery, extractSelectFields };

