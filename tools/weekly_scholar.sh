#!/bin/zsh
# weekly_scholar.sh · kept so the old command still works; the job now lives in
# tools/scholar_runner.sh (what it does) and tools/install_scholar_job.sh (the
# twice-weekly launchd job, outside the Desktop folder macOS protects).
exec /bin/zsh "${0:A:h}/scholar_runner.sh" "$@"
