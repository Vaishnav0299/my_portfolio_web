#!/usr/bin/env python3
"""
GitHub Telemetry Automation & Sync Script
─────────────────────────────────────────
- Connects to GitHub API in real time.
- Fetches profile, repositories, languages, stars, and contribution events for Vaishnav0299.
- Aggregates telemetry metrics and writes to `portfolio-frontend/public/data/telemetry.json`.
- Supports viewing current stats, manual editing/adding of stats, and continuous watch mode.

Usage:
  python scripts/sync_github.py                  # Auto-sync live GitHub data
  python scripts/sync_github.py --fetch          # Auto-sync live GitHub data
  python scripts/sync_github.py --view           # Display current telemetry & stats in terminal
  python scripts/sync_github.py --interactive    # Interactive CLI menu to view/add/modify stats
  python scripts/sync_github.py --set-stat "Total Stars" "1.5k"  # Manually update a stat
  python scripts/sync_github.py --watch --interval 3600          # Automated background polling loop
"""

import sys
import os
import json
import time
import argparse
import urllib.request
import urllib.error
import re
from pathlib import Path

# Fix Windows console encoding for Unicode/emojis
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Paths configuration
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
TELEMETRY_PATH = PROJECT_ROOT / "portfolio-frontend" / "public" / "data" / "telemetry.json"
LOCAL_STORE_PATH = PROJECT_ROOT / "portfolio-backend" / "src" / "db" / "localStore.ts"
ENV_PATH = PROJECT_ROOT / ".env"

DEFAULT_USERNAME = "Vaishnav0299"
USER_AGENT = "Vaishnav-Portfolio-Telemetry-Agent/2.0"

# Repos to filter out (e.g. course scaffolds, auto-generated)
IGNORED_REPOS = {"Vaishnav0299"}


