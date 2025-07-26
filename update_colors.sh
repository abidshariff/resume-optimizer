#!/bin/bash

# Script to update all color references in the React app to the new corporate theme

APP_FILE="/Volumes/workplace/resume-optimizer/frontend/src/App.js"

echo "Updating color scheme to corporate theme..."

# Replace orange gradients with corporate blue to innovation accent gradients
sed -i '' 's/linear-gradient(45deg, #ff6b35 30%, #ff9800 90%)/linear-gradient(45deg, #0D47A1 30%, #00BCD4 90%)/g' "$APP_FILE"

# Replace orange hover gradients
sed -i '' 's/linear-gradient(45deg, #e64a19 30%, #f57c00 90%)/linear-gradient(45deg, #002171 30%, #008BA3 90%)/g' "$APP_FILE"

# Replace single orange color references with innovation accent
sed -i '' 's/#ff6b35/#00BCD4/g' "$APP_FILE"

# Replace amber orange with modern slate
sed -i '' 's/#ff9800/#37474F/g' "$APP_FILE"

# Replace specific orange hover states
sed -i '' 's/#e64a19/#002171/g' "$APP_FILE"
sed -i '' 's/#f57c00/#102027/g' "$APP_FILE"

# Replace background gradients
sed -i '' 's/linear-gradient(135deg, #ff6b35 0%, #ff9800 100%)/linear-gradient(135deg, #0D47A1 0%, #00BCD4 100%)/g' "$APP_FILE"

# Replace radial gradients
sed -i '' 's/radial-gradient(circle at 25% 25%, #ff6b35 0%, transparent 50%), radial-gradient(circle at 75% 75%, #ff9800 0%, transparent 50%)/radial-gradient(circle at 25% 25%, #0D47A1 0%, transparent 50%), radial-gradient(circle at 75% 75%, #00BCD4 0%, transparent 50%)/g' "$APP_FILE"

echo "Color scheme updated successfully!"
