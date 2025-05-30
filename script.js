const articlesDiv = document.getElementById('articles');

// Corregge i percorsi delle immagini relative
function adjustImagePaths(markdown) {
    return markdown.replace(/!\[(.*?)\]\((?!\/|https?:\/\/)(.*?)\)/g, '![$1](/img/$2)');
}

// Converte i link in stile [[file#anchor|testo]] in <a href="...">testo</a>
function convertCustomLinks(markdown) {
    // Regex per [[file#anchor|testo]] o [[file|testo]] (anchor opzionale)
    return markdown.replace(/\[\[([^\]|#]+)(#([^|\]]+))?\|([^\]]+)\]\]/g, (match, file, _, anchor, text) => {
        // Rileva tipo contenuto in base a file (data per articolo, numero per newsletter, altro per pagina)
        let basePath;
        if (/^\d{4}-\d{2}-\d{2}-/.test(file)) {
            basePath = '#/articles/';
        } else if (/^\d+$/.test(file)) {
            basePath = '#/newsletter/';
        } else {
            basePath = '#/pages/';
        }
        const href = `${basePath}${file}${anchor ? '#' + encodeURIComponent(anchor) : ''}`;
        return `[${text}](${href})`; // Temporaneamente trasformo in markdown standard
    });
}

// Carica la home
async function loadHome() {
    try {
        document.getElementById('full-header').style.display = 'block';
        document.getElementById('simple-header').style.display = 'none';
        document.getElementById('header-newsletter').style.display = 'none';

        const response = await fetch('home.md');
        if (!response.ok) throw new Error('File non trovato');
        let markdown = await response.text();

        markdown = convertCustomLinks(markdown);
        const adjustedMarkdown = adjustImagePaths(markdown);
        const html = marked(adjustedMarkdown);
        articlesDiv.innerHTML = `<div class="article-content">${html}</div>`;

        await loadQuote();

        document.getElementById('footer-menu').style.display = 'block';
        window.scrollTo(0, 0);
        attachLinkHandlers();
    } catch (error) {
        articlesDiv.innerHTML = `<div class="error">${error.message}</div>`;
    }
}

// Carica la citazione del giorno
async function loadQuote() {
    try {
        const currentDate = new Date();
        const lastQuoteDate = localStorage.getItem('lastQuoteDate');
        const storedQuote = localStorage.getItem('storedQuote');

        if (lastQuoteDate === currentDate.toDateString() && storedQuote) {
            document.getElementById('quote-container').innerHTML = storedQuote;
            attachLinkHandlers();
            return;
        }

        const response = await fetch('/citazioni.md');
        if (!response.ok) throw new Error('File citazioni.md non trovato');
        const markdown = await response.text();
        const quotes = markdown.split('\n').map(line => line.trim()).filter(line => line.length > 0);

        if (quotes.length === 0) return;

        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        const htmlQuote = marked(randomQuote);
        const quoteElement = document.createElement('blockquote');
        quoteElement.innerHTML = htmlQuote;

        quoteElement.querySelectorAll('a').forEach(link => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        });

        const quoteContainer = document.getElementById('quote-container');
        quoteContainer.innerHTML = '';
        quoteContainer.appendChild(quoteElement);
        attachLinkHandlers();

        localStorage.setItem('lastQuoteDate', currentDate.toDateString());
        localStorage.setItem('storedQuote', quoteElement.outerHTML);
    } catch (error) {
        console.error('Errore nel caricare la citazione:', error);
    }
}

// Funzione di scroll a heading per anchor testuale
function scrollToHeadingByText(anchorText) {
    if (!anchorText) return;
    const normalizedAnchor = decodeURIComponent(anchorText).trim().toLowerCase();

    const headings = articlesDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');

    const target = Array.from(headings).find(h => {
        const headingText = h.textContent.trim().toLowerCase();
        return headingText === normalizedAnchor;
    });

    if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Carica un articolo
async function loadArticle(articleName, anchor = null) {
    try {
        document.getElementById('full-header').style.display = 'none';
        document.getElementById('simple-header').style.display = 'block';
        document.getElementById('header-newsletter').style.display = 'none';

        let response = await fetch(`/articles/${articleName}.md`);
        if (!response.ok) throw new Error('File non trovato');
        let markdown = await response.text();

        markdown = convertCustomLinks(markdown);
        const adjustedMarkdown = adjustImagePaths(markdown);
        const html = marked(adjustedMarkdown);
        articlesDiv.innerHTML = `<div class="article-content">${html}</div>`;

        document.getElementById('footer-menu').style.display = 'block';

        // Aggiorna immagine open graph se presente
        const imgMatch = markdown.match(/!\[.*?\]\((\/img\/.*?\.(jpg|jpeg|png|gif))\)/);
        if (imgMatch && imgMatch[1]) {
            document.querySelector('meta[property="og:image"]').setAttribute('content', imgMatch[1]);
            document.querySelector('meta[name="twitter:image"]').setAttribute('content', imgMatch[1]);
        }

        window.scrollTo(0, 0);
        attachLinkHandlers();

        if (anchor) {
            setTimeout(() => scrollToHeadingByText(anchor), 100);
        }
    } catch (error) {
        loadHome();
    }
}

// Carica una pagina
async function loadPages(pageName, anchor = null) {
    try {
        document.getElementById('full-header').style.display = 'none';
        document.getElementById('simple-header').style.display = 'block';
        document.getElementById('header-newsletter').style.display = 'none';

        let response = await fetch(`/pages/${pageName}.md`);
        if (!response.ok) throw new Error('File non trovato');
        let markdown = await response.text();

        markdown = convertCustomLinks(markdown);
        const adjustedMarkdown = adjustImagePaths(markdown);
        const html = marked(adjustedMarkdown);
        articlesDiv.innerHTML = `<div class="article-content">${html}</div>`;

        document.getElementById('footer-menu').style.display = 'block';
        window.scrollTo(0, 0);
        attachLinkHandlers();

        if (anchor) {
            setTimeout(() => scrollToHeadingByText(anchor), 100);
        }
    } catch (error) {
        articlesDiv.innerHTML = `<div class="error">${error.message}</div>`;
    }
}

// Carica una newsletter
async function loadNewsletter(newsletterName, anchor = null) {
    try {
        document.getElementById('full-header').style.display = 'none';
        document.getElementById('simple-header').style.display = 'none';
        document.getElementById('header-newsletter').style.display = 'block';

        let response = await fetch(`/newsletter/${newsletterName}.md`);
        if (!response.ok) throw new Error('File non trovato');
        let markdown = await response.text();

        markdown = convertCustomLinks(markdown);
        const adjustedMarkdown = adjustImagePaths(markdown);
        const html = marked(adjustedMarkdown);
        articlesDiv.innerHTML = `<div class="article-content">${html}</div>`;

        document.getElementById('footer-menu').style.display = 'block';
        window.scrollTo(0, 0);
        attachLinkHandlers();

        if (anchor) {
            setTimeout(() => scrollToHeadingByText(anchor), 100);
        }
    } catch (error) {
        articlesDiv.innerHTML = `<div class="error">${error.message}</div>`;
    }
}

// Gestisce i click sui link interni
function attachLinkHandlers() {
    const links = articlesDiv.querySelectorAll('a');
    const currentDomain = window.location.origin;

    links.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;

        const isExternal = href.includes('://') && !href.startsWith(currentDomain);
        if (isExternal) {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
            link.addEventListener('click', (event) => {
                event.preventDefault();
                window.open(href, '_blank');
            });
        } else if (href.startsWith('#/')) {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                window.location.hash = href;
            });
        } else if (href.endsWith('.html') || href.endsWith('.md') || href.startsWith('/')) {
            // Converti in hash interno
            link.addEventListener('click', (event) => {
                event.preventDefault();
                let cleanHref = href.replace(/^\/+/, '').replace('.html', '').replace('.md', '');
                // Capisci il tipo in base al nome
                let baseHash = '';
                if (/^\d{4}-\d{2}-\d{2}-/.test(cleanHref)) {
                    baseHash = '#/articles/';
                } else if (/^\d+$/.test(cleanHref)) {
                    baseHash = '#/newsletter/';
                } else {
                    baseHash = '#/pages/';
                }
                window.location.hash = baseHash + cleanHref;
            });
        }
    });
}

// Interpreta la hash per caricare contenuti
function handleHashChange() {
    const hash = window.location.hash;

    // Formati accettati:
    // #/articles/2025-05-30-nome-articolo#Anchor
    // #/newsletter/03#Anchor
    // #/pages/contatti#Anchor

    const articleRegex = /^#\/articles\/([^#]+)(#(.+))?$/;
    const pageRegex = /^#\/pages\/([^#]+)(#(.+))?$/;
    const newsletterRegex = /^#\/newsletter\/([^#]+)(#(.+))?$/;

    let match;
    if (match = newsletterRegex.exec(hash)) {
        const name = match[1];
        const anchor = match[3] || null;
        loadNewsletter(name, anchor);
    }
    else if (match = articleRegex.exec(hash)) {
        const name = match[1];
        const anchor = match[3] || null;
        loadArticle(name, anchor);
    }
    else if (match = pageRegex.exec(hash)) {
        const name = match[1];
        const anchor = match[3] || null;
        loadPages(name, anchor);
    }
    else {
        loadHome();
    }
}

// Inizializzazione
window.addEventListener('hashchange', handleHashChange);
window.addEventListener('load', () => {
    if (!window.location.hash) {
        loadHome();
    } else {
        handleHashChange();
    }
});
