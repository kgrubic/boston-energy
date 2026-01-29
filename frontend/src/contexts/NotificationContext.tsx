import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type NotificationSeverity = "success" | "error";

type Notification = {
  id: string;
  message: string;
  severity: NotificationSeverity;
};

type NotifyInput = {
  message: string;
  severity: NotificationSeverity;
};

type NotificationContextValue = {
  notifications: Notification[];
  notify: (input: NotifyInput) => void;
  remove: (id: string) => void;
};

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined,
);

const generateId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const timeoutsRef = useRef<Map<string, number>>(new Map());

  const remove = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
    const timeoutId = timeoutsRef.current.get(id);
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const notify = useCallback(
    ({ message, severity }: NotifyInput) => {
      const id = generateId();
      setNotifications((prev) => [...prev, { id, message, severity }]);
      const timeoutId = window.setTimeout(() => remove(id), 5000);
      timeoutsRef.current.set(id, timeoutId);
    },
    [remove],
  );

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeoutsRef.current.clear();
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, notify, remove }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return ctx;
}
