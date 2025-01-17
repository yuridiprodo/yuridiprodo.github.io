const articlesDiv = document.getElementById('articles');

// Funzione per aggiornare il breadcrumb (percorso)
function updateBreadcrumb(path, titles) {
    const breadcrumb = document.getElementById('breadcrumb');
    
    // Se siamo nella home, non vogliamo visualizzare il breadcrumb
    if (path.length === 1 && path[0] === 'Home') {
        breadcrumb.innerHTML = ''; // Nascondi breadcrumb
        return;
    }

    const links = path.map((part, index) => {
        const url = '/' + path.slice(0, index + 1).join('/');
        const title = titles[index] || part; // Usa il titolo se disponibile, altrimenti il nome della parte del percorso

        return `<a href="${url}">${title}</a>`;
    }).join(' > ');

    breadcrumb.innerHTML = links;
}

// Funzione per caricare la home
async function loadHome() {
    try {
        const response = await fetch('home.md');
        if (!response.ok) throw new Error('File non trovato');
        const markdown = await response.text();
        const html = marked(markdown);
        
        // Mostra il contenuto della home
        articlesDiv.innerHTML = `<div class="article-content">${html}</div>`;
		
        // Nascondi il breadcrumb per la home
        updateBreadcrumb(['Home'], []);
        
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
        const response = await fetch(`/articles/${articleName.replace('.html', '.md')}`);
        if (!response.ok) throw new Error('File non trovato');
        const markdown = await response.text();
        const html = marked(markdown);
		
	    // Mostra il footer menu
	    document.getElementById('footer-menu').style.display = 'block';
        
        // Mostra il contenuto dell'articolo
        articlesDiv.innerHTML = `<div class="article-content">${html}</div>`;
		
        // Estrai il titolo dal primo h1 nel markdown
        const titleMatch = markdown.match(/^# (.+)/);
        const articleTitle = titleMatch ? titleMatch[1] : articleName.replace('.html', '');
		
        // Aggiorna il breadcrumb con il percorso completo
        updateBreadcrumb(['Home', 'Blog', articleName]);
		
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
		
        // Estrai il titolo dal primo h1 nel markdown
        const titleMatch = markdown.match(/^# (.+)/);
        const pageTitle = titleMatch ? titleMatch[1] : pageName.replace('.html', '');
		
        // Aggiorna il breadcrumb con il percorso
        const path = ['Home', pageName.replace('.html', '')];
        updateBreadcrumb(path);
		
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
		
        // Aggiorna il breadcrumb
        updateBreadcrumb(['Home', fileName], [fileName]);

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

// Gestione del popstate
window.onpopstate = (event) => {
    if (event.state) {
        if (event.state.article) {
            loadArticle(event.state.article);
        } else if (event.state.page) {
            loadPages(event.state.page);
        } else if (event.state.file) {
            loadMarkdown(event.state.file);
        }
    } else {
        loadHome();
    }
};

// Gestione del caricamento iniziale
window.onload = () => {
    const path = window.location.pathname;
    const matchArticle = path.match(/articles\/(.+)\.html/);
    const matchPage = path.match(/pages\/(.+)\.html/);

    if (matchArticle) {
        loadArticle(matchArticle[1]);
    } else if (matchPage) {
        loadPages(matchPage[1]);
    } else {
        loadHome();
    }
};

// Carica la home al caricamento della pagina
loadHome();