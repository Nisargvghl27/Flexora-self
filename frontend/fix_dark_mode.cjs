const fs = require('fs');

const files = [
  'src/pages/DesignShowcase.tsx',
  'src/pages/WriteBlog.tsx',
  'src/pages/Signup.tsx',
  'src/components/ui/ShareButton.tsx',
  'src/components/Suggestions.tsx',
  'src/components/AddressManager.tsx',
  'src/components/admin/AdminLayout.tsx',
  'src/components/admin/AdminDashboard.tsx',
  'src/components/admin/AdminUsers.tsx',
  'src/components/admin/AdminOrders.tsx',
  'src/components/admin/AdminProducts.tsx',
  'src/pages/JoinCommunity.tsx',
  'src/pages/Lookbook.tsx',
  'src/pages/Cart.tsx'
];

for (const file of files) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    
    // Core color replacements
    content = content.replace(/bg-gray-50/g, 'bg-muted');
    content = content.replace(/bg-gray-100/g, 'bg-muted');
    content = content.replace(/bg-gray-200/g, 'bg-secondary');
    content = content.replace(/bg-gray-900/g, 'bg-card'); // For admin sidebar
    
    // Text replacements
    content = content.replace(/text-gray-900/g, 'text-foreground');
    content = content.replace(/text-gray-800/g, 'text-foreground');
    content = content.replace(/text-gray-700/g, 'text-muted-foreground');
    content = content.replace(/text-gray-600/g, 'text-muted-foreground');
    content = content.replace(/text-gray-500/g, 'text-muted-foreground');
    content = content.replace(/text-gray-400/g, 'text-muted-foreground');
    content = content.replace(/text-gray-300/g, 'text-muted-foreground');
    
    // Border replacements
    content = content.replace(/border-gray-50/g, 'border-border');
    content = content.replace(/border-gray-100/g, 'border-border');
    content = content.replace(/border-gray-200/g, 'border-border');
    content = content.replace(/border-gray-300/g, 'border-border');

    // Specific structural replacements
    // Signup, Suggestions, etc. often use bg-white
    content = content.replace(/bg-white/g, 'bg-card');
    
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log(`Skipped ${file} - not found`);
    } else {
      console.error(`Error on ${file}:`, err);
    }
  }
}
