import re
from pathlib import Path
text = Path('prado.html').read_text(errors='ignore')
urls = re.findall(r'https://[^"\'\>\s]+\.(?:jpg|jpeg|png)', text)
seen = []
for url in urls:
    if 'carwow' in url or 'caranddriver' in url or 'hips.hearstapps.com' in url:
        if url not in seen:
            seen.append(url)
            print(url)
            if len(seen) >= 10:
                break
