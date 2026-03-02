#!/bin/bash
# StateBase Node.js SDK Release Script

set -e

# 1. Verification
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ]; then
  echo "❌ Error: Releases must be made from the 'main' branch."
  exit 1
fi

if [[ -n $(git status -s) ]]; then
  echo "❌ Error: Working directory is dirty. Please commit or stash changes."
  exit 1
fi

# 2. Versioning
echo "Select version bump type:"
echo "1) patch (x.x.Z)"
echo "2) minor (x.Y.0)"
echo "3) major (X.0.0)"
read TYPE_NUM

case $TYPE_NUM in
  1) TYPE="patch" ;;
  2) TYPE="minor" ;;
  3) TYPE="major" ;;
  *) echo "Invalid selection"; exit 1 ;;
esac

# 3. NPM Version (bumps version, commits, and tags)
echo "📦 Bumping version ($TYPE)..."
npm version $TYPE -m "chore: bump version to %s"

# 4. Build & Publish
echo "🚀 Next steps:"
echo "1. git push origin main --tags"
echo "2. npm publish --access public"
echo ""
echo "Do you want to push to Git now? (y/n)"
read PUSH_GIT
if [ "$PUSH_GIT" == "y" ]; then
  git push origin main --tags
fi

echo "Do you want to publish to npm now? (y/n)"
read PUSH_NPM
if [ "$PUSH_NPM" == "y" ]; then
  # Note: prepublishOnly script in package.json will run 'npm run build'
  npm publish --access public
fi

echo "✅ Done!"
