export GIT_EDITOR=true

BRANCHES=(
  "e199dff:feat/kyc-phone-otp-infrastructure"
  "2c84176:feat/kyc-shared-signup"
  "c08e0ba:feat/kyc-researcher-profile"
  "1ae8383:feat/kyc-researcher-tier"
  "c2bf6d8:feat/kyc-respondent-layer1"
  "5a0fac3:feat/kyc-progressive-profiling-layer2"
  "f53cc2e:feat/kyc-sensitive-layers-encryption"
  "14c10e9:feat/kyc-ndpr-consent-erasure"
  "b06fb81:feat/kyc-cross-cutting-validation"
)

git checkout feat/kyc-v2-schema-updates
git reset --hard origin/backend

for BR in "${BRANCHES[@]}"; do
  COMMIT=$(echo $BR | cut -d: -f1)
  BRANCH_NAME=$(echo $BR | cut -d: -f2)
  echo ">>> Cherry picking $COMMIT onto current branch for $BRANCH_NAME"
  git cherry-pick $COMMIT || (node resolve.js && git checkout HEAD package-lock.json yarn.lock && git add . && git cherry-pick --continue)
  git push origin HEAD:$BRANCH_NAME --force
done
