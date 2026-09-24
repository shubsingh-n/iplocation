document.addEventListener('DOMContentLoaded', () => {
    const locateBtn = document.getElementById('locateBtn');
    const btnText = locateBtn.querySelector('.btn-text');
    const loader = locateBtn.querySelector('.loader');
    const resultsGrid = document.getElementById('resultsGrid');

    locateBtn.addEventListener('click', async () => {
        // UI State: Loading
        btnText.classList.add('hidden');
        loader.classList.remove('hidden');
        locateBtn.disabled = true;
        
        // Show the grid if it was hidden
        resultsGrid.classList.remove('hidden');

        const metadata = getBrowserMetadata();

        // Fetch data simultaneously
        await Promise.all([
            fetchIPInfo(metadata),
            fetchIPAPI(metadata)
        ]);

        // UI State: Done
        btnText.classList.remove('hidden');
        loader.classList.add('hidden');
        locateBtn.disabled = false;
        btnText.textContent = "Refresh Location";
    });

    async function fetchIPInfo(metadata) {
        try {
            const response = await fetch('https://ipinfo.io/json');
            const data = await response.json();
            updateCard('card-ipinfo', {
                ip: data.ip,
                location: `${data.city}, ${data.region}, ${data.country}`,
                org: data.org,
                ...metadata
            });
        } catch (error) {
            handleError('card-ipinfo', metadata);
        }
    }

    async function fetchIPAPI(metadata) {
        try {
            const response = await fetch('/api/ipapi');
            const data = await response.json();
            updateCard('card-ipapi', {
                ip: data.query,
                location: `${data.city}, ${data.regionName}, ${data.country}`,
                org: data.isp,
                ...metadata
            });
        } catch (error) {
            handleError('card-ipapi', metadata);
        }
    }

    function getBrowserMetadata() {
        const ua = navigator.userAgent;
        let device = 'Desktop';
        if (/Mobi|Android/i.test(ua)) {
            device = 'Mobile';
        } else if (/Tablet|iPad/i.test(ua)) {
            device = 'Tablet';
        }

        let os = 'Unknown OS';
        if (ua.indexOf('Win') !== -1) os = 'Windows';
        if (ua.indexOf('Mac') !== -1) os = 'MacOS';
        if (ua.indexOf('Linux') !== -1) os = 'Linux';
        if (ua.indexOf('Android') !== -1) os = 'Android';
        if (ua.indexOf('like Mac') !== -1) os = 'iOS';

        let browser = 'Unknown Browser';
        if (ua.indexOf('Firefox') !== -1) browser = 'Firefox';
        else if (ua.indexOf('SamsungBrowser') !== -1) browser = 'Samsung Internet';
        else if (ua.indexOf('Opera') !== -1 || ua.indexOf('OPR') !== -1) browser = 'Opera';
        else if (ua.indexOf('Trident') !== -1) browser = 'Internet Explorer';
        else if (ua.indexOf('Edge') !== -1 || ua.indexOf('Edg') !== -1) browser = 'Edge';
        else if (ua.indexOf('Chrome') !== -1) browser = 'Chrome';
        else if (ua.indexOf('Safari') !== -1) browser = 'Safari';

        const language = navigator.language || navigator.userLanguage || 'Unknown';
        const browserStr = `${browser} (${language})`;

        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown';
        const localTime = new Date().toLocaleTimeString();
        const timezoneStr = `${timeZone} / ${localTime}`;

        const referrer = document.referrer || 'Direct';

        return {
            device: device,
            os: os,
            browser: browserStr,
            timezone: timezoneStr,
            referrer: referrer
        };
    }

    function updateCard(cardId, data) {
        const card = document.getElementById(cardId);
        if (!card) return;

        for (const [key, value] of Object.entries(data)) {
            const field = card.querySelector(`[data-field="${key}"]`);
            if (field) {
                field.textContent = value || 'Unknown';
            }
        }
    }

    function handleError(cardId, metadata) {
        updateCard(cardId, {
            ip: 'Error fetching data',
            location: '-',
            org: '-',
            ...metadata
        });
        const card = document.getElementById(cardId);
        if (card) {
            const ipField = card.querySelector('[data-field="ip"]');
            if (ipField) ipField.style.color = '#ef4444';
        }
    }
});
