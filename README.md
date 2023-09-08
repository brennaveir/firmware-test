# Front-end Developer Skill Test

Thank you for your interest in the front-end developer position at Haverford Systems, Inc.

As a front end developer at Haverford Systems, Inc., you will be tasked with developing user interfaces for robotic cameras under our two brands: PTZOptics and HuddleCamHD.

## About

For this skill assessment, we ask you to develop a firmware updating function. Our cameras receive regular firmware updates which are posted to the cloud at:

    https://firmware.ptzoptics.com

Our cameras can reach out to the cloud to receive a firmware update through a HTTP GET request. Here is a sample cURL request for a firmware update:

    curl https://firmware.ptzoptics.com/F53.HI/RVU.json

Each camera’s firmware is hosted by its model number. In this case the model is: F53.HI

## RVU.json

RVU.json contains the following information:

    ``` json
    {
        "code": 200,
        "data": {
            "soc_version": "v2.0.39",
            "img_name": "VX630A_F53.HI_V2.0.39_24M_20230817.img",
            "log_name": "upgrade.log",
            "abstracts": "<ol><li>Click Apply to download the new firmware and a changelog</li><li>Expand the Advanced menu below to upgrade</li></ol>",
            "soc_md5": "110dc0a4f9c5ed72c6d950f99d81d82c"
        }
    }
    ```

- soc_version is the current firmware version.
- img_name is the filename of the firmware
- log_name shows the name of the changelog file
- soc_md5 is the md5 checksum for the img_name file

## Get Device Configuration

We can query the SOC version of the camera through a cgi-bin request at the camera’s IP address:

/cgi-bin/param.cgi?f=get_device_conf

This returns information like the following:

    ```
    devname="ptzoptics" 
    devtype="VX630A" 
    mirrors="https://firmware.ptzoptics.com/" 
    versioninfo="SOC v2.0.36 - ARM 6.0.30SHIS" 
    serial_num="s1i03210186" 
    device_model="F53.HI"
    ```

From this information, you can see that this device has the same device_model as that which we sent the cURL request: F53.HI

You can also see that this device is out of date. The versioninfo key contains an older SOC version: v2.0.36 vs v2.0.39

We need to upgrade this device.

## Upgrade Device

The firmware file is located in the hardware model folder. The soc_version is the filename:

    https://firmware.ptzoptics.com/F53.HI/VX630A_F53.HI_V2.0.39_24M_20230817.img 

The changelog is located in the device_model folder. The log_name is the filename:

    https://firmware.ptzoptics.com/F53.HI/upgrade.loghttps://firmware.ptzoptics.com/F53.HI/upgrade.log   

## The Test

For your skill assessment, you will emulate the firmware update function of a camera on a local web server. The steps are as follows:

1. Create a web page which will allow a user to query the firmware update server for firmware updates.
2. You will do this by sending a HTTP GET request for the RVU.json file. You will use device_model F53.HI.
3. After receipt of the RVU.json file, check the soc_version against the camera’s SOC version using: /cgi-bin/param.cgi?f=get_device_conf.
4. If the firmware is out of date (it is), prompt the user to download both the firmware and changelog.
5. The user should be prompted to upload the firmware within the form at the web server root.
6. The firmware upload takes about 10 seconds. There will be a JSON response from the server once the file uploads to the camera.
7. Once the firmware is uploaded, the user should be prompted to start the firmware update process.
8. There is an endpoint:/update. A GET request to /update will start the firmware update process. The firmware update process will take 30 seconds. The camera will send a response when the update completes.
9. The user should be informed about the progress of the firmware update. At the end of the update process, the user should be informed that the camera is updated and it will reboot momentarily. There is no need to simulate the reboot process.

## Requirements

Please clone this repository:

You will need to install rust to your computer. Instructions are available at this page: [Install Rust](https://www.rust-lang.org/tools/install)

Within the repository is a folder called “public”. Within this folder is: index.html file, main.js, and main.css

Please accomplish the task by editing the index.html, main.js, and main.css files. You may use whatever tools you want to edit these files. However, there should be no additional dependencies required to run the app.

Start the web server by typing:

    cargo run

at the root of the project. The webserver will be hosted at:

    http://localhost:3000/

Index.html is available at the project root. The following routes are available:

- GET /
- POST /
- GET /update
- GET /scripts/main.js
- GET /styles/main.css
- GET /cgi-bin/param.cgi?f=get_device_conf
