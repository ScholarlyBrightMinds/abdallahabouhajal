#!/bin/zsh
# scholar_runner.sh · read Google Scholar on this Mac and push the new numbers.
#
# Google Scholar has no API and blocks datacentre traffic, so the weekly GitHub
# Action cannot read it. launchd runs this on Abdallah's Mac on Mondays and
# Thursdays (tools/install_scholar_job.sh sets that up). It works on a clone of
# the site kept in ~/Library/Application Support/ScholarlyBrightMinds, because
# macOS does not let background jobs read anything in the Desktop folder; that
# is why the old job, which pointed into Desktop, failed every week from
# 2026-09-28 with "can't open input file".
#
#   zsh tools/scholar_runner.sh               run by hand on this checkout
#   zsh scholar_runner.sh --runner CLONE      what launchd runs, on its own clone
#
# Reading Scholar: a plain request first, which is what has always worked; if
# Scholar answers with a captcha, a real headless Chrome through agent-browser.
# scholar_fetch.py refuses anything it cannot trust (a captcha, another
# person's profile, a count that fell), and then last week's numbers stay up.
# Every run is logged in ~/Library/Logs/ScholarlyBrightMinds/scholar.log, and
# an update or a problem shows as a Mac notification.

set -u
export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"
PROFILE="https://scholar.google.com/citations?user=1I8SvsQAAAAJ&hl=en&cstart=0&pagesize=100"
LOGDIR="$HOME/Library/Logs/ScholarlyBrightMinds"
mkdir -p "$LOGDIR"
LOG="$LOGDIR/scholar.log"
PAGE="$LOGDIR/scholar-page.html"
TOUCHED=(data publications.html index.html theme.config.js)   # what the update writes

say()    { print -r -- "$(date '+%Y-%m-%d %H:%M') $*" >> "$LOG" }
notify() { /usr/bin/osascript -e "display notification \"$2\" with title \"$1\"" >/dev/null 2>&1 || true }

RUNNER=0
if [[ "${1:-}" == "--runner" ]]; then
    RUNNER=1
    REPO="${2:?usage: scholar_runner.sh --runner CLONE}"
else
    REPO="${0:A:h:h}"
fi
cd "$REPO" || { say "cannot open $REPO"; notify "Scholar update failed" "The site folder could not be opened."; exit 1 }
say "start, $REPO"

if (( RUNNER )); then
    # the job's own clone: nobody works in it, so it always starts from GitHub
    if ! git fetch --quiet origin main || ! git reset --quiet --hard origin/main; then
        say "could not update the clone from GitHub"
        notify "Scholar update failed" "GitHub could not be reached. The next run will try again."
        exit 1
    fi
else
    # a working copy by hand: never touch work in progress
    if [[ -n "$(git status --porcelain -- $TOUCHED)" ]]; then
        say "skipped, uncommitted changes in the files this touches"; exit 0
    fi
    if [[ "$(git rev-parse --abbrev-ref HEAD)" != "main" ]]; then
        say "skipped, not on main"; exit 0
    fi
    git pull --ff-only --quiet origin main || { say "pull failed"; exit 1 }
fi

# 1. read Scholar: a plain request, then a real headless Chrome
read_with_browser() {
    local s="scholar-$$" raw="$LOGDIR/scholar-browser.json"
    agent-browser --session "$s" open "$PROFILE" >/dev/null 2>&1 || return 1
    agent-browser --session "$s" wait --load networkidle >/dev/null 2>&1
    agent-browser --session "$s" wait 1500 >/dev/null 2>&1
    agent-browser --session "$s" eval "document.documentElement.outerHTML" 2>/dev/null | tail -1 > "$raw"
    agent-browser --session "$s" close >/dev/null 2>&1
    /usr/bin/python3 -c "import json,sys; sys.stdout.write(json.loads(open(sys.argv[1]).read()))" "$raw" > "$PAGE" 2>/dev/null || return 1
    /usr/bin/python3 scholar_fetch.py --from "$PAGE" >> "$LOG" 2>&1
}

rm -f "$PAGE"
if [[ -n "${SBM_FORCE_BROWSER:-}" ]]; then
    say "testing the browser path only"
    read_with_browser || {
        say "headless Chrome was refused too"
        notify "Scholar update needs you" "Google Scholar refused both ways. Ask Claude Code: update my Scholar numbers."
        exit 0
    }
elif ! /usr/bin/python3 scholar_fetch.py --save "$PAGE" >> "$LOG" 2>&1; then
    say "plain request refused, trying headless Chrome"
    if ! read_with_browser; then
        say "headless Chrome was refused too, nothing changed"
        notify "Scholar update needs you" "Google Scholar asked for a captcha. Ask Claude Code: update my Scholar numbers."
        exit 0
    fi
fi

if [[ -z "$(git status --porcelain -- $TOUCHED)" ]]; then
    say "no change this time"
    exit 0
fi

# 2. commit and push; the GitHub Action may have pushed in between, so the
#    job's own clone resets to GitHub and rebuilds from the page it kept
push_once() {
    local cites
    cites=$(/usr/bin/python3 -c "import json;print(json.load(open('data/serpapi/metrics.json'))['total_citations'])")
    git add -- $TOUCHED
    git commit --quiet -m "Weekly numbers from Google Scholar: ${cites} citations

Read from scholar.google.com on Abdallah's Mac by tools/scholar_runner.sh,
because Scholar blocks the GitHub runner. scholar_fetch.py refuses to write a
count that fell or a page that turned out to be a captcha.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" || return 1
    git push --quiet origin HEAD:main || return 1
    say "pushed, ${cites} citations"
    notify "Scholar numbers updated" "${cites} citations, on the site within a few minutes."
}

if push_once; then exit 0; fi
if (( ! RUNNER )); then
    say "push failed, the commit is local"
    notify "Scholar update failed" "The push to GitHub failed. The commit is on this Mac."
    exit 1
fi
for attempt in 2 3; do
    say "push refused, rebuilding on the newest GitHub version (attempt $attempt)"
    sleep 20
    git fetch --quiet origin main && git reset --quiet --hard origin/main || continue
    if [[ -s "$PAGE" ]]; then
        /usr/bin/python3 scholar_fetch.py --from "$PAGE" >> "$LOG" 2>&1 || continue
    else
        /usr/bin/python3 scholar_fetch.py >> "$LOG" 2>&1 || continue
    fi
    if [[ -z "$(git status --porcelain -- $TOUCHED)" ]]; then say "already up to date on GitHub"; exit 0; fi
    if push_once; then exit 0; fi
done
say "push failed three times"
notify "Scholar update failed" "GitHub refused the new numbers three times. The next run will try again."
exit 1
