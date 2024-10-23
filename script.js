const articlesDiv = document.getElementById('articles');

// Funzione per caricare la home
async function loadHome() {
    try {
        const response = await fetch('home.md');
        if (!response.ok) throw new Error('File non trovato');
        const markdown = await response.text();
        const html = marked(markdown);
        
        // Mostra il contenuto della home
        articlesDiv.innerHTML = `<div class="article-content">${html}</div>`;
        
        // Aggiungi un gestore di eventi ai link
        attachLinkHandlers();
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
        history.pushState({ articleName }, '', articleName);
        
        // Mostra il contenuto dell'articolo
        articlesDiv.innerHTML = `<div class="article-content">${html}</div>`;
        
        // Aggiungi un gestore di eventi ai link
        attachLinkHandlers();
    } catch (error) {
        loadHome(); // Torna alla home in caso di errore
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
        
        // Aggiungi un gestore di eventi ai link
        attachLinkHandlers();
    } catch (error) {
        articlesDiv.innerHTML = `<div class="error">${error.message}</div>`;
    }
}

// Funzione per gestire i link
function attachLinkHandlers() {
    const links = articlesDiv.querySelectorAll('a');
    links.forEach(link => {
        if (link.href.endsWith('.html')) {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                loadArticle(link.getAttribute('href').split('/').pop());
            });
        } else if (link.href.endsWith('.md')) {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                loadMarkdown(link.getAttribute('href'));
            });
        }
    });
}

// Funzione per caricare un file Markdown
async function loadMarkdown(fileName) {
    try {
        const response = await fetch(fileName);
        if (!response.ok) throw new Error('File non trovato');
        const markdown = await response.text();
        const html = marked(markdown);
        
        // Mostra il contenuto del file Markdown
        articlesDiv.innerHTML = `<div class="article-content">${html}</div>`;
        
        // Aggiungi un gestore di eventi ai link
        attachLinkHandlers();
    } catch (error) {
        articlesDiv.innerHTML = `<div class="error">${error.message}</div>`;
    }
}

// Gestione del caricamento iniziale
window.onload = () => {
    const path = window.location.pathname;
    const match = path.match(/articles\/(.+)\.html/);
    if (match) {
        loadArticle(match[1]);
    } else {
        loadHome();
    }
};

// Carica la home al caricamento della pagina
loadHome();
