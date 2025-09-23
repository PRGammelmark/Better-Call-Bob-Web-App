// hilsener.js

// Hilsener opdelt efter tidsperiode
const hilsener = {
    morgen: [
      "Godmorgen {navn} ☀️☕️",
      "Godmorgen, håber du får en dejlig dag 🌸",
      "Hej {navn} – klar til en ny dag? 💪",
      "Morgen, {navn}! Tid til at shine 🌞",
      "Godmorgen! Lad os gi' den gas i dag 🚀",
      "Godmorgen {navn}. Lad os gøre dagen værdifuld 🌟"
    ],
    formiddag: [
      "Hej {navn} 👋🌻",
      "Fortsat god formiddag, {navn} 🌼",
      "Hej! Håber din dag går godt indtil nu 🤗",
      "Lige en lille hilsen her i formiddag ☀️",
      "Tak for indsatsen {navn} – du gør det godt 💪",
      "High-five til dig, {navn}! 🤝"
    ],
    eftermiddag: [
      "God eftermiddag, {navn} 🎶",
      "Hej {navn} – håber dagen går godt 🌅",
      "En lille pause passer perfekt nu ☕️",
      "God eftermiddag! Klar på sidste stræk? 🔥",
      "{navn}, husk at trække vejret og nyde eftermiddagen 🌿",
    ],
    aften: [
      "Nyd din aften, {navn} 🍷",
      "Godaften, {navn} 🌙",
      "Ha’ en rolig og dejlig aften ✨",
      "Aftenen er din – hyg dig, {navn} 🕯️",
      "Tak for i dag, {navn} 🙏 sov godt senere 🌌",
    ],
  };
  
  // Funktion til at finde periode ud fra timen
  function getPeriode(hour = new Date().getHours()) {
    if (hour >= 5 && hour < 10) return "morgen";
    if (hour >= 10 && hour < 14) return "formiddag";
    if (hour >= 14 && hour < 18) return "eftermiddag";
    return "aften";
  }
  
  // Funktion til at hente en fast hilsen pr. dag
  export function getHilsen(navn = "Patrick") {
    const periode = getPeriode();
    const liste = hilsener[periode];
  
    // Brug dato (dag i måneden) som seed
    const dayOfMonth = new Date().getDate(); // 1-31
    const index = dayOfMonth % liste.length;
  
    return liste[index].replace("{navn}", navn);
  }
  