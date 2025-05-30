const articlesDiv = document.getElementById('articles');
const subtitle = document.querySelector('.subtitle');

// Funzione per correggere i percorsi immagini
function adjustImagePaths(markdown) {
    return markdown.replace(/!\[(.*?)\]\((?!\/|https?:\/\/)(.*?)\)/g, '![$1](/img/$2)');
}

// Funzione per scrollare verso l'ID specificato nell'hash
function scrollToHashTarget() {
    const hash = window.location.hash;
    const targetId = hash.split('#')[2];
    if (targetId) {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Funzione per caricare la home
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

        window.history.pushState(null, '', '/');
        window.scrollTo(0, 0);
        attachLinkHandlers();
        scrollToHashTarget();
    } catch (error) {
        articlesDiv.innerHTML = `<div class="error">${error.message}</div>`;
    }
}

async function loadQuote() {
    try {
        const currentDate = new Date();
        const lastQuoteDate = localStorage.getItem('lastQuoteDate');
        const storedQuote = localStorage.getItem('storedQuote');

        if (lastQuoteDate && lastQuoteDate === currentDate.toDateString() && storedQuote) {
            const quoteContainer = document.getElementById('quote-container');
            if (quoteContainer) {
                quoteContainer.innerHTML = storedQuote;
                attachLinkHandlers();
            }
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

        const links = quoteElement.querySelectorAll('a');
        links.forEach(link => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        });

        const quoteContainer = document.getElementById('quote-container');
        if (quoteContainer) {
            quoteContainer.innerHTML = '';
            quoteContainer.appendChild(quoteElement);
            attachLinkHandlers();
        }

        localStorage.setItem('lastQuoteDate', currentDate.toDateString());
        localStorage.setItem('storedQuote', quoteElement.outerHTML);
    } catch (error) {
        console.error('Errore nel caricare la citazione:', error);
    }
}

async function loadArticle(articleName) {
    try {
        document.getElementById('full-header').style.display = 'none';
        document.getElementById('simple-header').style.display = 'block';
        document.getElementById('header-newsletter').style.display = 'none';

        const response = await fetch(`/articles/${articleName.replace('.html', '.md')}`);
        if (!response.ok) throw new Error('File non trovato');
        const markdown = await response.text();
        const adjustedMarkdown = adjustImagePaths(markdown);
        const html = marked(adjustedMarkdown);

        document.getElementById('footer-menu').style.display = 'block';
        articlesDiv.innerHTML = `<div class="article-content">${html}</div>`;

        window.history.pushState({ article: articleName }, '', `/articles/${articleName}`);

        const imgMatch = markdown.match(/!\[.*?\]\((\/img\/.*?\.(jpg|jpeg|png|gif))\)/);
        if (imgMatch && imgMatch[1]) {
            const articleImageUrl = imgMatch[1];
            document.querySelector('meta[property="og:image"]').setAttribute('content', articleImageUrl);
            document.querySelector('meta[name="twitter:image"]').setAttribute('content', articleImageUrl);
        }

        window.scrollTo(0, 0);
        attachLinkHandlers();
        scrollToHashTarget();
    } catch (error) {
        loadHome();
    }
}

async function loadPages(pageName) {
    try {
        document.getElementById('full-header').style.display = 'none';
        document.getElementById('simple-header').style.display = 'block';
        document.getElementById('header-newsletter').style.display = 'none';

        const response = await fetch(`/pages/${pageName.replace('.html', '.md')}`);
        if (!response.ok) throw new Error('File non trovato');
        const markdown = await response.text();
        const adjustedMarkdown = adjustImagePaths(markdown);
        const html = marked(adjustedMarkdown);

        document.getElementById('footer-menu').style.display = 'block';
        articlesDiv.innerHTML = `<div class="article-content">${html}</div>`;
        window.history.pushState({ page: pageName }, '', `/pages/${pageName}`);

        window.scrollTo(0, 0);
        attachLinkHandlers();
        scrollToHashTarget();
    } catch (error) {
        articlesDiv.innerHTML = `<div class="error">${error.message}</div>`;
    }
}

