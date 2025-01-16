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

        // Nascondi il footer menu per la home
        document.getElementById('footer-menu').style.display = 'none';
        
        // Aggiorna l'URL nella barra degli indirizzi
        window.history.pushState(null, '', '/');

        // Ripristina lo scroll all'inizio
        window.scrollTo(0, 0);
        
        // Aggiungi un gestore di eventi ai link
        attachLinkHandlers();
    } catch (error) {
        articlesDiv.innerHTML = `<div class="error">${error.message}</div>`;
    }
}

// Funzione per caricare un articolo dopo aver caricato la home
async function loadArticleAfterHome(articleName) {
    // Carica prima la home
    await loadHome();

    // Dopo un breve ritardo (per consentire il rendering), carica l'articolo
    setTimeout(() => {
        loadArticle(articleName); // Carica l'articolo
    }, 200); // Ritardo di 200ms per consentire il rendering della home
}

// Funzione per caricare una pagina dopo aver caricato la home
async function loadPagesAfterHome(pageName) {
    // Carica prima la home
    await loadHome();

    // Dopo un breve ritardo (per consentire il rendering), carica la pagina
    setTimeout(() => {
        loadPages(pageName); // Carica la pagina
    }, 200); // Ritardo di 200ms per consentire il rendering della home
}

// Funzione che si occupa di caricare l'articolo o la pagina, dopo la home
async function loadContentAfterHome(path) {
    await loadHome();  // Prima carica la home

    // Carica l'articolo o la pagina specificata nel path
    const match = path.match(/articles\/(.+)\.html/);
    if (match) {
        loadArticle(match[1]); // Carica l'articolo
    } else {
        const pageMatch = path.match(/pages\/(.+)\.html/);
        if (pageMatch) {
            loadPages(pageMatch[1]); // Carica la pagina
        }
    }
}

// Gestione del caricamento iniziale
window.onload = () => {
    const path = window.location.pathname;

    // Carica il contenuto solo dopo aver caricato la home
    loadContentAfterHome(path);
};

// Funzione per caricare un articolo
async function loadArticle(articleName) {
    try {
        const response = await fetch(`/articles/${articleName.replace('.html', '.md')}`);
        if (!response.ok) throw new Error('File non trovato');
        const markdown = await response.text();
        const html = marked(markdown);
        
        // Mostra il footer menu
        document.getElementById('footer-menu').style.display = 'block';
        
        // Mostra il contenuto dell'articolo
        articlesDiv.innerHTML = `<div class="article-content">${html}</div>`;
        
        // Aggiorna l'URL nella barra degli indirizzi
        window.history.pushState({ article: articleName }, '', `/articles/${articleName}`);

        // Ripristina lo scroll all'inizio
        window.scrollTo(0, 0);
        
        // Aggiungi un gestore di eventi ai link
        attachLinkHandlers();
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
        
        // Mostra il footer menu
        document.getElementById('footer-menu').style.display = 'block';

        // Mostra il contenuto della pagina
        articlesDiv.innerHTML = `<div class="article-content">${html}</div>`;
        
        // Aggiorna l'URL nella barra degli indirizzi
        window.history.pushState({ page: pageName }, '', `/pages/${pageName}`);

        // Ripristina lo scroll all'inizio
        window.scrollTo(0, 0);
        
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
		
	    // Mostra il footer menu
	    document.getElementById('footer-menu').style.display = 'block';
        
        // Mostra il contenuto del file Markdown
        articlesDiv.innerHTML = `<div class="article-content">${html}</div>`;

        // Aggiorna l'URL nella barra degli indirizzi
		window.history.pushState({ file: fileName }, '', fileName);
		
		// Ripristina lo scroll all'inizio
        window.scrollTo(0, 0);
        
        // Aggiungi un gestore di eventi ai link
        attachLinkHandlers();
    } catch (error) {
        articlesDiv.innerHTML = `<div class="error">${error.message}</div>`;
    }
}

window.onpopstate = (event) => {
    console.log("Popstate event:", event.state);
    if (event.state) {
        if (event.state.article) {
            loadArticle(event.state.article);
        } else if (event.state.page) {
            loadPages(event.state.page);
        } else if (event.state.file) {
            loadMarkdown(event.state.file);
        }
    } else {
        loadHome(); // Torna alla home se non c'è stato
    }
};

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