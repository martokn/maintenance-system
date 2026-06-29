#!/bin/bash

# PHP Code Quality Check
# This script checks for common errors and issues

echo "=========================================="
echo "PHP Backend Code Quality Check"
echo "=========================================="
echo ""

PHP_DIR="php-backend"
ERRORS=0
WARNINGS=0

# Check PHP syntax
echo "Checking PHP syntax..."
for file in $(find $PHP_DIR -name "*.php" -type f); do
    if ! php -l "$file" 2>&1 | grep -q "No syntax errors"; then
        echo "❌ Syntax error in $file"
        php -l "$file"
        ((ERRORS++))
    fi
done

if [ $ERRORS -eq 0 ]; then
    echo "✓ All PHP files have valid syntax"
fi

echo ""
echo "Checking for common issues..."

# Check for uninitialized variables
echo ""
echo "Checking for potential undefined variables..."
grep -r '\$[a-zA-Z_][a-zA-Z0-9_]*' $PHP_DIR --include="*.php" | grep -v 'isset\|empty\|defined' | wc -l

# Check for missing error handling
echo ""
echo "Checking for missing error handling..."
grep -r 'new mysqli\|mysqli_query\|file_put_contents' $PHP_DIR --include="*.php" | grep -v 'try\|catch\|if\|!' | head -5

# Check file permissions
echo ""
echo "File permissions:"
ls -la "$PHP_DIR"/*.sh 2>/dev/null || echo "No shell scripts found"

echo ""
echo "=========================================="
if [ $ERRORS -eq 0 ]; then
    echo "✓ Code check passed!"
else
    echo "❌ Found $ERRORS errors"
fi
echo "=========================================="
