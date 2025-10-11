const fs = require('fs');
const path = require('path');

// Files that have AppHeader prop errors
const filesToFix = [
  'src/app/offers/page.tsx',
  'src/app/page.tsx', 
  'src/app/profile/page.tsx',
  'src/app/verify/page.tsx'
];

const invalidProps = [
  'onViewProfile',
  'onEditProfile', 
  'onShowVerification',
  'onViewStorefront',
  'onShowAboutUs',
  'onShowContactUs',
  'onShowFAQ'
];

function fixAppHeaderProps(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Find AppHeader components and remove invalid props
  const appHeaderRegex = /<AppHeader\s+([^>]*?)>/g;
  
  content = content.replace(appHeaderRegex, (match, props) => {
    // Parse props to remove invalid ones
    const validProps = [];
    const propRegex = /(\w+)=\{[^}]*\}/g;
    let propMatch;
    
    while ((propMatch = propRegex.exec(props)) !== null) {
      const propName = propMatch[1];
      if (!invalidProps.includes(propName)) {
        validProps.push(propMatch[0]);
      } else {
        modified = true;
        console.log(`Removing invalid prop ${propName} from ${filePath}`);
      }
    }
    
    // Also handle props without braces (like currentUser={user})
    const simplePropRegex = /(\w+)=\{([^}]+)\}/g;
    let simpleMatch;
    
    while ((simpleMatch = simplePropRegex.exec(props)) !== null) {
      const propName = simpleMatch[1];
      const propValue = simpleMatch[2];
      if (!invalidProps.includes(propName)) {
        validProps.push(`${propName}={${propValue}}`);
      } else {
        modified = true;
        console.log(`Removing invalid prop ${propName} from ${filePath}`);
      }
    }
    
    const validPropsString = validProps.join(' ');
    return `<AppHeader ${validPropsString}>`;
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed AppHeader props in ${filePath}`);
  } else {
    console.log(`No AppHeader issues found in ${filePath}`);
  }
}

// Fix all files
filesToFix.forEach(fixAppHeaderProps);

console.log('🎉 AppHeader props fix complete!');
