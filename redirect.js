console.log("Redirect script started");

// Controlla se non siamo già sulla pagina index.html
if (window.location.pathname !== '/index.html') {
    // Forza il caricamento della index
    window.location.href = 'index.html';
}
