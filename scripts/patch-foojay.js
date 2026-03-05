#!/usr/bin/env node
/**
 * Post-install patch: Disable the foojay-resolver-convention plugin
 * in @react-native/gradle-plugin to work around the IBM_SEMERU
 * incompatibility with Gradle 9.0.0.
 *
 * The foojay plugin version bundled by React Native 0.84 (v0.5.0)
 * references JvmVendorSpec.IBM_SEMERU which was removed in Gradle 9.
 * Commenting it out forces Gradle to rely on local JDK auto-detection
 * (configured via org.gradle.java.installations.paths in gradle.properties).
 */
const fs = require('fs');
const path = require('path');

const target = path.resolve(
  __dirname,
  '..',
  'node_modules',
  '@react-native',
  'gradle-plugin',
  'settings.gradle.kts',
);

if (!fs.existsSync(target)) {
  console.log('[patch-foojay] settings.gradle.kts not found – skipping.');
  process.exit(0);
}

let content = fs.readFileSync(target, 'utf8');

if (content.includes('// plugins { id("org.gradle.toolchains.foojay-resolver-convention")')) {
  console.log('[patch-foojay] Already patched – skipping.');
  process.exit(0);
}

content = content.replace(
  /^(plugins\s*\{\s*id\("org\.gradle\.toolchains\.foojay-resolver-convention"\).*\})$/m,
  '// $1',
);

fs.writeFileSync(target, content, 'utf8');
console.log('[patch-foojay] Patched foojay-resolver-convention plugin successfully.');
