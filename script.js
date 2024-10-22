document.addEventListener('DOMContentLoaded', () => {
    const articlesDiv = document.getElementById('articles');
    let articles = []; // Array per memorizzare gli articoli

    // Funzione per caricare e visualizzare gli articoli
    async function loadArticle(slug) {
        try {
            const response = await fetch(`articles/${slug}.md`); // Usa lo slug con .md
            if (!response.ok) throw new Error('File non trovato');
            const markdown = await response.text();
            const { data, content } = parseMarkdown(markdown); // Usa la funzione di parsing

            const html = marked(content);

            // Modifica il permalink nella barra degli indirizzi
            const permalink = `${slug}.html`; // Costruisci il permalink usando lo slug
            history.pushState({ slug }, '', permalink);

            // Trova l'indice dell'articolo corrente
            const currentIndex = articles.findIndex(article => article.slug === slug);

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

            // Ordina gli articoli dal più recente al meno recente
            articles = data.sort((a, b) => b.name.localeCompare(a.name));

            // Carica solo i titoli degli articoli per migliorare le performance
            for (const article of articles) {
                const response = await fetch(article.download_url);
                const markdown = await response.text();
                const { data: frontMatter, content } = parseMarkdown(markdown); // Usa la funzione di parsing
                const title = frontMatter.title || article.name.replace('.md', '');
                const slug = frontMatter.slug || article.name.replace('.md', ''); // Usa lo slug

                const link = document.createElement('a');
                const permalink = `${slug}.html`; // Costruisci il permalink usando lo slug
                link.href = permalink; // Imposta il permalink come href
                link.innerText = title;
                link.title = permalink;

                link.addEventListener('click', (event) => {
                    event.preventDefault();
                    loadArticle(slug); // Passa lo slug
                });

                const titleElement = document.createElement('h1');
                titleElement.appendChild(link);
                articlesDiv.appendChild(titleElement);
            }

            // Modifica il menu per includere il link "Contatti"
            const menuContainer = document.getElementById('menu');
            if (menuContainer) { // Controlla che il menu esista
                const contactsLink = document.createElement('a');
                contactsLink.innerText = 'Contatti';
                contactsLink.href = 'contatti.html'; // Imposta l'url della pagina
                contactsLink.onclick = (event) => {
                    event.preventDefault();
                    loadContacts();
                };
                menuContainer.appendChild(contactsLink);
            }
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
        if (event.state && event.state.slug) {
            loadArticle(event.state.slug); // Usa lo slug
        } else if (event.state && event.state.page === 'contacts') {
            loadContacts();
        }
    };

    // Carica la lista degli articoli all'avvio
    fetchArticles();
});
