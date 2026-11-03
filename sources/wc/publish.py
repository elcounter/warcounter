# Construit l'app puis met à jour ../../index.html (en-tête PWA conservé), ../../sw.js et build-check/WarCounter-X.Y.Z.html
import os, re, subprocess, sys
here = os.path.dirname(os.path.abspath(__file__)); os.chdir(here)
subprocess.run([sys.executable, 'build.py'], check=True, stdout=subprocess.DEVNULL)
app = open('warcounter.html').read()
version = re.search(r"VERSION='([^']+)'", open('build.py').read()).group(1)
root = os.path.join(here, '..', '..')
idx = open(os.path.join(root, 'index.html')).read()
i = idx.find('<title>WarCounter</title>'); j = idx.rfind('\n<script>if ("serviceWorker"')
assert i > 0 and j > i, "en-tête PWA introuvable dans index.html"
open(os.path.join(root, 'index.html'), 'w').write(idx[:i] + app + idx[j:])
sw = os.path.join(root, 'sw.js'); s = open(sw).read()
open(sw, 'w').write(re.sub(r'const VERSION = "[^"]*";', f'const VERSION = "warcounter-{version}";', s))
dl = os.path.join(here, 'build-check', f'WarCounter-{version}.html')
open(dl, 'w').write('<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n' + app + '\n</html>')
print('OK version', version, '-> index.html, sw.js,', os.path.relpath(dl, root))
