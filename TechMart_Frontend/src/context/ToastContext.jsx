import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = "info") => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const getToastIcon = (type) => {
        switch (type) {
            case "success": return "🟢";
            case "error": return "🔴";
            case "warning": return "🟡";
            case "info": return "🔵";
            default: return "🔵";
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="toast-container">
                {toasts.map(toast => (
                    <div 
                        key={toast.id} 
                        className={`toast toast-${toast.type}`}
                        onClick={() => removeToast(toast.id)}
                    >
                        <span className="toast-icon">{getToastIcon(toast.type)}</span>
                        <span className="toast-message">{toast.message}</span>
                        <button className="toast-close" onClick={(e) => {
                            e.stopPropagation();
                            removeToast(toast.id);
                        }}>×</button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within ToastProvider");
    return context;
}
