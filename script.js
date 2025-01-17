const articlesDiv = document.getElementById('articles');

// Funzione per caricare dinamicamente il CSS
function loadCSS() {
    const existingLink = document.querySelector('link[rel="stylesheet"]');
    if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/style.css';  // Percorso del tuo CSS
        document.head.appendChild(link);
    }
}

// Funzione per caricare la home
async function loadHome() {
    try {
        loadCSS();  // Assicurati che il CSS venga caricato
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
        attachLinkHandlers();
    } catch (error) {
        articlesDiv.innerHTML = `<div class="error">${error.message}</div>`;
    }
}

// Funzione per caricare un articolo
async function loadArticle(articleName) {
    try {
        loadCSS();  // Assicurati che il CSS venga caricato
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
        loadCSS();  // Assicurati che il CSS venga caricato
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
        loadCSS();  // Assicurati che il CSS venga caricato
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

// Gestione del popstate per supportare la navigazione tramite i tasti "Indietro" e "Avanti"
window.onpopstate = (event) => {
    const path = window.location.pathname;
    if (path === '/') {
        loadHome();  // Ricarica la home se torni alla pagina principale
    } else if (path.startsWith('/articles/')) {
        const articleName = path.split('/').pop().replace('.html', '.md');
        loadContent(`/articles/${articleName}`);
    } else if (path.startsWith('/pages/')) {
        const pageName = path.split('/').pop().replace('.html', '.md');
        loadContent(`/pages/${pageName}`);
    }
};

// Gestione dell'accesso diretto alle pagine/articoli
window.onload = () => {
    const path = window.location.pathname;

    // Se l'utente non sta visitando la home, carica prima la home e poi il contenuto
    if (!path.startsWith('/index.html') && path !== '/') {
        loadHome();  // Carica la home prima
        setTimeout(() => {
            // Una volta che la home è stata caricata, carica il contenuto specifico
            if (path.startsWith('/articles/')) {
                const articleName = path.split('/').pop().replace('.html', '.md');
                loadContent(`/articles/${articleName}`);
            } else if (path.startsWith('/pages/')) {
                const pageName = path.split('/').pop().replace('.html', '.md');
                loadContent(`/pages/${pageName}`);
            }
        }, 0);  // Ritarda il caricamento del contenuto specifico per far prima caricare la home
    } else {
        loadHome();  // Se siamo nella home, carica direttamente la home
    }
};

// Carica la home al caricamento della pagina
loadHome();