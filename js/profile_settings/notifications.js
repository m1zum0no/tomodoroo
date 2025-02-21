let notificationEnabled = true;
let notificationSilent = false;
let notification;
let notifSelect = document.getElementById("notif-select");

function setNotif(pomoNotif) {
	if (pomoNotif === "disabled") {
		notificationEnabled = false;
	} else if (pomoNotif === "silent") {
		notificationEnabled = true;
		notificationSilent = true;
	} else {
		notificationEnabled = true;
		notificationSilent = false;
	}

	notifSelect.value = pomoNotif;
}

if (localStorage.getItem("pomo-notif")) {
	setNotif(localStorage.getItem("pomo-notif"));
}

notifSelect.addEventListener("change", function () {
	setNotif(this.value);
	localStorage.setItem("pomo-notif", this.value);
});

function notify(title, message) {
	if (!notificationEnabled) return;
	if (!("Notification" in window)) {
		return;
	} else if (Notification.permission === "granted") {
		if (notification) notification.close();
		notification = new Notification(title, {
			body: message,
			icon: "./icons/icon192.png",
			silent: notificationSilent,
		});
	} else if (Notification.permission !== "denied") {
		Notification.requestPermission().then(function (permission) {
			if (permission === "granted") {
				notification = new Notification(title, {
					body: message,
					icon: "./icons/icon192.png",
					silent: notificationSilent,
				});
			}
		});
	}
}

function setup() {
	if ("Notification" in window) {
		if (Notification.permission !== "denied" && Notification.permission !== "granted") {
			Notification.requestPermission();
		}
	}

	setTime();
	roundnoDiv.innerText = roundInfo.focusNum + "/" + config.longGap;
}

setup();
