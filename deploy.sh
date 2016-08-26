#!/bin/bash
set -e # Exit with nonzero exit code if anything fails

SOURCE_BRANCH="master"
TARGET_BRANCH="gh-pages"

rm -rf dist

function doCompile {
    gulp build
}

# Pull requests and commits to other branches shouldn't try to deploy.
if [ "$TRAVIS_PULL_REQUEST" != "false" -o "$TRAVIS_BRANCH" != "$SOURCE_BRANCH" ]; then
    echo "Skipping deploy"
    exit 0
fi

# Save some useful information
REPO=`git config remote.origin.url`
SSH_REPO=${REPO/https:\/\/github.com\//git@github.com:}
SHA=`git rev-parse --verify HEAD`

# Clone the existing data branch for this repo into dist/
# Create a new empty branch if data doesn't exist yet (should only happen on first deply)
git clone $REPO dist
cd dist
if [[ `git branch -a | grep "remotes/origin/$TARGET_BRANCH"` ]]; then
  git checkout -t origin/$TARGET_BRANCH
  echo "Existing $TARGET_BRANCH branch"
else
  git checkout --orphan $TARGET_BRANCH
  git reset --hard
  echo "New $TARGET_BRANCH branch"
fi

# Clean out existing contents
cd ..
rm -rf dist/* || exit 0

# Run our compile script
doCompile

# Now let's go have some fun with the cloned repo
cd dist
git config user.name "Travis CI"
git config user.email "$COMMIT_AUTHOR_EMAIL"

# If there are no changes to the compiled out (e.g. this is a README update) then just bail.
git add -N -A
if [[ -z `git diff --exit-code` ]]; then
    echo "No changes to the output on this push; exiting."
    exit 0
fi

# Commit the "changes", i.e. the new version.
# The delta will show diffs between new and old versions.
git add -A
git commit -m "Deploy data: ${SHA}"

# Get the deploy key by using Travis's stored variables to decrypt deploy_key.enc
cd ..
ENCRYPTED_KEY_VAR="encrypted_${ENCRYPTION_LABEL}_key"
ENCRYPTED_IV_VAR="encrypted_${ENCRYPTION_LABEL}_iv"
ENCRYPTED_KEY=${!ENCRYPTED_KEY_VAR}
ENCRYPTED_IV=${!ENCRYPTED_IV_VAR}
openssl aes-256-cbc -K $ENCRYPTED_KEY -iv $ENCRYPTED_IV -in deploy_key.enc -out deploy_key -d
chmod 600 deploy_key
eval `ssh-agent -s`
ssh-add deploy_key

# Now that we're all set up, we can push.
cd dist
git push $SSH_REPO $TARGET_BRANCH
