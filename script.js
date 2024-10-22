const articlesDiv = document.getElementById('articles');
let articles = []; // Array per memorizzare gli articoli

// Funzione per caricare e visualizzare gli articoli
async function loadArticle(articleSlug) {
    try {
        const response = await fetch(`articles/${articleSlug}.md`); // Carica il file usando lo slug
        if (!response.ok) throw new Error('File non trovato');
        const markdown = await response.text();
        const { data, content } = parseMarkdown(markdown); // Usa la funzione di parsing

        const html = marked(content);

        // Modifica il permalink nella barra degli indirizzi
        history.pushState({ articleSlug }, '', `${articleSlug}.html`);

        // Trova l'indice dell'articolo corrente
        const currentIndex = articles.findIndex(article => article.slug === articleSlug);

        // Costruisci la navigazione per articoli precedenti e successivi
        let navigation = `<hr>`;
        if (currentIndex > 0) {
            const prevArticle = articles[currentIndex - 1];
            navigation += `<a href="#" onclick="event.preventDefault(); loadArticle('${prevArticle.slug}');">Articolo precedente</a> | `;
        }
        if (currentIndex < articles.length - 1) {
            const nextArticle = articles[currentIndex + 1];
            navigation += `<a href="#" onclick="event.preventDefault(); loadArticle('${nextArticle.slug}');">Articolo successivo</a>`;
        }

        // Mostra il contenuto dell'articolo e la navigazione
        articlesDiv.innerHTML = `<div class="article-content">${html}</div>${navigation}`;
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

        // Modifica il permalink nella barra degli indirizzi
        history.pushState({ page: 'contacts' }, '', 'contatti.html');

        // Mostra il contenuto della pagina dei contatti
        articlesDiv.innerHTML = `<div class="article-content">${html}</div>`;
    } catch (error) {
        articlesDiv.innerHTML = `<div class="error">${error.message}</div>`;
    }
}

// Funzione per recuperare la lista degli articoli
async function fetchArticles() {
    try {
        const response = await fetch('https://api.github.com/repos/yuridiprodo/yuridiprodo.github.io/contents/articles');
        if (!response.ok) throw new Error('Impossibile caricare gli articoli');
        const data = await response.json();

        // Filtra per escludere file .DS_Store e ordina per data
        articles = await Promise.all(data
            .filter(article => !article.name.endsWith('.DS_Store'))
            .map(async (article) => {
                const response = await fetch(article.download_url);
                const markdown = await response.text();
                const { data: frontMatter } = parseMarkdown(markdown);

                // Restituisci l'oggetto con informazioni necessarie
                return {
                    name: article.name,
                    title: frontMatter.title || article.name.replace('.md', ''),
                    slug: frontMatter.slug,
                    date: new Date(frontMatter.date) // Assicurati che la data sia un oggetto Date
                };
            })
        );

        // Ordina gli articoli in base alla data
        articles.sort((a, b) => b.date - a.date);

        // Carica i titoli degli articoli
        for (const article of articles) {
            const link = document.createElement('a');
            link.href = article.slug + '.html'; // Usa lo slug per il permalink
            link.innerText = article.title;
            link.title = article.slug + '.html';

            const titleElement = document.createElement('h1');
            titleElement.appendChild(link);
            articlesDiv.appendChild(titleElement);
        }

        // Aggiungi il menu contatti
        const menuContainer = document.getElementById('menu');
        const contactsLink = document.createElement('a');
        contactsLink.innerText = 'Contatti';
        contactsLink.href = 'contatti.html';
        contactsLink.onclick = (event) => {
            event.preventDefault();
            loadContacts();
        };
        menuContainer.appendChild(contactsLink);
    } catch (error) {
        articlesDiv.innerHTML = `<div class="error">${error.message}</div>`;
    }
}

// Funzione per analizzare il markdown e il front matter
function parseMarkdown(markdown) {
    const regex = /^---\n([\s\S]*?)---\n([\s\S]*)/; // Regex per il front matter
    const match = markdown.match(regex);
    if (match) {
        const frontMatter = jsyaml.load(match[1]); // Usa jsyaml.load per il parsing
        const content = match[2];
        return { data: frontMatter, content };
    }
    return { data: {}, content: markdown }; // Se non c'è front matter, restituisci tutto
}

// Gestione del pulsante "indietro" del browser
window.onpopstate = (event) => {
    if (event.state && event.state.articleSlug) {
        loadArticle(event.state.articleSlug);
    } else if (event.state && event.state.page === 'contacts') {
        loadContacts();
    }
};

// Carica la lista degli articoli all'avvio
fetchArticles();
