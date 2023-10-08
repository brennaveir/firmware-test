const updateCheck = document.getElementById('update-check-btn');
const instructions = document.getElementById('instructions');
const downloadBtn = document.getElementById('download-btn');
const updateFirmware = document.getElementById('update-firmware-btn');
const uploadForm = document.getElementById('upload-form');
const progressBar = document.getElementById('myProgress');
const firmwareVersions = document.getElementById('firmware-versions');
const current = document.getElementById('current');
const device = document.getElementById('device');

//check for firmware update using device_model F53.HI
updateCheck.addEventListener('click', async () => {
    const updateURL = 'https://firmware.ptzoptics.com/F53.HI/RVU.json'

    try {
        const response = await fetch(updateURL);

        if (!response.ok) {
            throw new Error('Failed to fetch model info.');
        }

        const modelInfo = await response.json();
        checkCurrentVersion(modelInfo)
    } catch (error) {
        console.log("Error", error)
    }
});

const checkCurrentVersion = async (modelInfo) => {
    const currentVersion = modelInfo.data.soc_version;
// After receipt of the RVU.json file, check the soc_version against the camera’s SOC version using: /cgi-bin/param.cgi?f=get_device_conf.
    try {
        const response = await fetch('cgi-bin/param.cgi?f=get_device_conf');

        if (!response.ok) {
            throw new Error('Failed to fetch device info.');
        }
        const deviceInfo = await response.text();

        const versionInfoRegex = /versioninfo="[^"]*\s+v(\d+\.\d+\.\d+)/;
        const versionMatch = versionInfoRegex.exec(deviceInfo);

        if (versionMatch) {
            const deviceVersion = "v" + versionMatch[1];

            if (deviceVersion === currentVersion) {
                console.log('Device is up to date.');
                instructions.innerHTML = "Device is up to date";
            } else {
                console.log('Device needs an update.');
                // If the firmware is out of date (it is), prompt the user to download both the firmware and changelog.
                instructions.innerHTML = "Device needs an update. " + " Click Apply to download the new firmware and changelog";
                firmwareVersions.style.visibility = "visible";
                current.innerHTML = "Current firmware version: " + currentVersion;
                device.innerHTML = "Device firmware version: " + deviceVersion
                updateCheck.style.visibility = "hidden";
                downloadBtn.style.visibility = "visible";
                downloadBtn.addEventListener('click', getFirmwareAndChangelog)
            }
        } else {
            console.log('Version info not found!');
        }
    } catch (error) {
        console.log('Error fetching device info:', error);
    }
}

const getFirmwareAndChangelog = () => {
    //create anchor elements for firmware and changelog
    const firmware = document.createElement('a');
    firmware.href = "https://firmware.ptzoptics.com/F53.HI/VX630A_F53.HI_V2.0.39_24M_20230817.img";
    document.body.appendChild(firmware);
    firmware.click() //trigger click event

    //delay the second download to ensure the first one completes
    setTimeout(() => {
        const changelog = document.createElement('a');
        changelog.href = "https://firmware.ptzoptics.com/F53.HI/upgrade.log";
        document.body.appendChild(changelog);
        changelog.click()  //trigger click event
    }, 1000); //delay one second
    // The user should be prompted to upload the firmware within the upload-form at the web server root
    instructions.innerHTML = "Update PTZOptics Firmware"
    downloadBtn.style.visibility = "hidden"
    uploadForm.style.visibility = "visible"
}

// Send form data to server
const form = document.getElementById('upload-form');
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    updateFirmware.style.visibility = "hidden";
    progressBar.style.visibility = "visible";
    // The firmware upload takes 10 seconds.
    let i = 0;
    if (i == 0) {
        i = 1;
        const elem = document.getElementById("myBar");
        let width = 1;
        const duration = 10000; // 10 seconds in milliseconds
        const increment = (100 / (duration / 10)); // Calculate the increment value
        const id = setInterval(frame, 10);
        function frame() {
            if (width >= 100) {
                clearInterval(id);
                i = 0;
            } else {
                width += increment;
                elem.style.width = width + "%";
            }
        }
    }
    const formData = new FormData(form);
    const response = await fetch('/', {
        method: 'POST',
        body: formData
    });
    // There will be a JSON response from the server once the file uploads to the camera.
    const json = await response.json();
    console.log(JSON.stringify(json));
    uploadForm.style.visibility = "hidden"
    // Once the firmware is uploaded, the user should be prompted to start the firmware update process.
    instructions.innerHTML = "Firmware successfully uploaded. Update device firmware now"
    updateFirmware.style.visibility = "visible"
    progressBar.style.visibility = "visible";
});

updateFirmware.addEventListener('click', async () => {
    updateFirmware.style.visibility = "hidden";
    progressBar.style.visibility = "visible";
    //The user should be informed about the progress of the firmware update.
    let i = 0;
    if (i == 0) {
        i = 1;
        const elem = document.getElementById("myBar");
        let width = 1;
        const duration = 30000; // The firmware update process will take 30 seconds.
        const increment = (100 / (duration / 10)); 
        const id = setInterval(frame, 10);
        function frame() {
            if (width >= 100) {
                clearInterval(id);
                i = 0;
            } else {
                width += increment;
                elem.style.width = width + "%";
            }
        }
    }
    let timeLeft = 30;
    const timer = document.getElementById('timer')
    const timerInterval = setInterval(function () {
        if (timeLeft === 0) {
            timer.innerHTML = ""
            firmwareVersions.style.visibility = "hidden";
            progressBar.style.visibility = "hidden";
            // At the end of the update process, the user should be informed that the camera is updated and it will reboot momentarily. There is no need to simulate the reboot process.
            instructions.innerHTML = "The camera is updated and will reboot momentarily"
        } else {
            timer.innerHTML = timeLeft + " seconds left";
            timeLeft--;
        }
    }, 1000)
    try {
        // There is an endpoint: /update. A GET request to /update will start the firmware update process.
        const response = await fetch('/update')
        if (!response.ok) {
            throw new Error('Failed to fetch device info.');
        }
        //The camera will send a response when the update completes.
        const json = await response.json();
        console.log(JSON.stringify(json));
    } catch {
        console.log('Error fetching device info:', error);
    }
});



