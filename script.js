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

        // Ripristina lo scroll all'inizio
        window.scrollTo(0, 0);
		
	// Aggiorna lo stato nella cronologia
        history.pushState({ page: 'home' }, '', 'index.html');
        
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

        // Ripristina lo scroll all'inizio
        window.scrollTo(0, 0);
		
	// Aggiorna lo stato nella cronologia
        history.pushState({ articleName }, '', articleName);
        
        // Aggiungi un gestore di eventi ai link
        attachLinkHandlers();
    } catch (error) {
        loadHome(); // Torna alla home in caso di errore
    }
}

// Funzione per caricare una pagina Markdown
async function loadPages(pageName) {
    try {
        const response = await fetch(`pages/${pageName.replace('.html', '.md')}`);
        if (!response.ok) throw new Error('File non trovato');
        const markdown = await response.text();
        const html = marked(markdown);

        // Mostra il contenuto della pagina
        articlesDiv.innerHTML = `<div class="article-content">${html}</div>`;

        // Ripristina lo scroll all'inizio
        window.scrollTo(0, 0);
		
	// Aggiorna lo stato nella cronologia
        history.pushState({ page: pageName }, '', pageName);
        
        // Aggiungi un gestore di eventi ai link
        attachLinkHandlers();
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

        // Ripristina lo scroll all'inizio
        window.scrollTo(0, 0);
		
	// Aggiorna lo stato nella cronologia
        history.pushState({ page: 'contatti' }, '', 'contatti.html');
        
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
        const href = link.getAttribute('href');
        if (href.endsWith('.html')) {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                if (href.includes('pages/')) {
                    loadPages(href.split('/').pop());
                } else {
                    loadArticle(href.split('/').pop());
                }
            });
        } else if (href.endsWith('.md')) {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                loadMarkdown(href);
            });
        } else {
            // Gestione per link esterni
            link.addEventListener('click', (event) => {
                if (!href.includes(window.location.origin)) {
                    event.preventDefault();
                    window.open(href, '_blank');
                }
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

        // Ripristina lo scroll all'inizio
        window.scrollTo(0, 0);

	// Aggiorna lo stato nella cronologia
        history.pushState({ page: fileName }, '', fileName);
        
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

// Gestione dello stato della cronologia
window.onpopstate = (event) => {
    console.log("Navigazione indietro/avanti:", event.state);
    if (event.state) {
        if (event.state.page === 'home') {
            loadHome();
        } else if (event.state.page === 'contatti') {
            loadContacts();
        } else if (event.state.articleName) {
            loadArticle(event.state.articleName);
        } else if (event.state.pageName) {
            loadPages(event.state.pageName); // Carica pagine specifiche
        } else if (event.state.fileName) {
            loadMarkdown(event.state.fileName); // Carica file Markdown
        }
    } else {
        loadHome(); // Torna alla home se non c'è stato
    }
};

// Carica la home al caricamento della pagina
loadHome();