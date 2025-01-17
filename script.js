const articlesDiv = document.getElementById('articles');

// Funzione per caricare dinamicamente il CSS
function loadCSS() {
    const link = document.querySelector('link[rel="stylesheet"]');
    if (!link || link.href !== '/style.css') {
        const newLink = document.createElement('link');
        newLink.rel = 'stylesheet';
        newLink.href = '/style.css';  // Assicurati che il percorso sia corretto
        document.head.appendChild(newLink);
    }
}

// Funzione per caricare la home
async function loadHome() {
	loadCSS();  // Carica il CSS
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
        attachLinkHandlers();
    } catch (error) {
        articlesDiv.innerHTML = `<div class="error">${error.message}</div>`;
    }
}

// Funzione per caricare un articolo
async function loadArticle(articleName) {
    loadCSS();  // Carica il CSS    
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
    loadCSS();  // Carica il CSS
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
    loadCSS();  // Carica il CSS
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

// Gestione del popstate per la navigazione
window.onpopstate = (event) => {
    const path = window.location.pathname;
    if (path === '/') {
        loadHome();  // Ricarica la home
    } else if (path.startsWith('/articles/')) {
        const articleName = path.split('/').pop().replace('.html', '.md');
        loadArticle(articleName);
    } else if (path.startsWith('/pages/')) {
        const pageName = path.split('/').pop().replace('.html', '.md');
        loadPages(pageName);
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