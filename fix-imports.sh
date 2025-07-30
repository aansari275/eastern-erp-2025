#!/bin/bash

# Comprehensive script to fix all @/ alias imports in client/src directory
cd client/src

echo "🔧 Starting comprehensive import fix..."

# Fix @/lib/utils imports in components/ui
find components/ui -name "*.tsx" -exec sed -i 's|@/lib/utils|../../lib/utils|g' {} \;

# Fix @/components/ui imports in components/ui (internal references)
find components/ui -name "*.tsx" -exec sed -i 's|@/components/ui/|./|g' {} \;

# Fix @/lib imports in hooks directory
find hooks -name "*.ts" -exec sed -i 's|@/lib/|../lib/|g' {} \;

# Fix @/hooks imports in hooks directory (self-references)
find hooks -name "*.ts" -exec sed -i 's|@/hooks/|./|g' {} \;

# Fix @/types imports in hooks directory
find hooks -name "*.ts" -exec sed -i 's|@/types/|../types/|g' {} \;

# Fix @/shared imports (pointing to shared directory at root level)
find . -name "*.ts" -exec sed -i 's|@/shared/|../../../shared/|g' {} \;
find . -name "*.tsx" -exec sed -i 's|@/shared/|../../../shared/|g' {} \;

# Fix @/components imports in main src directory
find . -maxdepth 1 -name "*.tsx" -exec sed -i 's|@/components/|./components/|g' {} \;

# Fix @/lib imports in main src directory
find . -maxdepth 1 -name "*.tsx" -exec sed -i 's|@/lib/|./lib/|g' {} \;

# Fix @/hooks imports in main src directory
find . -maxdepth 1 -name "*.tsx" -exec sed -i 's|@/hooks/|./hooks/|g' {} \;

# Fix @/types imports in main src directory  
find . -maxdepth 1 -name "*.tsx" -exec sed -i 's|@/types/|./types/|g' {} \;

# Fix any remaining nested component imports
find components -name "*.tsx" -exec sed -i 's|@/components/ui/|../ui/|g' {} \;
find components -name "*.tsx" -exec sed -i 's|@/components/|./|g' {} \;
find components -name "*.tsx" -exec sed -i 's|@/lib/|../lib/|g' {} \;
find components -name "*.tsx" -exec sed -i 's|@/hooks/|../hooks/|g' {} \;

echo "✅ Import fix complete!"
echo "📊 Checking remaining @/ references..."
grep -r "@/" . | wc -l