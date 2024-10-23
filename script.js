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
            if (link.href.startsWith('#')) {
                link.addEventListener('click', (event) => {
                    event.preventDefault(); // Impedisce il comportamento di default
                    loadArticle(link.getAttribute('href').substring(1)); // Carica l'articolo
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
        const response = await fetch(`articles/${articleName}.md`);
        if (!response.ok) throw new Error('File non trovato');
        const markdown = await response.text();
        
        const html = marked(markdown);

        // Modifica il permalink nella barra degli indirizzi
        history.pushState({ articleName }, '', `#${articleName}`); // Utilizza hash

        // Mostra il contenuto dell'articolo sotto l'intestazione
        articlesDiv.innerHTML = `<div class="article-content">${html}</div>`;
    } catch (error) {
        articlesDiv.innerHTML = `<div class="error">${error.message}</div>`;
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

// Gestione del pulsante "indietro" del browser
window.onpopstate = (event) => {
    if (event.state && event.state.articleName) {
        loadArticle(event.state.articleName);
    } else if (event.state && event.state.page === 'contacts') {
        loadContacts();
    }
};

// Carica la home al caricamento della pagina
loadHome();
