const articlesDiv = document.getElementById('articles');
const subtitle = document.querySelector('.subtitle');

// Corregge i percorsi delle immagini relative
function adjustImagePaths(markdown) {
    return markdown.replace(/!\[(.*?)\]\((?!\/|https?:\/\/)(.*?)\)/g, '![$1](/img/$2)');
}

// Carica la home
async function loadHome() {
    try {
        document.getElementById('full-header').style.display = 'block';
        document.getElementById('simple-header').style.display = 'none';
        document.getElementById('header-newsletter').style.display = 'none';

        const response = await fetch('home.md');
        if (!response.ok) throw new Error('File non trovato');
        const markdown = await response.text();
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

// Carica un articolo
async function loadArticle(articleName) {
    try {
        document.getElementById('full-header').style.display = 'none';
        document.getElementById('simple-header').style.display = 'block';
        document.getElementById('header-newsletter').style.display = 'none';

        const response = await fetch(`/articles/${articleName}.md`);
        if (!response.ok) throw new Error('File non trovato');
        const markdown = await response.text();
        const adjustedMarkdown = adjustImagePaths(markdown);
        const html = marked(adjustedMarkdown);
        articlesDiv.innerHTML = `<div class="article-content">${html}</div>`;

        document.getElementById('footer-menu').style.display = 'block';

        const imgMatch = markdown.match(/!\[.*?\]\((\/img\/.*?\.(jpg|jpeg|png|gif))\)/);
        if (imgMatch && imgMatch[1]) {
            document.querySelector('meta[property="og:image"]').setAttribute('content', imgMatch[1]);
            document.querySelector('meta[name="twitter:image"]').setAttribute('content', imgMatch[1]);
        }

        window.scrollTo(0, 0);
        attachLinkHandlers();
    } catch (error) {
        loadHome();
    }
}

// Carica una pagina
async function loadPages(pageName) {
    try {
        document.getElementById('full-header').style.display = 'none';
        document.getElementById('simple-header').style.display = 'block';
        document.getElementById('header-newsletter').style.display = 'none';

        const response = await fetch(`/pages/${pageName}.md`);
        if (!response.ok) throw new Error('File non trovato');
        const markdown = await response.text();
        const adjustedMarkdown = adjustImagePaths(markdown);
        const html = marked(adjustedMarkdown);
        articlesDiv.innerHTML = `<div class="article-content">${html}</div>`;

        document.getElementById('footer-menu').style.display = 'block';
        window.scrollTo(0, 0);
        attachLinkHandlers();
    } catch (error) {
        articlesDiv.innerHTML = `<div class="error">${error.message}</div>`;
    }
}

// Carica una newsletter
async function loadNewsletter(newsletterName) {
    try {
        document.getElementById('full-header').style.display = 'none';
        document.getElementById('simple-header').style.display = 'none';
        document.getElementById('header-newsletter').style.display = 'block';

        const response = await fetch(`/newsletter/${newsletterName}.md`);
        if (!response.ok) throw new Error('File non trovato');
        const markdown = await response.text();
        const adjustedMarkdown = adjustImagePaths(markdown);
        const html = marked(adjustedMarkdown);
        articlesDiv.innerHTML = `<div class="article-content">${html}</div>`;

        document.getElementById('footer-menu').style.display = 'block';
        window.scrollTo(0, 0);
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
                const cleanHref = href.replace(/^\/+/, '').replace('.html', '').replace('.md', '');
                if (href.startsWith('/newsletter/')) {
                    window.location.hash = `#/newsletter/${cleanHref.split('/').pop()}`;
                } else if (href.includes('pages/')) {
                    window.location.hash = `#/pages/${cleanHref.split('/').pop()}`;
                } else {
                    window.location.hash = `#/articles/${cleanHref.split('/').pop()}`;
                }
            });
        }
    });
}

// Interpreta la hash per caricare contenuti
function handleHashChange() {
    const hash = window.location.hash;
    const matchArticle = hash.match(/^#\/articles\/(.+)$/);
    const matchPage = hash.match(/^#\/pages\/(.+)$/);
    const matchNewsletter = hash.match(/^#\/newsletter\/(.+)$/);

    if (matchArticle) {
        loadArticle(matchArticle[1]);
    } else if (matchPage) {
        loadPages(matchPage[1]);
    } else if (matchNewsletter) {
        loadNewsletter(matchNewsletter[1]);
    } else {
        loadHome();
    }
}

window.addEventListener('hashchange', handleHashChange);

// Footer dinamico
function updateFooter() {
    const currentYear = new Date().getFullYear();
    const footerCopy = document.getElementById('footer-menu');
    footerCopy.innerHTML = `© 2009-${currentYear} <em>Yuri Di Prodo</em> | <a href="#/pages/contatti">Contatti</a>`;
}

window.onload = () => {
    updateFooter();
    handleHashChange();
};
