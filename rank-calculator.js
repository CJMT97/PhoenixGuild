document.getElementById('calcBtn').addEventListener('click', calculateRank);

function calculateRank() {
    const pushups = parseFloat(document.getElementById('pushups').value) || 0;
    const situps = parseFloat(document.getElementById('situps').value) || 0;
    const plank = parseFloat(document.getElementById('plank').value) || 0;

    // Convert to percentages of goal
    const pushupPercent = (pushups / 1000) * 100;
    const situpPercent = (situps / 1000) * 100;
    const plankPercent = (plank / 10) * 100;

    // Rating = lowest value
    const rating = Math.min(pushupPercent, situpPercent, plankPercent);

    // Determine rank & buff
    let rank = "E-Rank";
    let multiplier = 1.0;

    if (rating >= 90) { rank = "S-Rank"; multiplier = 1.75; }
    else if (rating >= 80) { rank = "A-Rank"; multiplier = 1.5; }
    else if (rating >= 70) { rank = "B-Rank"; multiplier = 1.25; }
    else if (rating >= 50) { rank = "C-Rank"; multiplier = 1.15; }
    else if (rating >= 25) { rank = "D-Rank"; multiplier = 1.05; }

    document.getElementById('result').innerHTML =
        `Your rating is <span>${rating.toFixed(1)}</span>.<br>
        You are in <span>${rank}</span> with a <span>${multiplier}x</span> buff to Daily Challenge Points.`;
}
