console.log("Redirect script started");

// Controlla se non siamo già sulla pagina index.html
if (window.location.pathname !== '/index.html') {
    const pathParts = window.location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];

    // Se è un articolo, reindirizza a index.html con il parametro
    if (lastPart.startsWith('articles/') && lastPart.endsWith('.html')) {
        const articleName = lastPart.replace('.html', '');
        window.location.href = `index.html?article=${articleName}`;
    } else if (lastPart.startsWith('pages/') && lastPart.endsWith('.html')) {
        const pageName = lastPart.replace('.html', '');
        window.location.href = `index.html?pages=${pageName}`;
    } else {
        // Altrimenti reindirizza a index.html
        window.location.href = 'index.html';
    }
}