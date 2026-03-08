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
html = re.sub(r'style\.css\?v=\d+', 'style.css?v=11', html)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)

css_path = r'c:\Users\user\Desktop\Antigravity作成ファイル\日本神話\website\style.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# Update background position globally
css = css.replace('center/cover', 'center 20%/cover')

ep_css = '\n/* Individual Episode Visuals */\n'
for i in range(1, 51):
    ep_img_path = os.path.join(r'c:\Users\user\Desktop\Antigravity作成ファイル\日本神話\website\images', f'ep{i}.png')
    if os.path.exists(ep_img_path):
        part = (i-1)//10 + 1
        ep_css += f'#part{part} .episode-card--ep{i} .episode-card__visual {{ background: url(\'images/ep{i}.png\') center 20%/cover !important; }}\n'

if '/* Individual Episode Visuals */' not in css:
    css += ep_css
else:
    css = re.sub(r'/\* Individual Episode Visuals \*/.*', ep_css.strip(), css, flags=re.DOTALL)

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)

print('CSS and HTML updated.')
