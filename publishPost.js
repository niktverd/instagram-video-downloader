require('dotenv').config();

// const IG_ID = process.env.IG_ID;
const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

// // Add this delay function
// const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function createInstagramPostContainer({imageUrl, caption, videoUrl}) {
    if (!accessToken) {
        return;
    }

    const postData = {caption, access_token: accessToken};

    if (videoUrl) {
        postData.media_type = 'REELS',
        postData.video_url = videoUrl;
    } else if (imageUrl) {
        postData.image_url = imageUrl;
    } else {
        return;
    }
    console.log({postData});
    
    try {
        const createMediaResponse = await fetch(
            `https://graph.instagram.com/v21.0/me/media`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData),
            }
        );

        const createMediaResponseJson = await createMediaResponse.json();
        console.log({createMediaResponseJson});

        const mediaId = createMediaResponseJson.id;

        return {
            success: true,
            mediaId,
        };

    } catch (error) {
        console.error(error);
        return {
            success: false,
            error: error.response?.data || error.message
        };
    }
}

async function publishInstagramPostContainer({containerId}) {
    if (!accessToken || !containerId) {
        return;
    }
    
    try {
        // const statusResponse = await fetch(`https://graph.instagram.com/v21.0/${containerId}?fields=copyright_check_status&access_token=${accessToken}`);
        const statusResponse = await fetch(`https://graph.instagram.com/v21.0/${containerId}?fields=status_code,status&access_token=${accessToken}`);

        const statusResponseJson = await statusResponse.json();
        console.log({statusResponseJson});

        if (statusResponseJson.status_code !== 'FINISHED') {
            return;
        }

        console.log('after if');

        // Then publish the container
        const publishResponse = await fetch(
            `https://graph.instagram.com/v21.0/me/media_publish`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    creation_id: containerId,
                    access_token: accessToken
                }),
            }
        );

        const publishResponseJson = await publishResponse.json();
        console.log({publishResponseJson});
        return {
            success: true,
            postId: publishResponseJson.id
        };

    } catch (error) {
        console.error(error);
        return {
            success: false,
            error: error.response?.data || error.message
        };
    }
}

module.exports = { createInstagramPostContainer, publishInstagramPostContainer };

// createInstagramPostContainer({
//     caption: 'Caption text',
//     videoUrl: 'https://firebasestorage.googleapis.com/v0/b/hullaballoo-ddd3f.appspot.com/o/i%2FAQPQ8w0uB3bAsNP2jn5fg7CBuVjFoBybBZOjF1C-PHxXiw3uUuqSwTnyNs65UAV_Gyb-t2MjZPNrpFTAd1hjY1-EUQp8CawdFG4i-II.mp4?alt=media&token=38aa5d83-a304-478b-9766-52dd0790fa67',
// });

publishInstagramPostContainer({containerId: '17897253174124297'});
// publishInstagramPostContainer({containerId: '17999319563723384'});
// publishInstagramPostContainer({containerId: '17940862262822683'});
