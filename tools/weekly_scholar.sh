#!/bin/zsh
# weekly_scholar.sh · read Google Scholar and push the new numbers.
#
# Google Scholar has no API and blocks datacentre traffic, so the weekly
# GitHub Action cannot do this. This runs on Abdallah's own Mac instead, once
# a week, through the launchd job in tools/com.scholarlybrightminds.scholar.plist.
#
# It is safe to run by hand at any time:  zsh tools/weekly_scholar.sh
#
# If Scholar refuses, or the numbers look wrong, scholar_fetch.py writes
# nothing and this exits without touching the repository.

set -u
REPO="${0:A:h:h}"
cd "$REPO" || exit 1
LOG="$REPO/tools/scholar.log"
say() { print -r -- "$(date '+%Y-%m-%d %H:%M') $*" >> "$LOG" }

say "start"

# never fight with work in progress
if [[ -n "$(git status --porcelain -- data theme.config.js publications.html index.html)" ]]; then
  say "skipped, the working tree has uncommitted changes in the files this touches"
  exit 0
fi

branch=$(git rev-parse --abbrev-ref HEAD)
if [[ "$branch" != "main" ]]; then
  say "skipped, on branch $branch rather than main"
  exit 0
fi

git pull --ff-only --quiet origin main || { say "pull failed"; exit 1 }

if ! /usr/bin/python3 scholar_fetch.py >> "$LOG" 2>&1; then
  say "scholar_fetch refused, nothing changed"
  exit 0
fi

if [[ -z "$(git status --porcelain)" ]]; then
  say "no change this week"
  exit 0
fi

cites=$(/usr/bin/python3 -c "import json;print(json.load(open('data/serpapi/metrics.json'))['total_citations'])")
git add -A
git commit --quiet -m "Weekly numbers from Google Scholar: ${cites} citations

Read from scholar.google.com on this machine, because Scholar blocks the
GitHub runner. scholar_fetch.py refuses to write a count that fell or a page
that turned out to be a captcha.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
if git push --quiet origin main; then
  say "pushed, ${cites} citations"
else
  say "push failed, the commit is local"
fi
