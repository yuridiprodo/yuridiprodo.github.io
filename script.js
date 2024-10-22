const articlesDiv = document.getElementById('articles');

// Funzione per caricare e visualizzare gli articoli
async function loadArticle(articleName) {
    const response = await fetch(`articles/${articleName}`);
    const markdown = await response.text();
    const html = marked(markdown);
    
    // Modifica il permalink nella barra degli indirizzi
    const permalink = articleName.replace('.md', '.html');
    history.pushState(null, '', permalink);
    
    // Mostra il contenuto dell'articolo sotto la riga di separazione
    articlesDiv.innerHTML = `<div class="article-content">${html}</div>`;
}

// Funzione per recuperare la lista degli articoli
async function fetchArticles() {
    const response = await fetch('https://api.github.com/repos/yuridiprodo/yuridiprodo.github.io/contents/articles');
    const articles = await response.json();

    // Ordina gli articoli dal più recente al meno recente
    articles.sort((a, b) => b.name.localeCompare(a.name));

    // Crea i link agli articoli
    for (const article of articles) {
        const response = await fetch(article.download_url);
        const markdown = await response.text();

        // Estrai l'h1 dal Markdown
        const titleMatch = markdown.match(/# (.+)/);
        const title = titleMatch ? titleMatch[1] : article.name.replace('.md', '');

        const link = document.createElement('a');
        const permalink = article.name.replace('.md', '.html');
        link.href = permalink;  // Imposta il permalink come href
        link.innerText = title;

        // Cambia il tooltip del link per mostrare il permalink
        link.title = permalink; 

        const titleElement = document.createElement('h1');
        titleElement.appendChild(link);

        // Aggiungi l'evento click per caricare l'articolo
        link.addEventListener('click', (event) => {
            event.preventDefault();
            loadArticle(article.name);
        });

        articlesDiv.appendChild(titleElement);
    }
}

// Carica la lista degli articoli all'avvio
fetchArticles();
