const articlesDiv = document.getElementById('articles');

// Funzione per caricare la home
async function loadHome() {
    try {
        const response = await fetch('home.md');
        if (!response.ok) throw new Error('File non trovato');
        const markdown = await response.text();
        const html = marked(markdown);
        articlesDiv.innerHTML = `<div class="article-content">${html}</div>`;
        window.scrollTo(0, 0);
    } catch (error) {
        articlesDiv.innerHTML = `<div class="error">${error.message}</div>`;
    }
}

// Funzione per caricare un articolo
async function loadArticle(articleName) {
    try {
        const response = await fetch(`/articles/${articleName.replace('.html', '.md')}`);
        if (!response.ok) throw new Error('File non trovato');
        const markdown = await response.text();
        const html = marked(markdown);
        articlesDiv.innerHTML = `<div class="article-content">${html}</div>`;
        window.scrollTo(0, 0);
    } catch (error) {
        loadHome(); // Torna alla home in caso di errore
    }
}

// Funzione per caricare una pagina Markdown
async function loadPages(pageName) {
    try {
        const response = await fetch(`/pages/${pageName.replace('.html', '.md')}`);
        if (!response.ok) throw new Error('File non trovato');
        const markdown = await response.text();
        const html = marked(markdown);
        articlesDiv.innerHTML = `<div class="article-content">${html}</div>`;
        window.scrollTo(0, 0);
    } catch (error) {
        articlesDiv.innerHTML = `<div class="error">${error.message}</div>`;
    }
}

// Gestione del caricamento iniziale
window.onload = () => {
    loadHome(); // Carica la home all'apertura
};

// Gestione degli eventi di navigazione
window.onpopstate = (event) => {
    if (event.state) {
        if (event.state.page) {
            loadPages(event.state.page);
        } else if (event.state.article) {
            loadArticle(event.state.article);
        }
    } else {
        loadHome(); // Torna alla home se non c'è stato
    }
};
