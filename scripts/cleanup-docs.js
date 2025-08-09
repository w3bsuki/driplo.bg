#!/usr/bin/env node

/**
 * Documentation Cleanup Script
 * Consolidates scattered documentation files into organized structure
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdir, stat, rename, mkdir, writeFile, readFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// File categories for organization
const categories = {
  auditReports: {
    dir: 'docs/archive/2025-08/audit-reports',
    files: [
      'COMPREHENSIVE_AUDIT_REPORT_2025.md',
      'COMPREHENSIVE_TECHNICAL_DEBT_ANALYSIS.md',
      'SECURITY_AUDIT_REPORT.md',
      'PRODUCTION_READINESS_REPORT.md'
    ]
  },
  refactorReports: {
    dir: 'docs/archive/2025-08/refactor-reports',
    files: [
      'REFACTOR_MASTER.md',
      'REFACTOR_MASTER_PLAN.md',
      'REFACTOR_EXECUTION_REPORT.md',
      'EXECUTION_STATUS_REPORT.md',
      'REFACTOR_FINAL_REPORT.md'
    ]
  },
  databaseReports: {
    dir: 'docs/archive/2025-08/database-reports',
    files: [
      'DATABASE_OPTIMIZATION_REPORT.md',
      'DATABASE_PERFORMANCE_OPTIMIZATION_REPORT.md'
    ]
  },
  componentReports: {
    dir: 'docs/archive/2025-08/component-reports',
    files: [
      'COMPONENT_ARCHITECTURE_REFACTORING_STRATEGY.md',
      'LISTINGS_SYSTEM_PRODUCTION_ANALYSIS.md',
      'CODEBASE_CLEANUP_REPORT.md'
    ]
  },
  obsoleteGuides: {
    dir: 'docs/archive/2025-08/obsolete',
    files: [
      'MIGRATION_GUIDE.md',
      'PRODUCTION_DEPLOYMENT_CHECKLIST.md',
      'EGRESS_OPTIMIZATION_GUIDE.md',
      'LIKE_FEATURE_UPDATE.md',
      'gpt_production_ready.md',
      'claude_work.md'
    ]
  },
  currentDocs: {
    dir: 'docs/current',
    files: [
      // Keep in root - these are actively used
      'PHASED_REFACTOR_EXECUTION_PLAN.md', // Main execution plan
      'FRESH_DB_SETUP.md', // Database setup
      'SUPABASE_EMAIL_SETUP.md', // Email configuration
      'README.md', // Project readme
      'CLAUDE.md' // Claude instructions
    ]
  }
};

async function ensureDir(dirPath) {
  try {
    await mkdir(join(rootDir, dirPath), { recursive: true });
    console.log(`✓ Created directory: ${dirPath}`);
  } catch (error) {
    if (error.code !== 'EEXIST') {
      console.error(`✗ Failed to create directory ${dirPath}:`, error.message);
    }
  }
}

async function moveFile(fileName, targetDir) {
  const sourcePath = join(rootDir, fileName);
  const targetPath = join(rootDir, targetDir, fileName);
  
  try {
    await stat(sourcePath);
    await rename(sourcePath, targetPath);
    console.log(`✓ Moved: ${fileName} → ${targetDir}/`);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`ℹ File not found (already moved?): ${fileName}`);
    } else {
      console.error(`✗ Failed to move ${fileName}:`, error.message);
    }
    return false;
  }
}

async function createArchiveIndex() {
  const indexContent = `# Documentation Archive

This directory contains archived documentation from the repository cleanup performed on ${new Date().toISOString().split('T')[0]}.

## Archive Structure

- **audit-reports/**: Historical audit reports and analysis documents
- **refactor-reports/**: Refactor execution reports and planning documents  
- **database-reports/**: Database optimization and performance reports
- **component-reports/**: Component architecture and system analysis reports
- **obsolete/**: Outdated guides and documentation that's no longer relevant

## Current Documentation

For current, actively maintained documentation, see:
- \`/README.md\` - Project overview and setup
- \`/PHASED_REFACTOR_EXECUTION_PLAN.md\` - Main refactor execution plan
- \`/FRESH_DB_SETUP.md\` - Database setup instructions
- \`/SUPABASE_EMAIL_SETUP.md\` - Email configuration guide
- \`/CLAUDE.md\` - Claude Code assistant instructions

## Rationale

These files were archived to:
1. **Reduce repository clutter** - 20+ documentation files in root was confusing
2. **Improve maintainability** - Single source of truth for current docs
3. **Preserve history** - Important historical context is retained but organized
4. **Better onboarding** - New developers can find relevant docs quickly

Archive created by automated cleanup script on ${new Date().toISOString()}.
`;

  await writeFile(join(rootDir, 'docs/archive/README.md'), indexContent);
  console.log('✓ Created archive index');
}

async function updateMainReadme() {
  try {
    const readmePath = join(rootDir, 'README.md');
    let content = await readFile(readmePath, 'utf-8');
    
    // Add documentation section if it doesn't exist
    if (!content.includes('## 📚 Documentation')) {
      const docSection = `

## 📚 Documentation

### Current Documentation
- **[Setup Guide](FRESH_DB_SETUP.md)** - Complete database setup instructions
- **[Email Configuration](SUPABASE_EMAIL_SETUP.md)** - Email service setup guide
- **[Refactor Plan](PHASED_REFACTOR_EXECUTION_PLAN.md)** - Production readiness execution plan
- **[Claude Instructions](CLAUDE.md)** - Development assistant configuration

### Archived Documentation
Historical reports and analysis documents are archived in \`docs/archive/\` to keep the repository clean and focused.

`;
      
      // Insert before any existing sections or at the end
      const insertPoint = content.indexOf('\n## ') !== -1 ? content.indexOf('\n## ') : content.length;
      content = content.slice(0, insertPoint) + docSection + content.slice(insertPoint);
      
      await writeFile(readmePath, content);
      console.log('✓ Updated README.md with documentation section');
    }
  } catch (error) {
    console.error('✗ Failed to update README:', error.message);
  }
}

async function cleanup() {
  console.log('🧹 Starting documentation cleanup...\n');
  
  // Create archive directories
  for (const category of Object.values(categories)) {
    await ensureDir(category.dir);
  }
  
  // Move files to appropriate directories
  let totalMoved = 0;
  for (const [categoryName, category] of Object.entries(categories)) {
    if (categoryName === 'currentDocs') continue; // Skip files that stay in root
    
    console.log(`\n📁 Processing ${categoryName}...`);
    for (const fileName of category.files) {
      const moved = await moveFile(fileName, category.dir);
      if (moved) totalMoved++;
    }
  }
  
  // Create documentation index
  await createArchiveIndex();
  
  // Update main README
  await updateMainReadme();
  
  console.log(`\n✅ Cleanup complete! Moved ${totalMoved} files to archive.`);
  console.log('\n📋 Repository structure is now clean and organized.');
  console.log('📚 All historical documents are preserved in docs/archive/');
}

cleanup().catch(console.error);