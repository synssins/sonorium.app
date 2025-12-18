// Fetch addon version from config.yaml
async function fetchAddonVersion() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/synssins/sonorium/main/sonorium_addon/config.yaml');
        const text = await response.text();
        const versionMatch = text.match(/version:\s*"?([^"\n]+)"?/);
        if (versionMatch) {
            const version = 'v' + versionMatch[1];
            const addonVersion = document.getElementById('addon-version');
            const addonBadge = document.getElementById('addon-version-badge');
            if (addonVersion) addonVersion.textContent = version;
            if (addonBadge) addonBadge.textContent = version;
        }
    } catch (e) {
        console.log('Could not fetch addon version');
    }
}

// Fetch Windows app release from GitHub API
async function fetchAppRelease() {
    try {
        const response = await fetch('https://api.github.com/repos/synssins/sonorium/releases');
        const releases = await response.json();
        
        // Find the latest STABLE release with a Windows exe (skip alpha/beta)
        for (const release of releases) {
            const version = (release.tag_name || release.name || '').toLowerCase();
            
            // Skip alpha and beta releases
            if (version.includes('alpha') || version.includes('beta')) {
                continue;
            }
            
            const exeAsset = release.assets.find(a => a.name.endsWith('.exe'));
            if (exeAsset) {
                const displayVersion = release.tag_name || release.name;
                const appVersion = document.getElementById('app-version');
                const appBadge = document.getElementById('app-version-badge');
                const windowsBtn = document.getElementById('windows-download-btn');
                const ctaBtn = document.getElementById('cta-windows-btn');
                const windowsNote = document.getElementById('windows-note');
                
                if (appVersion) appVersion.textContent = displayVersion;
                if (appBadge) appBadge.textContent = displayVersion;
                if (windowsBtn) windowsBtn.href = exeAsset.browser_download_url;
                if (ctaBtn) ctaBtn.href = exeAsset.browser_download_url;
                if (windowsNote) windowsNote.textContent = 'Stable release • No install required';
                return;
            }
        }
        
        // No stable release found - fallback to releases page
        setFallbackLinks();
    } catch (e) {
        console.log('Could not fetch app release');
        setFallbackLinks();
    }
}

function setFallbackLinks() {
    const windowsBtn = document.getElementById('windows-download-btn');
    const ctaBtn = document.getElementById('cta-windows-btn');
    const appVersion = document.getElementById('app-version');
    const windowsNote = document.getElementById('windows-note');
    
    if (windowsBtn) windowsBtn.href = 'https://github.com/synssins/sonorium/releases';
    if (ctaBtn) ctaBtn.href = 'https://github.com/synssins/sonorium/releases';
    if (appVersion) appVersion.textContent = 'See Releases';
    if (windowsNote) windowsNote.textContent = 'View all releases on GitHub';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchAddonVersion();
    fetchAppRelease();
});