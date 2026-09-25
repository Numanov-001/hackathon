import { useEffect, useRef, useState } from "react";

export function useLiveFeed(onEvent) {
  const [events, setEvents] = useState([]);
  const [live, setLive] = useState(false);
  const handler = useRef(onEvent);
  handler.current = onEvent;

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const url = import.meta.env.DEV
      ? "ws://127.0.0.1:8000/ws/market"
      : `${protocol}://${window.location.host}/ws/market`;
    const socket = new WebSocket(url);
    socket.onopen = () => setLive(true);
    socket.onclose = () => setLive(false);
    socket.onerror = () => setLive(false);
    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      setEvents((current) => [payload, ...current].slice(0, 40));
      handler.current?.(payload);
    };
    return () => socket.close();
  }, []);

  return { events, live };
}
