const articlesDiv = document.getElementById('articles');
const subtitle = document.querySelector('.subtitle');

// Funzione per caricare la home
async function loadHome() {
    try {
		// Mostra l'header completo e nasconde quello semplificato per la home
        document.getElementById('full-header').style.display = 'block';
        document.getElementById('simple-header').style.display = 'none';
		
        const response = await fetch('home.md');
        if (!response.ok) throw new Error('File non trovato');
        const markdown = await response.text();
        const html = marked(markdown);
        
        // Mostra il contenuto della home
        articlesDiv.innerHTML = `<div class="article-content">${html}</div>`;
		
        // Mostra la citazione random
        await loadQuote();
        
        // Mostra il footer menu
        document.getElementById('footer-menu').style.display = 'block';
		
        // Aggiorna l'URL nella barra degli indirizzi
        window.history.pushState(null, '', '/');

        // Ripristina lo scroll all'inizio
        window.scrollTo(0, 0);
        attachLinkHandlers();
    } catch (error) {
        articlesDiv.innerHTML = `<div class="error">${error.message}</div>`;
    }
}

async function loadQuote() {
    try {
        // Carica il file citazioni.md
        const response = await fetch('/citazioni.md');
        if (!response.ok) throw new Error('File citazioni.md non trovato');
        
        // Prendi il contenuto del file
        const markdown = await response.text();
        
        // Split del contenuto per riga e rimuovi le righe vuote
        const quotes = markdown.split('\n')
            .map(line => line.trim()) // Rimuove gli spazi all'inizio e alla fine
            .filter(line => line.length > 0); // Filtra le righe vuote

        if (quotes.length === 0) {
            console.error('Nessuna citazione disponibile nel file');
            return;
        }

        // Scegli una citazione random
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        // Converte la citazione da Markdown a HTML
        const htmlQuote = marked(randomQuote);

        // Crea un elemento blockquote per visualizzare la citazione
        const quoteElement = document.createElement('blockquote');
        quoteElement.innerHTML = htmlQuote; // Inserisci il contenuto HTML

        // Inserisci la citazione nel contenitore
        const quoteContainer = document.getElementById('quote-container');
        if (quoteContainer) {
            quoteContainer.innerHTML = ''; // Pulisce il contenuto precedente
            quoteContainer.appendChild(quoteElement);
			attachLinkHandlers();
        }
    } catch (error) {
        console.error('Errore nel caricare la citazione:', error);
    }
}

// Chiamata alla funzione per caricare la citazione
loadQuote();

// Funzione per caricare un articolo
async function loadArticle(articleName) {
    try {
		
        // Mostra l'header semplificato e nasconde quello completo
        document.getElementById('full-header').style.display = 'none';
        document.getElementById('simple-header').style.display = 'block';
		
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
		
		// Usa la prima immagine che appare nel contenuto
        const imgMatch = markdown.match(/!\[.*?\]\((\/img\/.*?\.(jpg|jpeg|png|gif))\)/);
        if (imgMatch && imgMatch[1]) {
            const articleImageUrl = imgMatch[1];

            // Modifica i meta tag Open Graph e Twitter Card con la prima immagine trovata
            document.querySelector('meta[property="og:image"]').setAttribute('content', articleImageUrl);
            document.querySelector('meta[name="twitter:image"]').setAttribute('content', articleImageUrl);
        }

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
		
        // Mostra l'header semplificato e nasconde quello completo
        document.getElementById('full-header').style.display = 'none';
        document.getElementById('simple-header').style.display = 'block';
		
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
		
        // Mostra l'header semplificato e nasconde quello completo
        document.getElementById('full-header').style.display = 'none';
        document.getElementById('simple-header').style.display = 'block';
		
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

// Footer menu dinamico
function updateFooter() {
    const currentYear = new Date().getFullYear(); // Ottieni l'anno corrente
    const footerCopy = document.getElementById('footer-menu'); // Seleziona l'elemento nel footer
    
    // Crea il contenuto dinamico con l'anno, "Yuri Di Prodo" in corsivo e "Contatti" come link
    footerCopy.innerHTML = `© 2009-${currentYear} <em>Yuri Di Prodo</em> | <a href="/pages/contatti.html" onclick="event.preventDefault(); loadPages('contatti.html');">Contatti</a>`;
}

// Chiamata alla funzione per aggiornare l'anno al caricamento della pagina
window.onload = () => {
    updateFooter();
};

// Carica la home al caricamento della pagina
loadHome();