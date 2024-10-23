const articlesDiv = document.getElementById('articles');

// Funzione per caricare la pagina principale
async function loadHome() {
    try {
        const response = await fetch('home.md');
        if (!response.ok) throw new Error('File non trovato');
        const markdown = await response.text();
        const html = marked(markdown);

        // Mostra il contenuto della home
        articlesDiv.innerHTML = `<div class="article-content">${html}</div>`;

        // Aggiungi un gestore di eventi ai link
        const links = articlesDiv.querySelectorAll('a');
        links.forEach(link => {
            if (link.href.endsWith('.html')) {
                link.addEventListener('click', (event) => {
                    event.preventDefault(); // Impedisce il comportamento di default
                    loadArticle(link.getAttribute('href').split('/').pop()); // Carica l'articolo
                });
            }
        });
    } catch (error) {
        articlesDiv.innerHTML = `<div class="error">${error.message}</div>`;
    }
}

// Funzione per caricare un articolo
async function loadArticle(articleName) {
    try {
        const response = await fetch(`articles/${articleName.replace('.html', '.md')}`);
        if (!response.ok) throw new Error('File non trovato');
        const markdown = await response.text();
        const html = marked(markdown);

        // Modifica il permalink nella barra degli indirizzi
        history.pushState({ articleName }, '', articleName); // Mantiene l'estensione .html

        // Mostra il contenuto dell'articolo sotto l'intestazione
        articlesDiv.innerHTML = `<div class="article-content">${html}</div>`;
    } catch (error) {
        // Ricarica la home se c'è un errore
        loadHome();
    }
}

// Funzione per caricare la pagina dei contatti
async function loadContacts() {
    try {
        const response = await fetch('contatti.md');
        if (!response.ok) throw new Error('File non trovato');
        const markdown = await response.text();
        const html = marked(markdown);

        // Mostra il contenuto della pagina dei contatti
        articlesDiv.innerHTML = `<div class="article-content">${html}</div>`;
    } catch (error) {
        articlesDiv.innerHTML = `<div class="error">${error.message}</div>`;
    }
}

// Caricamento iniziale
window.onload = () => {
    const path = window.location.pathname;
    const match = path.match(/articles\/(.+)\.html/);
    if (match) {
        loadArticle(match[1]);
    } else {
        loadHome();
    }
};

// Gestione della navigazione
window.onpopstate = () => {
    loadHome(); // Ricarica la home quando si torna indietro
};

// Carica la home al caricamento della pagina
loadHome();
