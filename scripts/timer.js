//#region Time

export function setTime() {
	let seconds = config[roundInfo.current] - roundInfo.t;
	if (seconds < 0) {
		nextRound();
		return;
	}
	let timestr =
		Math.floor(seconds / 60)
			.toString()
			.padStart(2, "0") +
		":" +
		(seconds % 60).toString().padStart(2, "0");
	timediv.innerText = timestr;
	document.title = `${timestr} ${fullname[roundInfo.current]} - Tomodoro`;
	progress.style.strokeDashoffset = (roundInfo.t / config[roundInfo.current]) * 100;
	if (pipActive) loop();
}

timerWorker.addEventListener("message", (e) => {
	roundInfo.t = e.data.t;
	setTime();
	if (!e.data.running) {
		timer.style.setProperty("--progress", "0");
		nextRound();
	}
});

//#endregion

//#region Timer Actions

function nextRound() {
	let finished = fullname[roundInfo.current];
	let body = "Begin ";
	if (roundInfo.current === "focus") {
		if (audioType === "noise") {
			fadeOut();
		}
		focusEnd(roundInfo.t);
		finished += " Round";
		if (roundInfo.focusNum >= config.longGap) {
			roundInfo.current = "long";
			roundInfo.focusNum = 0;
		} else {
			roundInfo.current = "short";
		}
		body += "a " + Math.floor(config[roundInfo.current] / 60) + " minute " + fullname[roundInfo.current];
	} else {
		roundInfo.current = "focus";
		roundInfo.focusNum++;
		roundnoDiv.innerText = roundInfo.focusNum + "/" + config.longGap;
		body += "focusing for " + Math.floor(config.focus / 60) + " minutes";
	}

	timer.className = "t-" + roundInfo.current;
	roundInfo.t = 0;
	setTime();
	if (roundInfo.running) {
		if (roundInfo.current === "focus" && audioType === "noise") {
			fadeIn();
		}
		timerWorker.postMessage({
			type: "start",
			maxDuration: config[roundInfo.current],
		});
	}
	notify(`${finished} Complete`, body);
}

function pauseplay() {
	if (roundInfo.current === "none") {
		nextRound();
		pauseplaybtn.className = "playing";
		return;
	}
	if (roundInfo.running) {
		if (roundInfo.current === "focus" && audioType === "noise") {
			fadeOut();
		}
		timerWorker.postMessage({ type: "stop" });
		roundInfo.running = false;
		pauseplaybtn.title = "Start Timer";
		pauseplaybtn.className = "paused";
	} else {
		if (roundInfo.current === "focus" && audioType === "noise") {
			fadeIn();
		}
		timerWorker.postMessage({
			type: "start",
			t: roundInfo.t,
			maxDuration: config[roundInfo.current],
		});
		roundInfo.running = true;
		pauseplaybtn.title = "Pause Timer";
		pauseplaybtn.className = "playing";
	}
}

pauseplaybtn.addEventListener("click", pauseplay);

nextbtn.addEventListener("click", () => {
	nextRound();
});

document.getElementById("resetround").addEventListener("click", () => {
	if (roundInfo.running) pauseplay();
	roundInfo.t = 0;
	setTime();
});

document.addEventListener("keydown", (event) => {
	if (event.isComposing || event.keyCode === 229) {
		return;
	}
	if (event.code === "Space") {
		if (document.activeElement === pauseplaybtn || viewState !== "timer") {
			return;
		}
		pauseplaybtn.focus();
		pauseplay();
	}
});

//#endregion
