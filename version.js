// The current release, read from GitHub when the page loads.
// GitHub's "latest release" is never a pre-release, so test versions never show here.
// One release carries all three: the tag addon-v<version> is the Home Assistant app and the
// Docker image version, and Sonorium-Setup-<version>.exe attached to it is the Windows installer.
// The answer is kept for the browser session (GitHub allows 60 requests an hour per address);
// without GitHub, the page keeps the version written into it and links to the Releases page.
(function () {
    const API = 'https://api.github.com/repos/synssins/sonorium/releases/latest';
    const RELEASES = 'https://github.com/synssins/sonorium/releases/latest';
    const KEY = 'sonorium-release';
    const KEEP_MS = 60 * 60 * 1000;      // a found release: one hour
    const RETRY_MS = 10 * 60 * 1000;     // no answer from GitHub: try again after ten minutes

    function readCache() {
        try {
            const c = JSON.parse(sessionStorage.getItem(KEY) || 'null');
            if (c && Date.now() - c.t < (c.release ? KEEP_MS : RETRY_MS)) return c;
        } catch (e) { /* storage blocked: ask GitHub */ }
        return null;
    }

    function writeCache(release) {
        try { sessionStorage.setItem(KEY, JSON.stringify({ t: Date.now(), release })); } catch (e) { /* ignore */ }
    }

    function parse(data) {
        if (!data || data.prerelease || data.draft) return null;
        const m = /^addon-v(\d+\.\d+\.\d+)$/.exec(data.tag_name || '');
        if (!m) return null;
        const exe = (data.assets || []).find(a => /^Sonorium-Setup-\d+\.\d+\.\d+\.exe$/.test(a.name));
        return {
            version: m[1],
            page: data.html_url || RELEASES,
            exe: exe ? exe.browser_download_url : null,
            exeName: exe ? exe.name : null,
        };
    }

    function show(release) {
        if (!release) return;
        const v = 'v' + release.version;
        document.querySelectorAll('[data-release="version"]').forEach(el => { el.textContent = v; });
        document.querySelectorAll('[data-release="windows-download"]').forEach(el => {
            el.href = release.exe || release.page;
        });
        document.querySelectorAll('[data-release="windows-file"]').forEach(el => {
            if (release.exeName) el.textContent = release.exeName;
        });
    }

    async function load() {
        const cached = readCache();
        if (cached) { show(cached.release); return; }
        let release = null;
        try {
            const r = await fetch(API, { headers: { Accept: 'application/vnd.github+json' } });
            if (r.ok) release = parse(await r.json());
        } catch (e) { /* offline, blocked or rate limited: keep the version written into the page */ }
        writeCache(release);
        show(release);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load);
    else load();
})();
