// Controlla se l'URL contiene 'articles' o 'pages'
if (window.location.pathname.startsWith('/articles/')) {
    // Estrai il nome dell'articolo dall'URL
    const articleName = window.location.pathname.split('/').pop().replace('.html', '');
    // Reindirizza a index.html passando il nome dell'articolo come parametro
    window.location.href = `index.html?article=${articleName}`;
} else if (window.location.pathname.startsWith('/pages/')) {
    // Estrai il nome della pagina dall'URL
    const pageName = window.location.pathname.split('/').pop().replace('.html', '');
    // Reindirizza a index.html passando il nome della pagina come parametro
    window.location.href = `index.html?pages=${pageName}`;
}