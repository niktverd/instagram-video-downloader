(async () => {
    const delayLocal = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const states = [
        'Delaware',
        'Florida',
        'Georgia',
        'Hawaii',
        'Idaho',
        'Illinois',
        'Indiana',
        'Iowa',
        'Kansas',
        'Kentucky',
        'Louisiana',
        'Maine',
        'Maryland',
        'Massachusetts',
        'Michigan',
        'Minnesota',
        'Mississippi',
        'Missouri',
        'Montana',
        'Nebraska',
        'Nevada',
        'New Hampshire',
        'New Jersey',
        'New Mexico',
        'New York',
        'North Carolina',
        'North Dakota',
        'Ohio',
        'Oklahoma',
        'Oregon',
        'Pennsylvania',
        'Rhode Island',
        'South Carolina',
        'South Dakota',
        'Tennessee',
        'Texas',
        'Utah',
        'Vermont',
        'Virginia',
        'Washington',
        'West Virginia',
        'Wisconsin',
        'Wyoming',
    ];
    // const location = 'USA';
    const obj = {};
    for (const state of states) {
        const stateLocal = state.toLowerCase();
        await delayLocal(3000);
        const y = await fetch(
            `https://www.instagram.com/api/v1/location_search/?search_query=${stateLocal}`,
            {
                credentials: 'include',
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:136.0) Gecko/20100101 Firefox/136.0',
                    Accept: '*/*',
                    'Accept-Language': 'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3',
                    'X-CSRFToken': '9DVYVztD6Gf0gM2oTsQpIWyufQdQqhar',
                    'X-IG-App-ID': '936619743392459',
                    'X-ASBD-ID': '359341',
                    'X-IG-WWW-Claim': 'hmac.AR3hQJqh3fB4v632gL2lSg0favobWpikvViI-ec85SilXyhG',
                    'X-Web-Session-ID': 'fc80rx:cceybh:lyrjrw',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Alt-Used': 'www.instagram.com',
                    'Sec-Fetch-Dest': 'empty',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Site': 'same-origin',
                },
                referrer: 'https://www.instagram.com/explore/astana',
                method: 'GET',
                mode: 'cors',
            },
        );
        const localObj = await y.json();

        obj[stateLocal] = localObj.venues;
        // break;
    }
    console.log(obj);
})();
