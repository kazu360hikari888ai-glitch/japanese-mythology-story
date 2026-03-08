import os
import re

html_path = r'c:\Users\user\Desktop\Antigravity作成ファイル\日本神話\website\index.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

def repl(m):
    ep = m.group(1)
    match_str = m.group(0)
    if f'episode-card--ep{ep}' not in match_str:
        return match_str.replace('class="episode-card', f'class="episode-card episode-card--ep{ep}')
    return match_str

html = re.sub(r'<a href="episode(\d+)\.html" class="episode-card[^"]*"', repl, html)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
