const articlesDiv = document.getElementById('articles');
const subtitle = document.querySelector('.subtitle');

// Corregge i percorsi delle immagini relative
function adjustImagePaths(markdown) {
    return markdown.replace(/!\[(.*?)\]\((?!\/|https?:\/\/)(.*?)\)/g, '![$1](/img/$2)');
}

// Trasforma i wikilink [[file#anchor|label]] in link markdown standard
function transformWikiLinks(md) {
    return md.replace(/\[\[([^\|\]]+)\|([^\]]+)\]\]/g, (match, filename, label) => {
        let anchor = '';
        if (filename.includes('#')) {
            const parts = filename.split('#');
            filename = parts[0];
            anchor = '#' + parts[1];
        }

        let base = '#/pages/';
        if (/^\d{4}-\d{2}-\d{2}/.test(filename)) base = '#/articles/';
        else if (/^\d+$/.test(filename)) base = '#/newsletter/';

        return `[${label}](${base}${filename}${anchor})`;
    });
}

// Funzione per scrollare al capitolo (heading) per testo (case insensitive)
function scrollToHeadingByText(anchorText) {
    const headings = articlesDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const target = Array.from(headings).find(h =>
        h.textContent.trim().toLowerCase() === anchorText.toLowerCase()
    );
    if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
        markdown = transformWikiLinks(markdown);
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

// Carica la citazione del giorno (uguale)
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

// Carica un articolo (con gestione anchor)
async function loadArticle(articleName, anchorText = null) {
    try {
        document.getElementById('full-header').style.display = 'none';
        document.getElementById('simple-header').style.display = 'block';
        document.getElementById('header-newsletter').style.display = 'none';

        const response = await fetch(`/articles/${articleName}.md`);
        if (!response.ok) throw new Error('File non trovato');
        let markdown = await response.text();
        markdown = transformWikiLinks(markdown);
        const adjustedMarkdown = adjustImagePaths(markdown);
        const html = marked(adjustedMarkdown);
        articlesDiv.innerHTML = `<div class="article-content">${html}</div>`;

        document.getElementById('footer-menu').style.display = 'block';

        const imgMatch = markdown.match(/!\[.*?\]\((\/img\/.*?\.(jpg|jpeg|png|gif))\)/);
        if (imgMatch && imgMatch[1]) {
            document.querySelector('meta[property="og:image"]').setAttribute('content', imgMatch[1]);
            document.querySelector('meta[name="twitter:image"]').setAttribute('content', imgMatch[1]);
        }

        if (anchorText) {
            scrollToHeadingByText(anchorText);
        } else {
            window.scrollTo(0, 0);
        }

        attachLinkHandlers();
    } catch (error) {
        loadHome();
    }
}

// Carica una pagina (con gestione anchor)
async function loadPages(pageName, anchorText = null) {
    try {
        document.getElementById('full-header').style.display = 'none';
        document.getElementById('simple-header').style.display = 'block';
        document.getElementById('header-newsletter').style.display = 'none';

        const response = await fetch(`/pages/${pageName}.md`);
        if (!response.ok) throw new Error('File non trovato');
        let markdown = await response.text();
        markdown = transformWikiLinks(markdown);
        const adjustedMarkdown = adjustImagePaths(markdown);
        const html = marked(adjustedMarkdown);
        articlesDiv.innerHTML = `<div class="article-content">${html}</div>`;

        document.getElementById('footer-menu').style.display = 'block';

        if (anchorText) {
            scrollToHeadingByText(anchorText);
        } else {
            window.scrollTo(0, 0);
        }

        attachLinkHandlers();
    } catch (error) {
        articlesDiv.innerHTML = `<div class="error">${error.message}</div>`;
    }
}

// Carica una newsletter (con gestione anchor)
async function loadNewsletter(newsletterName, anchorText = null) {
    try {
        document.getElementById('full-header').style.display = 'none';
        document.getElementById('simple-header').style.display = 'none';
        document.getElementById('header-newsletter').style.display = 'block';

        const response = await fetch(`/newsletter/${newsletterName}.md`);
        if (!response.ok) throw new Error('File non trovato');
        let markdown = await response.text();
        markdown = transformWikiLinks(markdown);
        const adjustedMarkdown = adjustImagePaths(markdown);
        const html = marked(adjustedMarkdown);
        articlesDiv.innerHTML = `<div class="article-content">${html}</div>`;

        document.getElementById('footer-menu').style.display = 'block';

        if (anchorText) {
            scrollToHeadingByText(anchorText);
        } else {
            window.scrollTo(0, 0);
        }

        attachLinkHandlers();
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
        } else if (href.endsWith('.html') || href.endsWith('.md') || href.startsWith('/')) {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                // Estrai file e anchor
                const [fullPath, anchor] = href.split('#');
                const cleanHref = fullPath.replace(/^\/+/, '').replace('.html', '').replace('.md', '');

                if (href.startsWith('/newsletter/')) {
                    window.location.hash = `#/newsletter/${cleanHref.split('/').pop()}${anchor ? '#' + anchor : ''}`;
                } else if (href.includes('pages/')) {
                    window.location.hash = `#/pages/${cleanHref.split('/').pop()}${anchor ? '#' + anchor : ''}`;
                } else {
                    window.location.hash = `#/articles/${cleanHref.split('/').pop()}${anchor ? '#' + anchor : ''}`;
                }
            });
        }
    });
}

// Interpreta la hash per caricare contenuti
function handleHashChange() {
    const hash = window.location.hash;

    function parseNameAndAnchor(str) {
        const parts = str.split('#');
        return { name: parts[0], anchor: parts[1] || null };
    }

    const matchArticle = hash.match(/^#\/articles\/([^#]+)(?:#(.+))?$/);
    const matchPage = hash.match(/^#\/pages\/([^#]+)(?:#(.+))?$/);
    const matchNewsletter = hash.match(/^#\/newsletter\/([^#]+)(?:#(.+))?$/);

    if (matchArticle) {
        const { name, anchor } = parseNameAndAnchor(matchArticle[1] + (matchArticle[2] ? '#' + matchArticle[2] : ''));
        loadArticle(name, anchor);
    } else if (matchPage) {
        const { name, anchor } = parseNameAndAnchor(matchPage[1] + (matchPage[2] ? '#' + matchPage[2] : ''));
        loadPages(name, anchor);
    } else if (matchNewsletter) {
        const { name, anchor } = parseNameAndAnchor(matchNewsletter[1] + (matchNewsletter[2] ? '#' + matchNewsletter[2] : ''));
        loadNewsletter(name, anchor);
    } else {
        loadHome();
    }
}

window.addEventListener('hashchange', handleHashChange);

// Footer dinamico
function updateFooter() {
    const currentYear = new Date().getFullYear();
    const footerCopy = document.getElementById('footer-menu');
    footerCopy.innerHTML = `© 2009 - ${currentYear} Il Giornale delle Idee`;
}

updateFooter();

// Caricamento iniziale
handleHashChange();
