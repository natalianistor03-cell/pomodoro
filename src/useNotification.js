export function useNotification() {
    const requestPermission = async () => {
        if ("Notification" in window && Notification.permission === "default") {
            await Notification.requestPermission();
        }
    };

    const notify = (title, body) => {
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification(title, {
                body,
                icon: "https://emojicdn.elk.sh/🍅"
            });
        }
    };

    return { requestPermission, notify };
}