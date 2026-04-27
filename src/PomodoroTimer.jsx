// src/PomodoroTimer.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useSound } from "./useSound";
import { useNotification } from "./useNotification";
import Ring from "./Ring";

const MODES = {
    work: { label: "Foco", duration: 25 * 60, color: "#E8D5B7" },
    short: { label: "Descanso", duration: 5 * 60, color: "#A8C5A0" },
    long: { label: "Descanso largo", duration: 15 * 60, color: "#A0B5C5" },
};

function fmt(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function PomodoroTimer() {
    const [mode, setMode] = useState("work");
    const [timeLeft, setTimeLeft] = useState(MODES.work.duration);
    const [running, setRunning] = useState(false);
    const [soundOn, setSoundOn] = useState(true);
    const [history, setHistory] = useState([]);

    // Sesiones persistidas en localStorage
    const [sessions, setSessions] = useState(() => {
        return parseInt(localStorage.getItem("pomodoro-sessions") || "0");
    });

    const intervalRef = useRef(null);
    const { playStart, playTick, playDone } = useSound();
    const { requestPermission, notify } = useNotification();

    const total = MODES[mode].duration;
    const color = MODES[mode].color;
    const progress = (total - timeLeft) / total;

    // Pedir permiso de notificaciones al montar
    useEffect(() => {
        requestPermission();
    }, []);

    // Guardar sesiones en localStorage cada vez que cambian
    useEffect(() => {
        localStorage.setItem("pomodoro-sessions", sessions);
    }, [sessions]);

    // Cambia de modo y reinicia
    const switchMode = useCallback((m) => {
        setRunning(false);
        clearInterval(intervalRef.current);
        setMode(m);
        setTimeLeft(MODES[m].duration);
    }, []);

    // Lógica del temporizador
    useEffect(() => {
        if (running) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((t) => {
                    if (t <= 1) {
                        clearInterval(intervalRef.current);
                        setRunning(false);
                        if (soundOn) playDone();
                        if (mode === "work") {
                            setSessions((s) => s + 1);
                            setHistory((h) => [
                                {
                                    id: Date.now(),
                                    hora: new Date().toLocaleTimeString("es-ES", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    }),
                                },
                                ...h.slice(0, 4),
                            ]);
                            notify("¡Sesión completada! 🍅", "Tómate un descanso bien merecido.");
                        } else {
                            notify("¡Descanso terminado!", "Vuelve al foco.");
                        }
                        return 0;
                    }
                    if (soundOn && t % 60 === 0 && t !== total) playTick();
                    return t - 1;
                });
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [running, soundOn, mode, total, playTick, playDone]);

    const toggle = () => {
        if (!running && soundOn) playStart();
        setRunning((r) => !r);
    };

    const reset = () => {
        setRunning(false);
        setTimeLeft(MODES[mode].duration);
    };

    const resetSessions = () => {
        setSessions(0);
        setHistory([]);
    };

    return (
        <div style={{
            minHeight: "100vh",
            background: "#0E0E0F",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'DM Mono', monospace",
            color: "#E8E6E1",
            padding: "2rem 1rem",
        }}>

            {/* Título */}
            <p style={{
                fontSize: "11px",
                letterSpacing: "0.25em",
                color: "rgba(255,255,255,0.3)",
                textTransform: "uppercase",
                marginBottom: "2rem",
            }}>
                Temporizador Pomodoro
            </p>

            {/* Selector de modo */}
            <div style={{
                display: "flex",
                gap: "6px",
                marginBottom: "3rem",
                background: "rgba(255,255,255,0.04)",
                borderRadius: "12px",
                padding: "4px",
            }}>
                {Object.entries(MODES).map(([key, val]) => (
                    <button key={key} onClick={() => switchMode(key)} style={{
                        background: mode === key ? "rgba(255,255,255,0.09)" : "transparent",
                        border: "none",
                        borderRadius: "8px",
                        color: mode === key ? color : "rgba(255,255,255,0.35)",
                        fontSize: "12px",
                        padding: "6px 14px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                    }}>
                        {val.label}
                    </button>
                ))}
            </div>

            {/* Anillo con tiempo encima */}
            <div style={{ position: "relative", width: 280, height: 280, marginBottom: "2.5rem" }}>
                <Ring progress={progress} color={color} size={280} />

                <div style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                }}>
                    <div style={{
                        fontSize: "58px",
                        fontWeight: 300,
                        letterSpacing: "-2px",
                        lineHeight: 1,
                        color: "#F5F3EF",
                    }}>
                        {fmt(timeLeft)}
                    </div>
                    <div style={{
                        fontSize: "11px",
                        color,
                        marginTop: "10px",
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                    }}>
                        {MODES[mode].label}
                    </div>
                </div>
            </div>

            {/* Botones */}
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "2rem" }}>
                <button onClick={reset} style={{
                    background: "transparent",
                    border: "0.5px solid rgba(255,255,255,0.12)",
                    borderRadius: "50%",
                    width: 42, height: 42,
                    color: "rgba(255,255,255,0.4)",
                    cursor: "pointer",
                    fontSize: "16px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>↺</button>

                <button onClick={toggle} style={{
                    background: running ? "rgba(255,255,255,0.08)" : color,
                    border: "none",
                    borderRadius: "50%",
                    width: 72, height: 72,
                    color: running ? color : "#0E0E0F",
                    cursor: "pointer",
                    fontSize: "22px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.25s",
                }}>
                    {running ? "⏸" : "▶"}
                </button>

                <button onClick={() => setSoundOn((s) => !s)} style={{
                    background: "transparent",
                    border: "0.5px solid rgba(255,255,255,0.12)",
                    borderRadius: "50%",
                    width: 42, height: 42,
                    color: soundOn ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.15)",
                    cursor: "pointer",
                    fontSize: "15px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    {soundOn ? "♪" : "✕"}
                </button>
            </div>

            {/* Puntos de sesión */}
            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "0.5rem" }}>
                {[0, 1, 2, 3].map((i) => (
                    <div key={i} style={{
                        width: 8, height: 8,
                        borderRadius: "50%",
                        background: i < (sessions % 4) ? color : "rgba(255,255,255,0.1)",
                        transition: "background 0.4s",
                    }} />
                ))}
                <span style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.25)",
                    marginLeft: "8px",
                }}>
                    {sessions} sesión{sessions !== 1 ? "es" : ""}
                </span>
            </div>

            {/* Botón resetear sesiones */}
            {sessions > 0 && (
                <button onClick={resetSessions} style={{
                    background: "transparent",
                    border: "none",
                    color: "rgba(255,255,255,0.15)",
                    fontSize: "11px",
                    cursor: "pointer",
                    marginBottom: "1rem",
                    fontFamily: "'DM Mono', monospace",
                    letterSpacing: "0.05em",
                }}>
                    resetear sesiones
                </button>
            )}

            {/* Historial */}
            {history.length > 0 && (
                <div style={{ marginTop: "1rem", width: "100%", maxWidth: 300 }}>
                    <p style={{
                        fontSize: "10px",
                        letterSpacing: "0.2em",
                        color: "rgba(255,255,255,0.2)",
                        textTransform: "uppercase",
                        marginBottom: "10px",
                    }}>
                        Historial
                    </p>
                    {history.map((h, i) => (
                        <div key={h.id} style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "8px 0",
                            borderBottom: "0.5px solid rgba(255,255,255,0.05)",
                            fontSize: "12px",
                            color: "rgba(255,255,255,0.3)",
                        }}>
                            <span>Sesión #{sessions - i}</span>
                            <span>{h.hora}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div style={{
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "1rem",
                textAlign: "center",
                fontSize: "11px",
                color: "rgba(255,255,255,0.15)",
                letterSpacing: "0.12em",
                fontFamily: "'DM Mono', monospace",
            }}>
                Desarrollado por <span style={{ color: "rgba(255, 126, 39, 0.62)" }}>ꋊ — 2026 ©</span>
            </div>
        </div>
    );
}