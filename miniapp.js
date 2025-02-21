// #region Telegram MiniApp Setup
const API_URL = "https://ssettimemanager.onrender.com";

window.onload = async function () {
	if (window.Telegram && Telegram.WebApp) {
		Telegram.WebApp.expand(); // Expand Mini App to fullscreen

		const initData = Telegram.WebApp.initData;
		if (!initData) {
			alert("Failed to retrieve Telegram user data.");
			return;
		}

		try {
			// Fetch user settings from FastAPI
			const response = await fetch(`${API_URL}/miniapp_profiles/${Telegram.WebApp.initDataUnsafe.user.id}?init_data=${encodeURIComponent(initData)}`, {
				method: "GET",
				headers: { "Content-Type": "application/json" },
			});

			if (!response.ok) {
				throw new Error("Failed to retrieve settings.");
			}

			const settings = await response.json();
			applySettingsToUI(settings);
		} catch (error) {
			console.error("Error fetching settings:", error);
			alert("Failed to load settings.");
		}
	}
};

// Function to apply settings to UI elements
function applySettingsToUI(settings) {
	document.getElementById("focus-input").value = settings.focus_duration / 60;
	document.getElementById("short-input").value = settings.short_break_duration / 60;
	document.getElementById("long-input").value = settings.long_break_duration / 60;
	document.getElementById("rounds-input").value = settings.long_break_gap;
	document.getElementById("audio-select").value = settings.audio_type;
	document.getElementById("volume-slider").value = settings.audio_volume;
	document.getElementById("theme-select").value = settings.theme;

	// Fixing theme accent color selection
	let activeColor = document.querySelector(`.color[data-color='${settings.theme_accent}']`);
	if (activeColor) {
		document.querySelectorAll(".color").forEach(el => el.removeAttribute("data-active"));
		activeColor.setAttribute("data-active", "true");
	}
}

// Function to save profile settings to FastAPI
async function saveSettings() {
	const initData = Telegram.WebApp.initData;
	if (!initData) {
		alert("Failed to retrieve Telegram user data.");
		return;
	}

	// Collect new settings from UI elements
	const newSettings = {
		user_id: Telegram.WebApp.initDataUnsafe.user.id,
		focus_duration: parseInt(document.getElementById("focus-input").value, 10) * 60,
		short_break_duration: parseInt(document.getElementById("short-input").value, 10) * 60,
		long_break_duration: parseInt(document.getElementById("long-input").value, 10) * 60,
		long_break_gap: parseInt(document.getElementById("rounds-input").value, 10),
		audio_type: document.getElementById("audio-select").value,
		audio_volume: parseInt(document.getElementById("volume-slider").value, 10),
		theme: document.getElementById("theme-select").value,
		theme_accent: document.querySelector(".color[data-active='true']")?.dataset.color || "lavender",
	};

	try {
		// Send updated settings to FastAPI
		const response = await fetch(`${API_URL}/miniapp_profiles/?init_data=${encodeURIComponent(initData)}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(newSettings),
		});

		const result = await response.json();
		if (response.ok) {
			alert("Settings saved successfully!");
		} else {
			alert("Failed to save settings: " + result.detail);
		}
	} catch (error) {
		console.error("Error saving settings:", error);
		alert("Error communicating with the server.");
	}
}

// Attach event listener to the settings close button
document.getElementById("menubtn").addEventListener("click", async () => {
	// Wait for the settings menu to close before saving
	setTimeout(saveSettings, 500);
});

// #endregion
