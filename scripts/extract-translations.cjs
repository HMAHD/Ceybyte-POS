#!/usr/bin/env node

/**
 * ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
 * │                                        CEYBYTE POS                                               │
 * │                                                                                                  │
 * │                              Translation Key Extraction Script                                   │
 * │                                                                                                  │
 * │  Description: Automatically extracts translation keys from source code and updates              │
 * │               translation files with missing keys and default values.                           │
 * │                                                                                                  │
 * │  Author: Akash Hasendra                                                                          │
 * │  Copyright: 2025 Ceybyte.com - Sri Lankan Point of Sale System                                   │
 * │  License: MIT License with Sri Lankan Business Terms                                             │
 * └──────────────────────────────────────────────────────────────────────────────────────────────────┘
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SRC_DIR = path.join(__dirname, '../src');
const LOCALES_DIR = path.join(__dirname, '../src/locales');
const LANGUAGES = ['en', 'si', 'ta'];

// Regex patterns to find translation keys
const T_FUNCTION_PATTERNS = [
    /t\(['"`]([^'"`]+)['"`](?:,\s*['"`]([^'"`]*)['"`])?\)/g,
    /t\(\s*['"`]([^'"`]+)['"`](?:,\s*['"`]([^'"`]*)['"`])?\s*\)/g,
    /useTranslation\(\)\.t\(['"`]([^'"`]+)['"`](?:,\s*['"`]([^'"`]*)['"`])?\)/g,
];

// Function to recursively read all TypeScript/JavaScript files
function getAllFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
    const files = [];

    function traverse(currentDir) {
        const items = fs.readdirSync(currentDir);

        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                // Skip node_modules and other build directories
                if (!['node_modules', 'dist', 'build', '.git'].includes(item)) {
                    traverse(fullPath);
                }
            } else if (extensions.some(ext => item.endsWith(ext))) {
                files.push(fullPath);
            }
        }
    }

    traverse(dir);
    return files;
}

// Function to extract translation keys from file content
function extractKeysFromContent(content) {
    const keys = new Set();

    for (const pattern of T_FUNCTION_PATTERNS) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
            const key = match[1];
            const defaultValue = match[2] || '';

            if (key && key.trim()) {
                keys.add(JSON.stringify({
                    key: key.trim(),
                    defaultValue: defaultValue.trim()
                }));
            }
        }
    }

    return Array.from(keys).map(k => JSON.parse(k));
}

// Function to set nested object property
function setNestedProperty(obj, path, value) {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in current) || typeof current[key] !== 'object') {
            current[key] = {};
        }
        current = current[key];
    }

    const lastKey = keys[keys.length - 1];
    if (!(lastKey in current)) {
        current[lastKey] = value;
    }
}

// Function to get nested object property
function getNestedProperty(obj, path) {
    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
        if (current && typeof current === 'object' && key in current) {
            current = current[key];
        } else {
            return undefined;
        }
    }

    return current;
}

// Function to load existing translation file
function loadTranslationFile(language) {
    const filePath = path.join(LOCALES_DIR, `${language}.json`);

    try {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(content);
        }
    } catch (error) {
        console.warn(`Warning: Could not load ${language}.json:`, error.message);
    }

    return {};
}

// Function to save translation file
function saveTranslationFile(language, translations) {
    const filePath = path.join(LOCALES_DIR, `${language}.json`);
    const content = JSON.stringify(translations, null, 2);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated ${language}.json`);
}

// Main extraction function
function extractAndUpdateTranslations() {
    console.log('🔍 Extracting translation keys from source code...\n');

    // Get all source files
    const files = getAllFiles(SRC_DIR);
    console.log(`📁 Found ${files.length} source files`);

    // Extract all translation keys
    const allKeys = new Map(); // key -> { defaultValue, files }

    for (const file of files) {
        try {
            const content = fs.readFileSync(file, 'utf8');
            const keys = extractKeysFromContent(content);

            for (const { key, defaultValue } of keys) {
                if (!allKeys.has(key)) {
                    allKeys.set(key, {
                        defaultValue: defaultValue || key.split('.').pop() || key,
                        files: []
                    });
                }
                allKeys.get(key).files.push(path.relative(SRC_DIR, file));
            }
        } catch (error) {
            console.warn(`Warning: Could not read ${file}:`, error.message);
        }
    }

    console.log(`🔑 Found ${allKeys.size} unique translation keys\n`);

    // Update translation files for each language
    for (const language of LANGUAGES) {
        console.log(`🌐 Processing ${language}.json...`);

        const existingTranslations = loadTranslationFile(language);
        let addedCount = 0;

        for (const [key, { defaultValue }] of allKeys) {
            const existingValue = getNestedProperty(existingTranslations, key);

            if (existingValue === undefined) {
                let translationValue = defaultValue;

                // For non-English languages, use the English default or the key itself
                if (language !== 'en' && !defaultValue) {
                    translationValue = key.split('.').pop() || key;
                }

                setNestedProperty(existingTranslations, key, translationValue);
                addedCount++;
            }
        }

        if (addedCount > 0) {
            saveTranslationFile(language, existingTranslations);
            console.log(`   ➕ Added ${addedCount} new keys`);
        } else {
            console.log(`   ✨ No new keys needed`);
        }
    }

    console.log('\n🎉 Translation extraction completed!');

    // Show summary of most used keys
    console.log('\n📊 Most frequently used translation keys:');
    const sortedKeys = Array.from(allKeys.entries())
        .sort((a, b) => b[1].files.length - a[1].files.length)
        .slice(0, 10);

    for (const [key, { files }] of sortedKeys) {
        console.log(`   ${key} (used in ${files.length} files)`);
    }
}

// Run the extraction
if (require.main === module) {
    try {
        extractAndUpdateTranslations();
    } catch (error) {
        console.error('❌ Error during translation extraction:', error);
        process.exit(1);
    }
}

module.exports = { extractAndUpdateTranslations };