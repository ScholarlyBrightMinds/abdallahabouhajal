#!/usr/bin/env python3
"""
draft_blog.py — drafts one blog post in Abdallah's voice and wires it into the site.

Run weekly by .github/workflows/saturday-blog.yml. Picks a topic (a waiting
"Blog idea for Saturday" issue takes priority, otherwise the next unused idea
in data/blog/ideas.json), drafts the post with Claude, writes blog-post-N.html,
and patches the four surfaces a post touches (theme.config.js, blog.html schema,
sitemap.xml, blog.css cover). The workflow then opens a DRAFT pull request, so
nothing reaches the live site until Abdallah reviews and merges.

Model: claude-sonnet-4-6 (cheap, plenty for short personal essays). Cost per run
is a few cents; see the PR body the workflow generates.
"""

import datetime
import glob
import html
import json
import os
import re
import sys

import anthropic

REPO = os.path.dirname(os.path.abspath(__file__))
IDEAS_PATH = os.path.join(REPO, "data", "blog", "ideas.json")
THEME_PATH = os.path.join(REPO, "theme.config.js")
BLOG_INDEX_PATH = os.path.join(REPO, "blog.html")
SITEMAP_PATH = os.path.join(REPO, "sitemap.xml")
BASE_URL = "https://scholarlybrightminds.github.io/abdallahabouhajal"

# Tags map to an existing .blog-cover--KEY gradient in blog.css. Unknown tags
# fall back to "default" so the script never has to inject new CSS at runtime.
TAG_COVER = {
    "Culture": "culture", "Leadership": "git", "Productivity": "ai",
    "Personal": "distance", "Research": "git", "AI": "ai", "Event": "hack",
}

# ── The voice. This is the frozen style guide; everything else is plumbing. ──
STYLE_GUIDE = """\
You are ghost-writing a personal blog post AS Abdallah Abou Hajal, a researcher
in AI and drug discovery. Write in HIS voice, in the first person. He will read,
redraft, and approve before anything publishes, so aim for a strong draft, not a
finished artifact.

His voice, learned from his existing posts:

- NO DASHES. Never use an em dash or an en dash. Use periods, commas, or a new
  sentence. This is the single most important rule. A dash anywhere fails the draft.
- Open on a small, concrete truth or observation, never a windup or a definition.
  ("Not hearing back is worse than hearing a no.")
- Short paragraphs. Vary their length deliberately. Some are one sentence. The
  rhythm is uneven on purpose. That unevenness is what makes it read human.
- DO NOT put a subheading on every section. Most posts flow as prose with maybe
  one soft turn ("Here is the part for whoever is leading..."). Use zero, one, or
  at most two H2 headings, and only when a real shift earns one. A post with a
  heading over every two paragraphs reads like a machine wrote it. Mix it up: some
  posts have no headings at all.
- Emotional but always productive. Let a feeling sit for a beat, then turn it into
  something the reader can act on.
- Close by handing the reader a responsibility, especially a leadership one
  ("if you are in a position where people reach out to you, just respond").
- He is professional, warm, and a little opinionated. He leads. He is not preachy.
- Plain English. Absolutely no AI cliches: no "delve", "leverage", "underscore",
  "navigate the landscape", "in today's world", "in this digital era", "tapestry",
  "testament to", and no emoji.
- Length: roughly 400 to 700 words.

End every post with two final paragraphs, exactly:
  1. "· Abdallah"
  2. one italic line of current status or a closing aside (this goes in its own
     paragraph and will be wrapped in <em>).

For the title, also pick ONE word or short phrase from the title to italicize for
emphasis (the site renders it in italics).
"""

POST_SCHEMA = {
    "type": "object",
    "properties": {
        "title": {"type": "string"},
        "title_emphasis": {"type": "string"},
        "tag": {"type": "string"},
        "excerpt": {"type": "string"},
        "reading_time": {"type": "string"},
        "body": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "kind": {"type": "string", "enum": ["p", "h2"]},
                    "text": {"type": "string"},
                },
                "required": ["kind", "text"],
                "additionalProperties": False,
            },
        },
        "future_ideas": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "tag": {"type": "string"},
                    "angle": {"type": "string"},
                },
                "required": ["title", "tag", "angle"],
                "additionalProperties": False,
            },
        },
    },
    "required": ["title", "title_emphasis", "tag", "excerpt", "reading_time", "body", "future_ideas"],
    "additionalProperties": False,
}


def existing_post_numbers():
    nums = []
    for path in glob.glob(os.path.join(REPO, "blog-post-*.html")):
        m = re.search(r"blog-post-(\d+)\.html$", os.path.basename(path))
        if m:
            nums.append(int(m.group(1)))
    return sorted(nums)