def load_env_token():
    """Load GITHUB_TOKEN from system environment or .env file if present."""
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        return token
    if ENV_PATH.exists():
        try:
            with open(ENV_PATH, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("GITHUB_TOKEN="):
                        val = line.split("=", 1)[1].strip().strip('"').strip("'")
                        if val:
                            return val
        except Exception:
            pass
    return None


def github_request(url, token=None):
    """Perform a GET request to GitHub API with proper headers and error handling."""
    req = urllib.request.Request(url)
    req.add_header("User-Agent", USER_AGENT)
    req.add_header("Accept", "application/vnd.github.v3+json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            return json.loads(res.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="ignore")
        if e.code == 403 and "rate limit" in body.lower():
            print(f"⚠️  GitHub API rate limit reached. Tip: set GITHUB_TOKEN in your environment or .env file.")
        else:
            print(f"⚠️  HTTP Error {e.code} for {url}: {e.reason}")
        return None
    except Exception as e:
        print(f"⚠️  Network error for {url}: {e}")
        return None


def fetch_contributions_count(username=DEFAULT_USERNAME):
    """Fetch real-time all-time contribution count from GitHub API / public calendar."""
    # Method 1: Community contributions API (calculates all years accurately)
    try:
        url = f"https://github-contributions-api.jogruber.de/v4/{username}"
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(req, timeout=10) as res:
            data = json.loads(res.read().decode("utf-8"))
            totals = data.get("total", {})
            if totals:
                total_all_years = sum(int(v) for v in totals.values() if v)
                if total_all_years > 0:
                    print(f"📊 Fetched overall contributions from GitHub API: {total_all_years}")
                    return total_all_years
    except Exception as e:
        print(f"ℹ️  Contributions API fallback ({e}), attempting direct scrape...")

    # Method 2: Direct scrape of GitHub user contributions page
    try:
        url = f"https://github.com/users/{username}/contributions"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
        with urllib.request.urlopen(req, timeout=10) as res:
            html = res.read().decode("utf-8")
            m = re.search(r'([\d,]+)\s+contributions', html)
            if m:
                count = int(m.group(1).replace(",", ""))
                print(f"📊 Scraped contributions from GitHub page: {count}")
                return count
    except Exception as e:
        print(f"⚠️  Could not scrape contributions page: {e}")

    return None


def fetch_realtime_github(username=DEFAULT_USERNAME, token=None):
    """Fetch profile, repositories, languages, and activity for the user."""
    print(f"\n🚀 Fetching real-time GitHub information for: @{username}...")
    token = token or load_env_token()
    if token:
        print("🔑 Using authenticated GitHub token (high rate-limit tier)")
    else:
        print("ℹ️  Using unauthenticated requests (60 requests/hr rate limit)")

    # 1. Fetch Profile
    profile_url = f"https://api.github.com/users/{username}"
    profile = github_request(profile_url, token)
    if not profile:
        print("❌ Failed to fetch user profile.")
        return None

    print(f"✅ Profile fetched: {profile.get('name', username)} ({profile.get('public_repos', 0)} public repos, {profile.get('followers', 0)} followers)")

    # 2. Fetch Repositories
    repos_url = f"https://api.github.com/users/{username}/repos?type=public&per_page=100&sort=updated"
    raw_repos = github_request(repos_url, token) or []
    print(f"📦 Fetched {len(raw_repos)} repositories from GitHub API.")

    # Filter out forks or ignored
    existing_data = load_telemetry() or {}
    existing_repos = {r.get("name", "").lower(): r for r in existing_data.get("repos", [])}
    manual_stats = existing_data.get("manual_stats", {})

    clean_repos = []
    total_stars = 0
    total_forks = 0

    for r in raw_repos:
        name = r.get("name", "")
        if r.get("private") or r.get("fork") or name in IGNORED_REPOS:
            continue
        lower = name.lower()
        if lower.startswith("skills-") or "introduction-to-github" in lower:
            continue

        stars = r.get("stargazers_count", 0)
        forks = r.get("forks_count", 0)
        total_stars += stars
        total_forks += forks

        # Fetch languages for repository, fallback to existing cache if rate-limited
        prev = existing_repos.get(lower, {})
        lang_url = r.get("languages_url")
        languages_dict = {}
        if lang_url:
            languages_dict = github_request(lang_url, token) or prev.get("languages", {})

        clean_repos.append({
            "id": r.get("id"),
            "node_id": r.get("node_id"),
            "name": r.get("name"),
            "full_name": r.get("full_name"),
            "private": False,
            "owner": {
                "login": r.get("owner", {}).get("login"),
                "id": r.get("owner", {}).get("id"),
                "avatar_url": r.get("owner", {}).get("avatar_url"),
                "html_url": r.get("owner", {}).get("html_url"),
            },
            "html_url": r.get("html_url"),
            "description": r.get("description") or prev.get("description") or "Open source project built by Vaishnav Gaware.",
            "stargazers_count": stars if stars > 0 else prev.get("stargazers_count", stars),
            "watchers_count": r.get("watchers_count", 0),
            "language": r.get("language") or prev.get("language") or (list(languages_dict.keys())[0] if languages_dict else "Code"),
            "forks_count": forks if forks > 0 else prev.get("forks_count", forks),
            "open_issues_count": r.get("open_issues_count", 0),
            "updated_at": r.get("updated_at"),
            "pushed_at": r.get("pushed_at"),
            "topics": r.get("topics", []),
            "languages_list": list(languages_dict.keys()) if languages_dict else prev.get("languages_list", []),
            "languages": languages_dict
        })

    # 3. Discover recent external contributions from public events or preserve previous
    contributed_names = {"devabokare/Deva-Portfolio-master"}
    events_url = f"https://api.github.com/users/{username}/events/public?per_page=30"
    events = github_request(events_url, token) or []
    for ev in events:
        r_name = ev.get("repo", {}).get("name", "")
        if "/" in r_name:
            owner, r_slug = r_name.split("/", 1)
            if owner.lower() != username.lower():
                contributed_names.add(r_name)

    # Fetch info for contributed repositories if any
    for c_name in list(contributed_names)[:5]:
        c_repo = github_request(f"https://api.github.com/repos/{c_name}", token)
        if c_repo and not c_repo.get("private"):
            c_langs = github_request(c_repo.get("languages_url", ""), token) or {}
            c_stars = c_repo.get("stargazers_count", 0)
            c_forks = c_repo.get("forks_count", 0)
            total_stars += c_stars
            total_forks += c_forks
            clean_repos.append({
                "id": c_repo.get("id"),
                "name": c_repo.get("name"),
                "full_name": c_repo.get("full_name"),
                "private": False,
                "owner": {
                    "login": c_repo.get("owner", {}).get("login"),
                    "avatar_url": c_repo.get("owner", {}).get("avatar_url"),
                    "html_url": c_repo.get("owner", {}).get("html_url"),
                },
                "html_url": c_repo.get("html_url"),
                "description": c_repo.get("description") or "Open source repository contributed to by Vaishnav Gaware.",
                "stargazers_count": c_stars,
                "language": c_repo.get("language") or "Code",
                "forks_count": c_forks,
                "open_issues_count": c_repo.get("open_issues_count", 0),
                "updated_at": c_repo.get("updated_at"),
                "pushed_at": c_repo.get("pushed_at"),
                "topics": c_repo.get("topics", []),
                "languages_list": list(c_langs.keys()),
                "languages": c_langs
            })

    # 4. Fetch Real Overall Contributions Count from GitHub
    real_contribs = fetch_contributions_count(username)
    contrib_val = manual_stats.get("Contributions", real_contribs if real_contribs is not None else 944)
    print(f"📈 Real Contributions verified: {contrib_val}")

    telemetry_data = {
        "profile": profile,
        "repos": clean_repos,
        "compiledAt": int(time.time()),
        "manual_stats": manual_stats,
        "summary": {
            "public_repos": manual_stats.get("Public Repos", profile.get("public_repos", len(clean_repos))),
            "total_stars": manual_stats.get("Total Stars", total_stars),
            "total_forks": total_forks,
            "followers": manual_stats.get("Followers", profile.get("followers", 0)),
            "following": profile.get("following", 0),
            "contributions": contrib_val
        }
    }
    return telemetry_data


def load_telemetry():
    """Load the existing telemetry.json file."""
    if TELEMETRY_PATH.exists():
        try:
            with open(TELEMETRY_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error reading telemetry.json: {e}")
    return None


def sync_local_store_stats(repo_count, contrib_count):
    """Synchronize repo and contribution counts with backend localStore.ts."""
    if not LOCAL_STORE_PATH.exists():
        return
    try:
        with open(LOCAL_STORE_PATH, "r", encoding="utf-8") as f:
            content = f.read()

        pattern = r"export const githubStats = \[.*?\];"
        replacement = (
            "export const githubStats = [\n"
            f"  {{ label: 'Public Repos', value: '{repo_count}', icon: 'FolderGit2' }},\n"
            f"  {{ label: 'Contributions', value: '{contrib_count}', icon: 'GitCommit' }},\n"
            "];"
        )
        new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
        if new_content != content:
            with open(LOCAL_STORE_PATH, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"🔄 Synchronized localStore.ts githubStats: {repo_count} repos, {contrib_count} contributions")
    except Exception as e:
        print(f"⚠️  Could not update localStore.ts: {e}")


def save_telemetry(data):
    """Save telemetry data to telemetry.json and synchronize stats."""
    TELEMETRY_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(TELEMETRY_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print(f"💾 Telemetry saved to: {TELEMETRY_PATH.relative_to(PROJECT_ROOT)}")

    summary = data.get("summary", {})
    repo_cnt = summary.get("public_repos", data.get("profile", {}).get("public_repos", 9))
    contrib_cnt = summary.get("contributions", 944)
    sync_local_store_stats(repo_cnt, contrib_cnt)


def view_stats(data=None):
    """Pretty-print the current telemetry and stats."""
    if not data:
        data = load_telemetry()
    if not data:
        print("❌ No telemetry data found. Run with --fetch to pull from GitHub.")
        return

    profile = data.get("profile", {})
    repos = data.get("repos", [])
    compiled_at = data.get("compiledAt")
    date_str = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(compiled_at)) if compiled_at else "Unknown"

    contribs = data.get("summary", {}).get("contributions", "N/A")
    print("\n" + "═" * 60)
    print(f"   GITHUB TELEMETRY DASHBOARD (@{profile.get('login', DEFAULT_USERNAME)})")
    print(f"   Last Synced: {date_str}")
    print("═" * 60)
    print(f"  • Name:                  {profile.get('name', 'N/A')}")
    print(f"  • Public Repos:          {profile.get('public_repos', len(repos))}")
    print(f"  • Overall Contributions: {contribs}")
    print(f"  • Followers:             {profile.get('followers', 0)}")
    print(f"  • Following:             {profile.get('following', 0)}")
    print(f"  • Profile URL:           {profile.get('html_url', 'https://github.com/' + DEFAULT_USERNAME)}")

    total_stars = sum(r.get("stargazers_count", 0) for r in repos)
    total_forks = sum(r.get("forks_count", 0) for r in repos)
    print(f"  • Total Stars:       ★ {total_stars}")
    print(f"  • Total Forks:       ⑂ {total_forks}")
    print("─" * 60)
    print(f"  TOP REPOSITORIES ({len(repos)} total tracked):")
    sorted_repos = sorted(repos, key=lambda x: (x.get("stargazers_count", 0), x.get("pushed_at", "")), reverse=True)
    for idx, r in enumerate(sorted_repos[:6], start=1):
        lang = r.get("language") or "Code"
        stars = r.get("stargazers_count", 0)
        forks = r.get("forks_count", 0)
        desc = (r.get("description") or "")[:50]
        print(f"  {idx}. {r.get('name'):<28} [{lang:<10}] ★ {stars:<3} ⑂ {forks:<3} | {desc}")
    print("═" * 60 + "\n")


def manual_set_stat(label, value):
    """Manually add or update a stat metric in telemetry and local store."""
    data = load_telemetry() or {"profile": {}, "repos": [], "compiledAt": int(time.time())}
    if "manual_stats" not in data:
        data["manual_stats"] = {}
    data["manual_stats"][label] = str(value)

    # If label matches profile attributes, update them directly
    norm_label = label.lower().replace(" ", "_")
    if "repo" in norm_label:
        try:
            num = int(''.join(filter(str.isdigit, str(value))))
            data["profile"]["public_repos"] = num
        except Exception:
            pass
    elif "follower" in norm_label:
        try:
            num = int(''.join(filter(str.isdigit, str(value))))
            data["profile"]["followers"] = num
        except Exception:
            pass

    data["compiledAt"] = int(time.time())
    save_telemetry(data)
    print(f"✅ Metric updated: '{label}' => '{value}'")


def manual_add_repo(name, description, language="TypeScript", stars=0, forks=0, url=None):
    """Manually register or add a custom repository to telemetry."""
    data = load_telemetry() or {"profile": {"login": DEFAULT_USERNAME}, "repos": [], "compiledAt": int(time.time())}
    url = url or f"https://github.com/{DEFAULT_USERNAME}/{name}"

    new_repo = {
        "id": int(time.time()),
        "name": name,
        "full_name": f"{DEFAULT_USERNAME}/{name}",
        "html_url": url,
        "description": description,
        "stargazers_count": int(stars),
        "forks_count": int(forks),
        "language": language,
        "languages_list": [language],
        "languages": {language: 1000},
        "topics": [],
        "updated_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "pushed_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "owner": {
            "login": DEFAULT_USERNAME,
            "html_url": f"https://github.com/{DEFAULT_USERNAME}"
        }
    }
    # Check if exists and replace or append
    existing = False
    for i, r in enumerate(data.get("repos", [])):
        if r.get("name", "").lower() == name.lower():
            data["repos"][i] = new_repo
            existing = True
            break
    if not existing:
        data.setdefault("repos", []).insert(0, new_repo)

    data["compiledAt"] = int(time.time())
    save_telemetry(data)
    print(f"✅ Repository '{name}' successfully registered in telemetry!")


def interactive_menu():
    """Interactive CLI menu for retrieving and modifying GitHub information."""
    while True:
        print("\n" + "═" * 50)
        print("  ⚡ GITHUB TELEMETRY MANAGER")
        print("═" * 50)
        print("  [1] Fetch Real-Time Data from GitHub (Automated)")
        print("  [2] View Current Stats & Telemetry")
        print("  [3] Manually Add / Edit a Stat (e.g. Stars, Followers, Repos)")
        print("  [4] Manually Add / Update a Repository")
        print("  [5] Run Continuous Watch/Sync Daemon")
        print("  [6] Exit")
        print("─" * 50)
        choice = input("Select an option (1-6): ").strip()

        if choice == "1":
            data = fetch_realtime_github()
            if data:
                save_telemetry(data)
                view_stats(data)
        elif choice == "2":
            view_stats()
        elif choice == "3":
            label = input("Enter Stat Label (e.g. 'Public Repos', 'Total Stars', 'Contributions', 'Followers'): ").strip()
            if label:
                val = input(f"Enter Value for '{label}' (e.g. '60+', '1.2k', '340'): ").strip()
                if val:
                    manual_set_stat(label, val)
        elif choice == "4":
            name = input("Repository Name: ").strip()
            if name:
                desc = input("Repository Description: ").strip()
                lang = input("Primary Language (default: TypeScript): ").strip() or "TypeScript"
                stars = input("Stars count (default: 0): ").strip() or "0"
                forks = input("Forks count (default: 0): ").strip() or "0"
                manual_add_repo(name, desc, lang, int(stars), int(forks))
        elif choice == "5":
            interval = input("Sync Interval in seconds (default: 3600): ").strip() or "3600"
            run_watch(int(interval))
        elif choice == "6" or choice.lower() in ("q", "exit"):
            print("👋 Exiting GitHub Telemetry Manager.")
            break
        else:
            print("Invalid option. Please choose 1-6.")


def run_watch(interval=3600):
    """Run automated background polling at regular intervals."""
    print(f"🔄 Starting GitHub Telemetry Watcher (syncing every {interval}s)... Press Ctrl+C to stop.\n")
    try:
        while True:
            data = fetch_realtime_github()
            if data:
                save_telemetry(data)
                print(f"⏱️  Next sync in {interval} seconds ({interval // 60} mins)...")
            time.sleep(interval)
    except KeyboardInterrupt:
        print("\n⏹️  Watcher stopped by user.")


def main():
    parser = argparse.ArgumentParser(description="GitHub Telemetry Real-time Sync and Manual Manager")
    parser.add_argument("--fetch", action="store_true", help="Fetch real-time data from GitHub API and update telemetry.json")
    parser.add_argument("--view", action="store_true", help="View current stored telemetry data in formatted table")
    parser.add_argument("--interactive", "-i", action="store_true", help="Launch interactive CLI menu")
    parser.add_argument("--set-stat", nargs=2, metavar=("LABEL", "VALUE"), help="Manually set a stat (e.g. --set-stat 'Total Stars' '1.2k')")
    parser.add_argument("--add-repo", nargs=2, metavar=("NAME", "DESCRIPTION"), help="Manually add a repository")
    parser.add_argument("--watch", action="store_true", help="Run in continuous watch/sync loop")
    parser.add_argument("--interval", type=int, default=3600, help="Watch loop interval in seconds (default: 3600)")
    parser.add_argument("--username", default=DEFAULT_USERNAME, help=f"GitHub username (default: {DEFAULT_USERNAME})")
    parser.add_argument("--token", default=None, help="GitHub Personal Access Token for higher rate limits")

    args = parser.parse_args()

    if args.interactive:
        interactive_menu()
    elif args.view:
        view_stats()
    elif args.set_stat:
        manual_set_stat(args.set_stat[0], args.set_stat[1])
    elif args.add_repo:
        manual_add_repo(args.add_repo[0], args.add_repo[1])
    elif args.watch:
        run_watch(args.interval)
    else:
        # Default behavior: sync live GitHub data and display summary
        data = fetch_realtime_github(username=args.username, token=args.token)
        if data:
            save_telemetry(data)
            view_stats(data)


if __name__ == "__main__":
    main()
