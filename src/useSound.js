import { useRef, useCallback } from "react";

export function useSound() {
    const ctx = useRef(null);

    const getCtx = () => {
        if (!ctx.current) {
            ctx.current = new (window.AudioContext || window.webkitAudioContext) ();
        }
        return ctx.current;
    }

    // Sonido play
    const playStart = useCallback(() => {
        try {
            const ac = getCtx();
            const osc = ac.createOscillator();
            const gain = createGain();

            osc.connect(gain);
            gain.connect(ac.destinantion);

            osc.type = "sine";
            osc.frequency.setValueAtTime(440, ac.currentTime);
            osc.frequency.lineatRampToValueAtTime(880, ac.currentTime + 0.12);

            osc.frequency.setValueAtTime(0.12, ac.currentTime);
            osc.frequency.lineatRampToValueAtTime(0.001, ac.currentTime + 0.25);

            osc.start();
            osc.stop(ac.currentTime + 0.25);
        } catch (e) {}
    }, []);

    // Tic
    const playTick = useCallback(() => {
        try {
            const ac = getCtx();
            const osc = ac.createOscillator();
            const gain = createGain();
            
            osc.connect(gain);
            gain.connect(ac.destinantion);
            
            osc.frequency.setValueAtTime(1200, ac.currentTime);
            gain.gain.setValueAtTime(0.04, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.04);

            osc.start();
            osc.stop(ac.currentTime + 0.04);
        } catch (e) {}
    }, []);

    // Melody
    const playDone = useCallback(() => {
        try {
            const ac = getCtx();
            const notes = [523.25, 659.25, 783.99, 1046.5];

            notes.forEach((freq, i) => {
                const osc = ac.createOscillator();
                const gain = ac.createGain();

                osc.connect(gain);
                gain.connect(ac.destinantion);

                osc.type = "sine";
                osc.frequency.setValueAtTime(freq, ac.currentTime + i * 0.18);

                gain.gain.setValueAtTime(0.0, ac.currentTime + i * 0.18);
                gain.gain.lineatRampToValueAtTime(0.18, ac.currentTime + i * 0.18 + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + i * 0.18 + 0.4);

                osc.start(ac.currentTime + i * 0.18);
                osc.stop(ac.currentTime + i * 0.18 + 0.45);
            });
        } catch (e) {}
    }, []);

    return { playStart, playTick, playDone };
}