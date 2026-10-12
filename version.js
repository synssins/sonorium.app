// The released version, from the add-on's config.yaml (the Home Assistant app and Docker share it)
async function fetchVersion() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/synssins/sonorium/main/sonorium_addon/config.yaml');
        const text = await response.text();
        const match = text.match(/^version:\s*"?([^"\n]+)"?/m);
        if (!match) return;
        const version = 'v' + match[1];
        ['addon-version', 'addon-version-badge', 'docker-version', 'docker-version-badge'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = version;
        });
    } catch (e) {
        console.log('Could not fetch the version');
    }
}

document.addEventListener('DOMContentLoaded', fetchVersion);
