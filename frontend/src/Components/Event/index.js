import React, { useEffect } from "react";
import { Button } from "../Form";
import { Box } from "../Box";
import { faBell, faBellSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { EventContext } from "../../contexts";
import { Modal } from "../Modal";
import styled from "styled-components";

import iconFile from "./notification-icon.png";
import notificationAlarm from "./notification.mp3";
import inviteAlarm from "./invite.mp3";

const H3 = styled.h3`
  font-size: 1.5em;
  padding-bottom: 10px;
`;

const FireNotificationApi = ({ title, body }) => {
  const Fire = ({ title, body }) =>
    new Notification(title ?? "The Outuni Project", {
      body: body,
      icon: iconFile,
      tag: body,
      renotify: true,
      timestamp: Math.floor(Date.now()),
    });

  if (!("Notification" in window)) {
    // Check if the browser supports notifications
    alert("This browser does not support desktop notification");
  } else if (Notification.permission === "granted") {
    Fire({ title, body });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      // If the user accepts, let's create a notification
      Fire({ title, body });
    });
  }
};

const handleNotification = (event) => {
  let data = JSON.parse(event?.data);
  if (!data) return;

  FireNotificationApi({
    title: data?.title,
    body: data.message,
  });
};

const storageKey = "notification_settings";

const BrowserNotification = () => {
  const eventContext = React.useContext(EventContext);
  const [notification, setNotification] = React.useState(false);
  const [settings, setSettings] = React.useState(() => {
    // Load in the previous notification settings from Local Storage
    if (window.localStorage && window.localStorage.getItem(storageKey)) {
      return JSON.parse(window.localStorage.getItem(storageKey));
    }
    return {};
  });

  const handleSettingsChange = () => {
    let previousSetting = settings.audio_alarm;
    if (!previousSetting) {
      setNotification({
        body: "Audio notifications have been enabled.",
        sound: notificationAlarm,
      });
    }
    setSettings({ ...settings, audio_alarm: !settings.audio_alarm });
  };

  const handleMessage = React.useCallback(
    (event) => {
      let title = null,
        body = event.data;
      try {
        let n = JSON.parse(event.data);
        title = n.title ?? null;
        body = n.message;

        FireNotificationApi({ title, body });
      } catch (e) {
        FireNotificationApi({ body });
      }

      console.log(`title`, title ?? "nou");

      if (settings.audio_alarm) {
        let is_fleet_invite = event?.data.includes("has invited your");

        if (!title) {
          title = is_fleet_invite ? "Fleet Invite Received" : null;
        }

        setNotification({
          title,
          body,
          sound: is_fleet_invite ? inviteAlarm : notificationAlarm,
        });
      }
    },
    [settings]
  );

  useEffect(() => {
    // When the button is clicked, update settings in Local Storage
    if (window.localStorage) {
      window.localStorage.setItem(storageKey, JSON.stringify(settings));
    }
  }, [settings]);

  useEffect(() => {
    if (!eventContext) {
      return;
    }

    eventContext.addEventListener("message", handleMessage);
    eventContext.addEventListener("notification", handleNotification);
    return () => {
      eventContext.removeEventListener("message", handleMessage);
      eventContext.removeEventListener("notification", handleNotification);
    };
  }, [eventContext]);

  if (notification?.sound) {
    new Audio(notification.sound).play();
  }

  return (
    <>
      <Modal open={!!notification} setOpen={() => setNotification(null)}>
        <Box style={{ minHeight: "unset" }}>
          {notification?.title && <H3>{notification.title}</H3>}

          <p style={{ paddingBottom: "25px" }}>{notification?.body}</p>
          <Button variant="primary" onClick={() => setNotification(null)}>
            Close
          </Button>
        </Box>
      </Modal>
      <Button
        title={
          settings.audio_alarm ? "Click to disable audio alarms" : "Click to enable audio alarms"
        }
        onClick={handleSettingsChange}
      >
        <FontAwesomeIcon fixedWidth icon={settings.audio_alarm ? faBell : faBellSlash} />
      </Button>
    </>
  );
};

// Chrome now blocks sound from running unless it ran
// in an active tab. Once this happens it can run without focus
const PreloadNotification = () => {
  let permission = false;
  if (window.localStorage && window.localStorage.getItem(storageKey)) {
    permission = JSON.parse(window.localStorage.getItem(storageKey));
  }

  if (permission) {
    let audio = new Audio(notificationAlarm);
    audio.volume = 0.1;
    audio.play();
    console.log('Audio alert preloaded...');
  }
}

export default BrowserNotification;
export { PreloadNotification }
