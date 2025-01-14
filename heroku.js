const appName = process.env.HEROKU_APP_NAME;
const herokuApiKey = process.env.HEROKU_API_KEY;

async function stopHerokuApp() {
    if (!appName || !herokuApiKey) {
        return;
    }

    const startUrl = `https://api.heroku.com/apps/${appName}/formation/web`;
    await fetch(
        startUrl,
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${herokuApiKey}`,
                Accept: 'application/vnd.heroku+json; version=3',
            },
            body: JSON.stringify({
                quantity: 0,
                size: 'basic',
            }),
        },
    );
}

module.exports = {stopHerokuApp};