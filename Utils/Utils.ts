NB.Utils = {
    valWithoutRef: function (obj: any): any {
        try {
            return JSON.parse(JSON.stringify(obj));
        } catch (e) {
            return undefined;
        }
    },
    timeStampToDate: function (timestamp: number): { time: string, date: string } {
        const stampToDate = new Date(timestamp);
        // Time without the seconds
        const time = stampToDate.toLocaleTimeString(navigator.language, {hour: '2-digit', minute: '2-digit'});
        const date = stampToDate.toLocaleDateString();
        return {time, date};
    }
};