def voice_anchors(limit=5):
    """Pull the prose from the most recent posts so the model hears the voice."""
    anchors = []
    for n in reversed(existing_post_numbers()):
        if len(anchors) >= limit:
            break
        path = os.path.join(REPO, f"blog-post-{n}.html")
        try:
            src = open(path, encoding="utf-8").read()
        except OSError:
            continue
        body = re.search(r'<div class="post-body">(.*?)</div>', src, re.S)
        title = re.search(r'<h1 class="post-title">(.*?)</h1>', src, re.S)
        if not body:
            continue
        paras = re.findall(r"<p>(.*?)</p>", body.group(1), re.S)
        text = "\n\n".join(html.unescape(re.sub(r"<[^>]+>", "", p)).strip() for p in paras)
        t = html.unescape(re.sub(r"<[^>]+>", "", title.group(1)).strip()) if title else f"Post {n}"
        anchors.append(f"### {t}\n\n{text}")
    return "\n\n---\n\n".join(anchors)


def pick_idea():
    """Issue-driven idea wins; otherwise the next unused bank idea."""
    issue_title = os.environ.get("IDEA_TITLE", "").strip()
    if issue_title:
        return {
            "title": issue_title,
            "tag": os.environ.get("IDEA_TAG", "").strip() or "Culture",
            "angle": os.environ.get("IDEA_ANGLE", "").strip(),
            "source": "issue",
        }, None
    data = json.load(open(IDEAS_PATH, encoding="utf-8"))
    for i, idea in enumerate(data["ideas"]):
        if not idea.get("used"):
            return {**idea, "source": "bank"}, i
    # Bank exhausted: cycle it so the system keeps running.
    for idea in data["ideas"]:
        idea["used"] = False
    json.dump(data, open(IDEAS_PATH, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
    return {**data["ideas"][0], "source": "bank"}, 0


def draft(idea):
    client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY from env
    user = (
        f"Write this week's post.\n\nTitle direction: {idea['title']}\n"
        f"Suggested tag: {idea['tag']}\nAngle: {idea.get('angle', '')}\n\n"
        "Treat the title direction as a starting point. Refine it into a real, "
        "specific title if you can. Then also propose 2 fresh future post ideas "
        "in the same voice for the idea bank."
    )
    resp = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4000,
        # cache_control caches the long style guide + voice anchors. It is a
        # single weekly call so reads are rare, but it is free insurance and
        # pays off immediately if this is ever extended to draft several posts.
        system=[
            {"type": "text", "text": STYLE_GUIDE},
            {"type": "text",
             "text": "Here are recent posts in his voice. Match the rhythm, not the topics:\n\n"
                     + voice_anchors(),
             "cache_control": {"type": "ephemeral"}},
        ],
        output_config={"format": {"type": "json_schema", "schema": POST_SCHEMA}},
        messages=[{"role": "user", "content": user}],
    )
    text = next(b.text for b in resp.content if b.type == "text")
    print(f"usage: in={resp.usage.input_tokens} out={resp.usage.output_tokens} "
          f"cache_read={getattr(resp.usage, 'cache_read_input_tokens', 0)}", file=sys.stderr)
    return json.loads(text)


def render_html(post, date_label):
    title = html.escape(post["title"])
    emph = post.get("title_emphasis", "").strip()
    title_html = title
    if emph:
        esc_emph = html.escape(emph)
        if esc_emph in title:
            title_html = title.replace(esc_emph, f"<em>{esc_emph}</em>", 1)
    tag = html.escape(post["tag"])
    desc = html.escape(post["excerpt"])

    blocks = []
    for b in post["body"]:
        t = html.escape(b["text"].strip())
        if b["kind"] == "h2":
            blocks.append(f"        <h2>{t}</h2>")
        else:
            blocks.append(f"        <p> {t} </p>")
    body_html = "\n".join(blocks)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="{title}. {desc} A blog post by Abdallah Abou Hajal.">
<title>{title} · Blog</title>

<link rel="icon" href="images/profile.png" type="image/png">
<link rel="apple-touch-icon" href="images/profile.png">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,300;1,9..144,400&family=Manrope:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet">

<script src="theme.config.js"></script>
<link rel="stylesheet" href="styles.css">
<link rel="stylesheet" href="blog.css">
</head>
<body>

<div class="mol-bg" aria-hidden="true">
    <svg class="mol-1" viewBox="0 0 100 100"><polygon points="30,25 55,25 67,50 55,75 30,75 18,50"/><line x1="67" y1="50" x2="82" y2="50"/><circle cx="85" cy="50" r="2.5"/></svg>
    <svg class="mol-2 amber" viewBox="0 0 100 100"><polygon points="50,20 78,38 68,68 32,68 22,38"/><line x1="78" y1="38" x2="92" y2="28"/><circle cx="94" cy="28" r="2"/></svg>
    <svg class="mol-3" viewBox="0 0 140 100"><polygon points="30,30 55,30 67,52 55,74 30,74 18,52"/><polygon points="67,30 92,30 104,52 92,74 67,74 55,52"/><line x1="104" y1="52" x2="120" y2="52"/><circle cx="123" cy="52" r="2.5"/></svg>
</div>

<nav class="nav" data-page="blog"></nav>

<main>
    <article class="post-article">

        <header class="post-header">
            <div class="post-meta">
                <span class="post-tag">{tag}</span>
                <span class="post-date">{date_label}</span>
            </div>
            <h1 class="post-title">{title_html}</h1>
        </header>

        <div class="post-body">
{body_html}
        </div>

        <footer class="post-footer">
            <a class="post-back" href="blog.html">← Back to blog</a>
            <span class="post-date" style="color: var(--muted); font-family: var(--mono); font-size: 0.72rem;">{date_label}</span>
        </footer>

    </article>
</main>

<footer data-bind="footer"></footer>
<script src="scripts.js"></script>
</body>
</html>
"""


def patch_files(post, n, date_label, iso_date):
    cover = TAG_COVER.get(post["tag"], "default")
    title = post["title"].replace('"', "'")
    excerpt = post["excerpt"].replace('"', "'")

    # theme.config.js — prepend a blog[] entry (newest first)
    theme = open(THEME_PATH, encoding="utf-8").read()
    entry = (
        "    blog: [\n"
        "        {\n"
        f'            file: "blog-post-{n}.html",\n'
        f'            title: "{title}",\n'
        f'            date: "{date_label}",\n'
        f'            tag: "{post["tag"]}",\n'
        f'            cover: "{cover}",\n'
        f'            readingTime: "{post["reading_time"]}",\n'
        f'            excerpt: "{excerpt}"\n'
        "        },\n"
    )
    theme = theme.replace("    blog: [\n", entry, 1)
    open(THEME_PATH, "w", encoding="utf-8").write(theme)

    # blog.html — prepend a BlogPosting to the schema array
    idx = open(BLOG_INDEX_PATH, encoding="utf-8").read()
    posting = (
        '  "blogPost": [\n'
        f'    {{"@type": "BlogPosting", "headline": "{title}", "datePublished": "{iso_date}", '
        f'"url": "{BASE_URL}/blog-post-{n}.html"}},\n'
    )
    idx = idx.replace('  "blogPost": [\n', posting, 1)
    open(BLOG_INDEX_PATH, "w", encoding="utf-8").write(idx)

    # sitemap.xml — add the new post URL ahead of the existing posts
    sm = open(SITEMAP_PATH, encoding="utf-8").read()
    anchor = f"  <url>\n    <loc>{BASE_URL}/blog-post-{n - 1}.html</loc>"
    new_url = (
        f"  <url>\n    <loc>{BASE_URL}/blog-post-{n}.html</loc>\n"
        f"    <lastmod>{iso_date}</lastmod>\n    <priority>0.6</priority>\n  </url>\n"
    )
    if anchor in sm:
        sm = sm.replace(anchor, new_url + anchor, 1)
    else:  # fall back to inserting before </urlset>
        sm = sm.replace("</urlset>", new_url + "</urlset>", 1)
    open(SITEMAP_PATH, "w", encoding="utf-8").write(sm)


def refill_bank(future_ideas, used_index):
    data = json.load(open(IDEAS_PATH, encoding="utf-8"))
    if used_index is not None:
        data["ideas"][used_index]["used"] = True
    for fi in future_ideas:
        data["ideas"].append({**fi, "used": False})
    json.dump(data, open(IDEAS_PATH, "w", encoding="utf-8"), indent=2, ensure_ascii=False)


def main():
    idea, bank_index = pick_idea()
    nums = existing_post_numbers()
    n = (max(nums) + 1) if nums else 1
    today = datetime.date.today()
    date_label = today.strftime("%b %-d, %Y") if os.name != "nt" else today.strftime("%b %d, %Y").replace(" 0", " ")
    iso_date = today.isoformat()

    print(f"Drafting post #{n} from {idea['source']} idea: {idea['title']!r}", file=sys.stderr)
    post = draft(idea)

    out_path = os.path.join(REPO, f"blog-post-{n}.html")
    open(out_path, "w", encoding="utf-8").write(render_html(post, date_label))
    patch_files(post, n, date_label, iso_date)
    refill_bank(post.get("future_ideas", []), bank_index if idea["source"] == "bank" else None)

    # Hand outputs to the workflow via GITHUB_OUTPUT for the PR title/body.
    gh_out = os.environ.get("GITHUB_OUTPUT")
    if gh_out:
        with open(gh_out, "a", encoding="utf-8") as f:
            f.write(f"post_number={n}\n")
            f.write(f"post_title={post['title']}\n")
            f.write(f"post_file=blog-post-{n}.html\n")
    print(f"Wrote blog-post-{n}.html and patched config.", file=sys.stderr)


if __name__ == "__main__":
    main()
