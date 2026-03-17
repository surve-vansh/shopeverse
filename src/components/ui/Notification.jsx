import { useUI } from "../../context/AppContext";

export default function Notification() {
  const { notification } = useUI();
  if (!notification) return null;

  const typeClass =
    notification.type === "info"    ? " info"  :
    notification.type === "warn"    ? " warn"  :
    notification.type === "error"   ? " error" : "";

  return (
    <div className={`sv-notif${typeClass}`}>
      {notification.msg}
    </div>
  );
}
