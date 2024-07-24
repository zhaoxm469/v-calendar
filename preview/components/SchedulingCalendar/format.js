export const formatLessons = lessons => {
    const dateMaps = {};
    lessons.forEach(item => {
        const startDate = HT.Date.toString(new Date(item.startTime));
        if (!dateMaps[startDate]) {
            dateMaps[startDate] = {
                dates: startDate,
                customData: {
                    lessons: [],
                },
                key: item.lessonId,
            };
        }

        dateMaps[startDate].customData.lessons.push(item);
    });

    return Object.values(dateMaps);
};
