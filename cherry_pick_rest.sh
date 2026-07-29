export GIT_EDITOR=true
BRANCHES=(
  "f53cc2e:feat/kyc-sensitive-layers-encryption"
  "14c10e9:feat/kyc-ndpr-consent-erasure"
  "b06fb81:feat/kyc-cross-cutting-validation"
)

for BR in "${BRANCHES[@]}"; do
  COMMIT=$(echo $BR | cut -d: -f1)
  BRANCH_NAME=$(echo $BR | cut -d: -f2)
  echo ">>> Cherry picking $COMMIT onto current branch for $BRANCH_NAME"
  git cherry-pick $COMMIT || (
    for file in $(git diff --name-only --diff-filter=U); do
      sed -i '/^<<<<<<</d' $file
      sed -i '/^=======/d' $file
      sed -i '/^>>>>>>>/d' $file
    done
    git checkout HEAD package-lock.json yarn.lock || true
    git add .
    git cherry-pick --continue
  )
  git push origin HEAD:$BRANCH_NAME --force
done