async function loadNewsletter(newsletterName) {
    try {
        document.getElementById('full-header').style.display = 'none';
        document.getElementById('simple-header').style.display = 'none';
        document.getElementById('header-newsletter').style.display = 'block';

        const response = await fetch(`/newsletter/${newsletterName.replace('.html', '.md')}`);
        if (!response.ok) throw new Error('File non trovato');

        const markdown = await response.text();
        const adjustedMarkdown = adjustImagePaths(markdown);
        const html = marked(adjustedMarkdown);

        document.getElementById('footer-menu').style.display = 'block';
        articlesDiv.innerHTML = `<div class="article-content">${html}</div>`;
        window.history.pushState({ newsletter: newsletterName }, '', `/newsletter/${newsletterName}`);

        window.scrollTo(0, 0);
        attachLinkHandlers();
        scrollToHashTarget();
    } catch (error) {
        articlesDiv.innerHTML = `<div class="error">${error.message}</div>`;
    }
}

function attachLinkHandlers() {
    const links = articlesDiv.querySelectorAll('a');
    const currentDomain = window.location.origin;

    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
            const isExternal = href.includes('://') && !href.startsWith(currentDomain);
            if (isExternal) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
                link.addEventListener('click', (event) => {
                    event.preventDefault();
                    window.open(href, '_blank');
                });
            } else if (href.endsWith('.html') || href.endsWith('.md') || href.startsWith('/')) {
                if (href.startsWith('/newsletter/')) {
                    link.addEventListener('click', (event) => {
                        event.preventDefault();
                        loadNewsletter(href.split('/').pop());
                    });
                } else if (href.includes('pages/')) {
                    link.addEventListener('click', (event) => {
                        event.preventDefault();
                        loadPages(href.split('/').pop());
                    });
                } else {
                    link.addEventListener('click', (event) => {
                        event.preventDefault();
                        loadArticle(href.split('/').pop());
                    });
                }
            }
        }
    });
}

async function loadMarkdown(fileName) {
    try {
        document.getElementById('full-header').style.display = 'none';
        document.getElementById('simple-header').style.display = 'block';
        document.getElementById('header-newsletter').style.display = 'none';

        const response = await fetch(fileName);
        if (!response.ok) throw new Error('File non trovato');
        const markdown = await response.text();
        const adjustedMarkdown = adjustImagePaths(markdown);
        const html = marked(adjustedMarkdown);

        document.getElementById('footer-menu').style.display = 'block';
        articlesDiv.innerHTML = `<div class="article-content">${html}</div>`;
        window.history.pushState({ file: fileName }, '', fileName);

        window.scrollTo(0, 0);
        attachLinkHandlers();
        scrollToHashTarget();
    } catch (error) {
        articlesDiv.innerHTML = `<div class="error">${error.message}</div>`;
    }
}

function updateFooter() {
    const currentYear = new Date().getFullYear();
    const footerCopy = document.getElementById('footer-menu');
    footerCopy.innerHTML = `© 2009-${currentYear} <em>Yuri Di Prodo</em> | <a href="/pages/contatti.html" onclick="event.preventDefault(); loadPages('contatti.html');">Contatti</a>`;
}

async function initializeSite() {
    await loadQuote();
    updateFooter();
    document.getElementById('footer-menu').style.display = 'block';
}

function handleHashChange() {
    const path = window.location.pathname;
    const matchArticle = path.match(/articles\/(.+)\.html/);
    const matchPage = path.match(/pages\/(.+)\.html/);
    const matchNewsletter = path.match(/newsletter\/(.+)\.html/);

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

window.onload = async () => {
    await initializeSite();
    handleHashChange();
};

window.onpopstate = (event) => {
    if (event.state) {
        if (event.state.article) {
            loadArticle(event.state.article);
        } else if (event.state.page) {
            loadPages(event.state.page);
        } else if (event.state.file) {
            loadMarkdown(event.state.file);
        } else if (event.state.newsletter) {
            loadNewsletter(event.state.newsletter);
        }
    } else {
        loadHome();
    }
};