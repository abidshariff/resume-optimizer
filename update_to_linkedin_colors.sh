#!/bin/bash

# Script to update all color references to LinkedIn-style colors

APP_FILE="/Volumes/workplace/resume-optimizer/frontend/src/App.js"

echo "Updating color scheme to LinkedIn style..."

# Replace corporate blue gradients with LinkedIn blue gradients
sed -i '' 's/linear-gradient(45deg, #0D47A1 30%, #00BCD4 90%)/linear-gradient(45deg, #0A66C2 30%, #378FE9 90%)/g' "$APP_FILE"

# Replace hover gradients
sed -i '' 's/linear-gradient(45deg, #002171 30%, #008BA3 90%)/linear-gradient(45deg, #004182 30%, #0A66C2 90%)/g' "$APP_FILE"

# Replace innovation accent with LinkedIn blue
sed -i '' 's/#00BCD4/#0A66C2/g' "$APP_FILE"

# Replace modern slate with LinkedIn gray
sed -i '' 's/#37474F/#666666/g' "$APP_FILE"

# Replace specific dark colors
sed -i '' 's/#002171/#004182/g' "$APP_FILE"
sed -i '' 's/#102027/#404040/g' "$APP_FILE"

# Replace background gradients
sed -i '' 's/linear-gradient(135deg, #0D47A1 0%, #00BCD4 100%)/linear-gradient(135deg, #0A66C2 0%, #378FE9 100%)/g' "$APP_FILE"
sed -i '' 's/linear-gradient(135deg, #0D47A1 0%, #002171 100%)/linear-gradient(135deg, #FFFFFF 0%, #F3F2EF 100%)/g' "$APP_FILE"

# Replace radial gradients
sed -i '' 's/radial-gradient(circle at 25% 25%, #00BCD4 0%, transparent 50%), radial-gradient(circle at 75% 75%, #37474F 0%, transparent 50%)/radial-gradient(circle at 25% 25%, #0A66C2 0%, transparent 50%), radial-gradient(circle at 75% 75%, #378FE9 0%, transparent 50%)/g' "$APP_FILE"

# Replace rgba colors with LinkedIn equivalents
sed -i '' 's/rgba(13, 71, 161, 0.3)/rgba(10, 102, 194, 0.3)/g' "$APP_FILE"
sed -i '' 's/rgba(0, 188, 212, 0.2)/rgba(10, 102, 194, 0.2)/g' "$APP_FILE"
sed -i '' 's/rgba(0, 188, 212, 0.1)/rgba(10, 102, 194, 0.1)/g' "$APP_FILE"
sed -i '' 's/rgba(0, 188, 212, 0.4)/rgba(10, 102, 194, 0.4)/g' "$APP_FILE"
sed -i '' 's/rgba(0, 188, 212, 0.5)/rgba(10, 102, 194, 0.5)/g' "$APP_FILE"

# Replace card backgrounds
sed -i '' 's/linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%)/linear-gradient(135deg, #FFFFFF 0%, #F3F2EF 100%)/g' "$APP_FILE"
sed -i '' 's/linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)/linear-gradient(135deg, #FFFFFF 0%, #F3F2EF 100%)/g' "$APP_FILE"

echo "LinkedIn color scheme updated successfully!"
