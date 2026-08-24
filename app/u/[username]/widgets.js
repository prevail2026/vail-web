"use client";

import { useEffect, useState } from "react";
import styles from "./widgets.module.css";

export function GithubWidget({ username }) {
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/widgets/github/${username}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => !cancelled && setData(d))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [username]);

  if (failed || !data) return null;

  return (
    <a className={styles.widget} href={data.html_url} target="_blank" rel="noopener noreferrer">
      <img className={styles.githubAvatar} src={data.avatar_url} alt="" />
      <div className={styles.widgetBody}>
        <div className={styles.widgetTitle}>{data.name || data.login}</div>
        <div className={styles.widgetSub}>
          {data.followers.toLocaleString()} followers · {data.following.toLocaleString()} following ·{" "}
          {data.public_repos.toLocaleString()} repos
        </div>
      </div>
    </a>
  );
}

function formatTime(ms) {
  if (typeof ms !== "number") return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function SpotifyWidget({ username }) {
  const [track, setTrack] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    function poll() {
      fetch(`/api/widgets/spotify/${username}`)
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d) => !cancelled && setTrack(d))
        .catch(() => !cancelled && setFailed(true));
    }
    poll();
    const id = setInterval(poll, 20000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [username]);

  if (failed || !track) return null;

  const pct = track.duration_ms ? Math.min(100, (track.progress_ms / track.duration_ms) * 100) : 0;

  return (
    <a className={styles.widget} href={track.track_url || "#"} target="_blank" rel="noopener noreferrer">
      {track.cover && <img className={styles.cover} src={track.cover} alt="" />}
      <div className={styles.widgetBody}>
        <div className={styles.widgetTitle}>{track.title}</div>
        <div className={styles.widgetSub}>{track.artist}</div>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${pct}%` }} />
        </div>
        <div className={styles.progressTimes}>
          <span>{formatTime(track.progress_ms)}</span>
          <span>{track.is_playing ? "Now playing" : "Paused"}</span>
          <span>{formatTime(track.duration_ms)}</span>
        </div>
      </div>
    </a>
  );
}

const WIDGET_COMPONENTS = { github: GithubWidget, spotify: SpotifyWidget };

export function ProfileWidgets({ username, enabled }) {
  if (!Array.isArray(enabled) || enabled.length === 0) return null;
  return (
    <div className={styles.stack}>
      {enabled.map((id) => {
        const Widget = WIDGET_COMPONENTS[id];
        return Widget ? <Widget key={id} username={username} /> : null;
      })}
    </div>
  );
}
