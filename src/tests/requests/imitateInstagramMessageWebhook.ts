const imitateInstagramMessageWebhook = async () => {
    await fetch('http://localhost:8080/webhooks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            object: 'instagram',
            entry: [
                {
                    time: 1746733494047,
                    id: '17841446175745525',
                    messaging: [
                        {
                            sender: {id: '1061663829064401'},
                            recipient: {id: '17841446175745525'},
                            timestamp: 1746733493736,
                            message: {
                                mid: 'aWdfZAG1faXRlbToxOklHTWVzc2FnZAUlEOjE3ODQxNDQ2MTc1NzQ1NTI1OjM0MDI4MjM2Njg0MTcxMDMwMTI0NDI1ODY3MDg3OTcwNTU1NDA4NDozMjIyMTU0NTcyMzkyOTM3MTI0Njg3NzAxNjU3OTg5OTM5MgZDZD',
                                attachments: [
                                    {
                                        type: 'ig_reel',
                                        payload: {
                                            reel_video_id: '18505223905024634',
                                            title: 'Александр Блок Dj Блокnote с хитом музыкальных площадок “Ночь, Улица, Фонарь, Аптека»\n\n#ночьулицафонарь #блок #а#поэзия #стихи #стихотворение',
                                            url: 'https://lookaside.fbsbx.com/ig_messaging_cdn/?asset_id=18505223905024634&signature=AYcViQ4KTEUrirOUOulqLQuSFm0JqY1soNJHjmpNid_LvXteSFlgiH2RgUx-VkLwgGC4NIgk9-QaTztuQDmQARnyfYKDUtpnSCq-5eHB9JcEK9qV5W2ZEuReCXyNZryxNpf0QoS4L10smQgdRImJyw2lonlq4k0V5pzSeR7-sMZrW8fMXtlEGLkfycv95sujWv3mbGMX36_RUW0A_CoMqxI7QCqX96L1',
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                },
            ],
        }),
    });
};

imitateInstagramMessageWebhook();
