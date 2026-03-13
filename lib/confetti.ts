import confetti from 'canvas-confetti'

export const fireConfetti = () => {
    confetti({
        particleCount: 300,
        spread: 120,
        startVelocity: 45,
        gravity: 0.8,
        ticks: 200,
        origin: { x: 0.5, y: 0.5 },
    })
}