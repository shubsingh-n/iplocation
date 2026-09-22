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

        // Fetch data simultaneously
        await Promise.all([
            fetchIPInfo(),
            fetchIP2Location(),
            fetchIPAPI()
        ]);

        // UI State: Done
        btnText.classList.remove('hidden');
        loader.classList.add('hidden');
        locateBtn.disabled = false;
        btnText.textContent = "Refresh Location";
    });

    async function fetchIPInfo() {
        try {
            const response = await fetch('https://ipinfo.io/json');
            const data = await response.json();
            updateCard('card-ipinfo', {
                ip: data.ip,
                location: `${data.city}, ${data.region}, ${data.country}`,
                org: data.org
            });
        } catch (error) {
            handleError('card-ipinfo');
        }
    }

    async function fetchIP2Location() {
        try {
            // Using their demo API endpoint
            const response = await fetch('https://api.ip2location.io/?key=demo');
            const data = await response.json();
            updateCard('card-ip2location', {
                ip: data.ip,
                location: `${data.city_name}, ${data.region_name}, ${data.country_name}`,
                org: data.as || data.isp || 'N/A'
            });
        } catch (error) {
            handleError('card-ip2location');
        }
    }

    async function fetchIPAPI() {
        try {
            const response = await fetch('/api/ipapi');
            const data = await response.json();
            updateCard('card-ipapi', {
                ip: data.query,
                location: `${data.city}, ${data.regionName}, ${data.country}`,
                org: data.isp
            });
        } catch (error) {
            handleError('card-ipapi');
        }
    }

    function updateCard(cardId, data) {
        const card = document.getElementById(cardId);
        if (!card) return;

        card.querySelector('[data-field="ip"]').textContent = data.ip || 'Unknown';
        card.querySelector('[data-field="location"]').textContent = data.location || 'Unknown';
        card.querySelector('[data-field="org"]').textContent = data.org || 'Unknown';
    }

    function handleError(cardId) {
        const card = document.getElementById(cardId);
        if (!card) return;

        card.querySelector('[data-field="ip"]').textContent = 'Error fetching data';
        card.querySelector('[data-field="ip"]').style.color = '#ef4444';
        card.querySelector('[data-field="location"]').textContent = '-';
        card.querySelector('[data-field="org"]').textContent = '-';
    }
});
